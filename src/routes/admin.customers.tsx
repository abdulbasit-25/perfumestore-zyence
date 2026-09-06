import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import type { AdminCustomer, AdminCustomerDetails } from "@/lib/customer-server";
import { getAdminCustomer, getAdminCustomers } from "@/lib/customer-server";
import { currency } from "@/lib/utils";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

function displayDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function AdminCustomers() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const {
    data: customersPage,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["admin-customers", page],
    queryFn: () => getAdminCustomers({ data: { token: undefined, page, pageSize: 25 } }),
  });
  const customers = customersPage?.items ?? [];
  const { data: selected, isPending: detailsPending } = useQuery({
    queryKey: ["admin-customer", selectedId],
    queryFn: () =>
      getAdminCustomer({
        data: { token: undefined, id: selectedId ?? "" },
      }),
    enabled: Boolean(selectedId),
  });

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Customer" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ getValue }: { getValue: () => unknown }) => String(getValue() || "—"),
      },
      { accessorKey: "orderCount", header: "Orders" },
      {
        accessorKey: "totalSpent",
        header: "Total spent",
        cell: ({ getValue }: { getValue: () => unknown }) => currency(Number(getValue())),
      },
      {
        accessorKey: "lastOrder",
        header: "Last order",
        cell: ({ getValue }: { getValue: () => unknown }) => displayDate(String(getValue() || "")),
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ getValue }: { getValue: () => unknown }) => displayDate(String(getValue() || "")),
      },
      { accessorKey: "status", header: "Status" },
      {
        id: "actions",
        header: "",
        cell: ({ row }: { row: { original: AdminCustomer } }) => (
          <button onClick={() => setSelectedId(row.original.id)} className="label-caps text-olive">
            View details
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <AdminShell title="Customers">
      {isPending ? <p className="py-12 text-muted-foreground">Loading customers...</p> : null}
      {isError ? (
        <p role="alert" className="py-12 text-destructive">
          Unable to load customers from MongoDB.
        </p>
      ) : null}
      {!isPending && !isError ? (
        <DataTable
          data={customers}
          columns={columns}
          searchPlaceholder="Search name, email or phone…"
          emptyTitle="No registered customers"
          emptyBody="Customers will appear here after they create an account."
          page={customersPage?.page ?? page}
          pageSize={customersPage?.pageSize ?? 25}
          total={customersPage?.total ?? 0}
          onPageChange={setPage}
        />
      ) : null}
      {selectedId ? (
        <CustomerDetails
          customer={selected ?? null}
          isPending={detailsPending}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </AdminShell>
  );
}

function CustomerDetails({
  customer,
  isPending,
  onClose,
}: {
  customer: AdminCustomerDetails | null;
  isPending: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-foreground/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        className="h-full w-full max-w-xl overflow-y-auto bg-background p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="label-caps text-olive">Customer details</p>
            <h2 className="font-display text-3xl">{customer?.name ?? "Customer"}</h2>
          </div>
          <button onClick={onClose} className="label-caps text-muted-foreground">
            Close
          </button>
        </div>
        {isPending ? (
          <p className="py-12 text-muted-foreground">Loading customer history...</p>
        ) : null}
        {customer ? (
          <>
            <div className="mt-6 grid gap-3 border-y border-border py-5 text-sm sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Email</span>
                <br />
                {customer.email}
              </p>
              <p>
                <span className="text-muted-foreground">Phone</span>
                <br />
                {customer.phone || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Customer ID</span>
                <br />
                {customer.id}
              </p>
              <p>
                <span className="text-muted-foreground">Status</span>
                <br />
                {customer.status}
              </p>
              <p>
                <span className="text-muted-foreground">Joined</span>
                <br />
                {displayDate(customer.createdAt)}
              </p>
              <p>
                <span className="text-muted-foreground">Address</span>
                <br />
                {customer.address || "No order address yet"}
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Metric label="Orders" value={String(customer.orderCount)} />
              <Metric label="Spent" value={currency(customer.totalSpent)} />
              <Metric label="Average" value={currency(customer.averageOrderValue)} />
              <Metric label="Last order" value={displayDate(customer.lastOrder)} />
            </div>
            <h3 className="mt-10 font-display text-2xl">Previous orders</h3>
            {customer.orders.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                This customer has not placed an order yet.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-border border-y border-border">
                {customer.orders.map((order) => (
                  <div key={order.id} className="py-4 text-sm">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-muted-foreground">
                          {displayDate(order.createdAt)} · {order.status}
                        </p>
                      </div>
                      <p>{currency(order.totalAmount)}</p>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      {order.items.map((item) => `${item.name} × ${item.qty}`).join(", ")}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.paid ? "Paid" : "Payment due"} · {order.shippingAddress}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </aside>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-2 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
