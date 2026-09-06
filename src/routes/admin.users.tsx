import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import {
  createManagedUser,
  deleteManagedUser,
  getManagedUsers,
  updateManagedUser,
  type ManagedRole,
  type ManagedStatus,
  type ManagedUser,
} from "@/lib/user-server";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });
const roles: ManagedRole[] = ["customer", "manager", "admin"];

function AdminUsers() {
  const client = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const currentUser = useAuth((state) => state.user);
  const {
    data: usersPage,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["admin-users", page],
    queryFn: () => getManagedUsers({ data: { token: undefined, page, pageSize: 25 } }),
    enabled: currentUser?.role === "admin",
  });
  const refresh = () => void client.invalidateQueries({ queryKey: ["admin-users"] });
  if (currentUser?.role !== "admin") {
    return (
      <AdminShell title="Users">
        <div className="border border-border p-8">
          <p className="label-caps text-olive">Restricted</p>
          <h2 className="mt-3 font-display text-3xl">Admin access required</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Only administrators can create or manage user accounts.
          </p>
        </div>
      </AdminShell>
    );
  }
  const update = async (
    user: ManagedUser,
    changes: { role?: ManagedRole; status?: ManagedStatus },
  ) => {
    const result = await updateManagedUser({
      data: { token: undefined, id: user.id, ...changes },
    });
    if (!result.success) toast.error(result.message);
    else {
      toast.success("User updated.");
      refresh();
    }
  };
  const remove = async (user: ManagedUser) => {
    if (!window.confirm(`Delete ${user.name}'s account?`)) return;
    const result = await deleteManagedUser({
      data: { token: undefined, id: user.id },
    });
    if (!result.success) toast.error(result.message);
    else {
      toast.success("User deleted.");
      refresh();
    }
  };

  return (
    <AdminShell title="Users">
      <div className="mb-5 flex justify-end">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Add user
        </button>
      </div>
      {isPending ? <p className="py-12 text-muted-foreground">Loading users...</p> : null}
      {isError ? (
        <p role="alert" className="py-12 text-destructive">
          Unable to load users.
        </p>
      ) : null}
      {!isPending && !isError ? (
        <DataTable
          data={usersPage?.items ?? []}
          columns={[
            { accessorKey: "name", header: "Name" },
            { accessorKey: "email", header: "Email" },
            { accessorKey: "role", header: "Role" },
            { accessorKey: "status", header: "Status" },
            { accessorKey: "createdAt", header: "Created" },
            {
              id: "actions",
              header: "",
              cell: ({ row }: { row: { original: ManagedUser } }) => (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(row.original)}
                    className="label-caps text-olive"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(row.original)}
                    className="label-caps text-destructive"
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          searchPlaceholder="Search users..."
          emptyTitle="No users"
          emptyBody="Registered accounts will appear here."
          page={usersPage?.page ?? page}
          pageSize={usersPage?.pageSize ?? 25}
          total={usersPage?.total ?? 0}
          onPageChange={setPage}
        />
      ) : null}
      {adding ? (
        <UserForm
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            refresh();
          }}
        />
      ) : null}
      {editing ? (
        <EditUser
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      ) : null}
    </AdminShell>
  );
}

function Drawer({
  children,
  title,
  onClose,
}: {
  children: ReactNode;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30" onClick={onClose}>
      <aside
        className="h-full w-full max-w-lg overflow-y-auto bg-background p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between">
          <h2 className="font-display text-3xl">{title}</h2>
          <button type="button" onClick={onClose} className="label-caps text-muted-foreground">
            Close
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

function UserForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [role, setRole] = useState<ManagedRole>("customer");
  const [saving, setSaving] = useState(false);
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const password = String(form.get("password") ?? "");
      if (password !== String(form.get("confirmPassword") ?? "")) {
        toast.error("Passwords do not match.");
        return;
      }
      const result = await createManagedUser({
        data: {
          token: undefined,
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          password,
          role,
        },
      });
      if (!result.success) toast.error(result.message);
      else {
        toast.success("User created.");
        onSaved();
      }
    } finally {
      setSaving(false);
    }
  };
  return (
    <Drawer title="Add user" onClose={onClose}>
      <form onSubmit={save} className="mt-8 space-y-5 text-sm">
        <Field name="name" label="Name" required />
        <Field name="email" label="Email" type="email" required />
        <Field name="password" label="Password" type="password" required />
        <Field name="confirmPassword" label="Confirm password" type="password" required />
        <label className="block">
          Role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as ManagedRole)}
            className="mt-2 w-full border border-border bg-background p-3"
          >
            {roles.map((value) => (
              <option key={value} value={value}>
                {value[0]!.toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <button disabled={saving} className="w-full bg-primary px-4 py-3 text-primary-foreground">
          {saving ? "Creating..." : "Create user"}
        </button>
      </form>
    </Drawer>
  );
}

function EditUser({
  user,
  onClose,
  onSaved,
}: {
  user: ManagedUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState(user.status);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      const result = await updateManagedUser({
        data: { token: undefined, id: user.id, role, status },
      });
      if (!result.success) toast.error(result.message);
      else {
        toast.success("User updated.");
        onSaved();
      }
    } finally {
      setSaving(false);
    }
  };
  return (
    <Drawer title={`Edit ${user.name}`} onClose={onClose}>
      <div className="mt-8 space-y-5 text-sm">
        <p className="text-muted-foreground">{user.email}</p>
        <label className="block">
          Role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as ManagedRole)}
            className="mt-2 w-full border border-border bg-background p-3"
          >
            {roles.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ManagedStatus)}
            className="mt-2 w-full border border-border bg-background p-3"
          >
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="w-full bg-primary px-4 py-3 text-primary-foreground"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </Drawer>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full border border-border bg-background p-3"
      />
    </label>
  );
}
