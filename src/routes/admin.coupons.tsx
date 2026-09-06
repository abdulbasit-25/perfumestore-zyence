import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import type { Coupon } from "@/lib/coupon-server";
import { deleteCoupon, getCoupons, saveCoupon } from "@/lib/coupon-server";
import { currency } from "@/lib/utils";

export const Route = createFileRoute("/admin/coupons")({ component: AdminCoupons });
const iso = (date: Date) => date.toISOString().slice(0, 16);

function AdminCoupons() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    data: coupons = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: () => getCoupons({ data: { token: undefined } }),
  });
  const remove = async (coupon: Coupon) => {
    if (!confirm(`Delete ${coupon.code}?`)) return;
    const result = await deleteCoupon({
      data: { token: undefined, id: coupon.id },
    });
    if (!result.success) toast.error(result.message);
    else {
      toast.success("Coupon deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    }
  };
  return (
    <AdminShell title="Coupons">
      <div className="mb-5 flex justify-end">
        <button
          className="bg-primary px-4 py-2 text-sm text-primary-foreground"
          onClick={() => {
            setEditing(null);
            setDrawerOpen(true);
          }}
        >
          New coupon
        </button>
      </div>
      {isPending ? <p className="py-12 text-muted-foreground">Loading coupons...</p> : null}
      {isError ? (
        <p role="alert" className="py-12 text-destructive">
          Unable to load coupons.
        </p>
      ) : null}
      {!isPending && !isError ? (
        <DataTable
          data={coupons}
          columns={[
            { accessorKey: "code", header: "Code" },
            { accessorKey: "discountType", header: "Type" },
            {
              accessorKey: "value",
              header: "Value",
              cell: ({ row }: { row: { original: Coupon } }) =>
                row.original.discountType === "percentage"
                  ? `${row.original.value}%`
                  : row.original.discountType === "fixed"
                    ? currency(row.original.value)
                    : "Free shipping",
            },
            { accessorKey: "usageCount", header: "Uses" },
            {
              accessorKey: "expiresAt",
              header: "Expires",
              cell: ({ getValue }: { getValue: () => unknown }) =>
                new Date(String(getValue())).toLocaleDateString(),
            },
            { accessorKey: "active", header: "Active" },
            {
              id: "actions",
              header: "",
              cell: ({ row }: { row: { original: Coupon } }) => (
                <div className="flex gap-3">
                  <button
                    className="label-caps text-olive"
                    onClick={() => {
                      setEditing(row.original);
                      setDrawerOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="label-caps text-destructive"
                    onClick={() => void remove(row.original)}
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          searchPlaceholder="Search coupon codes…"
          emptyTitle="No coupons"
          emptyBody="Create a coupon to offer a discount at checkout."
        />
      ) : null}
      <CouponDrawer
        open={drawerOpen}
        coupon={editing}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        onSaved={() => {
          setDrawerOpen(false);
          setEditing(null);
          void queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
        }}
      />
    </AdminShell>
  );
}

function CouponDrawer({
  open,
  coupon,
  onClose,
  onSaved,
}: {
  open: boolean;
  coupon: Coupon | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const result = await saveCoupon({
        data: {
          token: undefined,
          ...(coupon ? { id: coupon.id } : {}),
          coupon: {
            code: String(form.get("code")),
            discountType: String(form.get("discountType")) as Coupon["discountType"],
            value: Number(form.get("value")),
            minimumOrderAmount: Number(form.get("minimumOrderAmount")),
            usageLimit: String(form.get("usageLimit")) ? Number(form.get("usageLimit")) : null,
            startsAt: new Date(String(form.get("startsAt"))).toISOString(),
            expiresAt: new Date(String(form.get("expiresAt"))).toISOString(),
            active: form.get("active") === "on",
          },
        },
      });
      if (!result.success) throw new Error(result.message);
      toast.success("Coupon saved");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save coupon");
    } finally {
      setSaving(false);
    }
  };
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-foreground/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        className="h-full w-full max-w-lg overflow-y-auto bg-background p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between">
          <h2 className="font-display text-3xl">{coupon ? "Edit coupon" : "New coupon"}</h2>
          <button type="button" onClick={onClose} className="label-caps text-muted-foreground">
            Close
          </button>
        </div>
        <form onSubmit={save} className="mt-8 space-y-4 text-sm">
          <label className="block">
            Code
            <input
              name="code"
              required
              defaultValue={coupon?.code}
              className="mt-1 w-full border border-border bg-background p-2 uppercase"
            />
          </label>
          <label className="block">
            Type
            <select
              name="discountType"
              defaultValue={coupon?.discountType ?? "percentage"}
              className="mt-1 w-full border border-border bg-background p-2"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
              <option value="free_shipping">Free shipping</option>
            </select>
          </label>
          <label className="block">
            Value
            <input
              name="value"
              type="number"
              min="0.01"
              step="0.01"
              required
              defaultValue={coupon?.value ?? 10}
              className="mt-1 w-full border border-border bg-background p-2"
            />
          </label>
          <label className="block">
            Minimum order
            <input
              name="minimumOrderAmount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={coupon?.minimumOrderAmount ?? 0}
              className="mt-1 w-full border border-border bg-background p-2"
            />
          </label>
          <label className="block">
            Usage limit
            <input
              name="usageLimit"
              type="number"
              min="1"
              step="1"
              defaultValue={coupon?.usageLimit ?? ""}
              className="mt-1 w-full border border-border bg-background p-2"
            />
          </label>
          <label className="block">
            Starts
            <input
              name="startsAt"
              type="datetime-local"
              required
              defaultValue={coupon ? iso(new Date(coupon.startsAt)) : iso(new Date())}
              className="mt-1 w-full border border-border bg-background p-2"
            />
          </label>
          <label className="block">
            Expires
            <input
              name="expiresAt"
              type="datetime-local"
              required
              defaultValue={
                coupon ? iso(new Date(coupon.expiresAt)) : iso(new Date(Date.now() + 30 * 86400000))
              }
              className="mt-1 w-full border border-border bg-background p-2"
            />
          </label>
          <label className="flex gap-2">
            <input name="active" type="checkbox" defaultChecked={coupon?.active ?? true} /> Active
          </label>
          <button disabled={saving} className="w-full bg-primary px-4 py-3 text-primary-foreground">
            {saving ? "Saving..." : "Save coupon"}
          </button>
        </form>
      </aside>
    </div>
  );
}
