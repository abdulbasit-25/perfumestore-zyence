import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import type { Shipment, ShipmentStatus } from "@/lib/shipment-server";
import { getShipments, updateShipment } from "@/lib/shipment-server";

export const Route = createFileRoute("/admin/shipments")({ component: AdminShipments });
const statuses: ShipmentStatus[] = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "OutForDelivery",
  "Delivered",
  "Failed",
  "RTO",
];

function AdminShipments() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Shipment | null>(null);
  const {
    data: shipmentsPage,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["admin-shipments", page],
    queryFn: () => getShipments({ data: { token: undefined, page, pageSize: 25 } }),
  });
  const shipments = shipmentsPage?.items ?? [];
  const columns = useMemo(
    () => [
      { accessorKey: "orderId", header: "Order" },
      { accessorKey: "customerName", header: "Customer" },
      {
        accessorKey: "courier",
        header: "Courier",
        cell: ({ getValue }: { getValue: () => unknown }) => String(getValue() || "—"),
      },
      {
        accessorKey: "trackingNumber",
        header: "Tracking",
        cell: ({ getValue }: { getValue: () => unknown }) => String(getValue() || "—"),
      },
      { accessorKey: "status", header: "Status" },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ getValue }: { getValue: () => unknown }) =>
          new Date(String(getValue())).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }: { row: { original: Shipment } }) => (
          <button className="label-caps text-olive" onClick={() => setSelected(row.original)}>
            Update
          </button>
        ),
      },
    ],
    [],
  );
  return (
    <AdminShell title="Shipments">
      {isPending ? <p className="py-12 text-muted-foreground">Loading shipments...</p> : null}
      {isError ? (
        <p role="alert" className="py-12 text-destructive">
          Unable to load shipments.
        </p>
      ) : null}
      {!isPending && !isError ? (
        <DataTable
          data={shipments}
          columns={columns}
          searchPlaceholder="Search orders, customers or tracking…"
          emptyTitle="No shipments"
          emptyBody="Orders will appear here when they need fulfillment."
          page={shipmentsPage?.page ?? page}
          pageSize={shipmentsPage?.pageSize ?? 25}
          total={shipmentsPage?.total ?? 0}
          onPageChange={setPage}
        />
      ) : null}
      {selected ? (
        <ShipmentDrawer
          shipment={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            void queryClient.invalidateQueries({ queryKey: ["admin-shipments"] });
          }}
        />
      ) : null}
    </AdminShell>
  );
}

function ShipmentDrawer({
  shipment,
  onClose,
  onSaved,
}: {
  shipment: Shipment;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const result = await updateShipment({
        data: {
          token: undefined,
          orderId: shipment.orderId,
          status: String(form.get("status")) as ShipmentStatus,
          courier: String(form.get("courier") ?? ""),
          trackingNumber: String(form.get("trackingNumber") ?? ""),
          expectedDelivery: String(form.get("expectedDelivery") ?? ""),
          deliveryNotes: String(form.get("deliveryNotes") ?? ""),
        },
      });
      if (!result.success) throw new Error(result.message);
      toast.success("Shipment updated");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update shipment");
    } finally {
      setSaving(false);
    }
  };
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
          <div>
            <p className="label-caps text-olive">Shipment</p>
            <h2 className="font-display text-3xl">{shipment.orderId}</h2>
          </div>
          <button onClick={onClose} className="label-caps text-muted-foreground">
            Close
          </button>
        </div>
        <div className="mt-8 space-y-4 text-sm">
          <p>{shipment.customerName}</p>
          <p className="text-muted-foreground">
            {shipment.customerEmail}
            <br />
            {shipment.address}
          </p>
          <form onSubmit={save} className="space-y-4">
            <label className="block">
              Status
              <select
                name="status"
                defaultValue={shipment.status}
                className="mt-1 w-full border border-border bg-background p-2"
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
            <label className="block">
              Courier
              <input
                name="courier"
                defaultValue={shipment.courier}
                className="mt-1 w-full border border-border bg-background p-2"
              />
            </label>
            <label className="block">
              Tracking number
              <input
                name="trackingNumber"
                defaultValue={shipment.trackingNumber}
                className="mt-1 w-full border border-border bg-background p-2"
              />
            </label>
            <label className="block">
              Expected delivery
              <input
                name="expectedDelivery"
                type="date"
                defaultValue={shipment.expectedDelivery}
                className="mt-1 w-full border border-border bg-background p-2"
              />
            </label>
            <label className="block">
              Delivery notes
              <textarea
                name="deliveryNotes"
                defaultValue={shipment.deliveryNotes}
                rows={3}
                className="mt-1 w-full border border-border bg-background p-2"
              />
            </label>
            <button
              disabled={saving}
              className="w-full bg-primary px-4 py-3 text-primary-foreground"
            >
              {saving ? "Saving..." : "Save shipment"}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
