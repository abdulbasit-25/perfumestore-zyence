import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import type { ReturnRequest, ReturnStatus } from "@/lib/return-server";
import { getReturns, updateReturn } from "@/lib/return-server";
import { currency } from "@/lib/utils";

export const Route = createFileRoute("/admin/returns")({ component: AdminReturns });
const statuses: ReturnStatus[] = [
  "Requested",
  "Approved",
  "Rejected",
  "Received",
  "Refunded",
  "Exchanged",
];

function AdminReturns() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ReturnRequest | null>(null);
  const {
    data: returnsPage,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["admin-returns", page],
    queryFn: () => getReturns({ data: { token: undefined, page, pageSize: 25 } }),
  });
  const returns = returnsPage?.items ?? [];
  const columns = useMemo(
    () => [
      { accessorKey: "orderId", header: "Order" },
      { accessorKey: "customerName", header: "Customer" },
      { accessorKey: "productName", header: "Product" },
      {
        accessorKey: "requestedAmount",
        header: "Amount",
        cell: ({ getValue }: { getValue: () => unknown }) => currency(Number(getValue())),
      },
      { accessorKey: "status", header: "Status" },
      {
        accessorKey: "createdAt",
        header: "Requested",
        cell: ({ getValue }: { getValue: () => unknown }) =>
          new Date(String(getValue())).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }: { row: { original: ReturnRequest } }) => (
          <button className="label-caps text-olive" onClick={() => setSelected(row.original)}>
            Review
          </button>
        ),
      },
    ],
    [],
  );
  return (
    <AdminShell title="Returns & Refunds">
      {isPending ? <p className="py-12 text-muted-foreground">Loading returns...</p> : null}
      {isError ? (
        <p role="alert" className="py-12 text-destructive">
          Unable to load returns.
        </p>
      ) : null}
      {!isPending && !isError ? (
        <DataTable
          data={returns}
          columns={columns}
          searchPlaceholder="Search orders, customers or products…"
          emptyTitle="No return requests"
          emptyBody="Return requests will appear here when submitted."
          page={returnsPage?.page ?? page}
          pageSize={returnsPage?.pageSize ?? 25}
          total={returnsPage?.total ?? 0}
          onPageChange={setPage}
        />
      ) : null}
      {selected ? (
        <ReturnDrawer
          request={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            void queryClient.invalidateQueries({ queryKey: ["admin-returns"] });
          }}
        />
      ) : null}
    </AdminShell>
  );
}

function ReturnDrawer({
  request,
  onClose,
  onSaved,
}: {
  request: ReturnRequest;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const result = await updateReturn({
        data: {
          token: undefined,
          id: request.id,
          status: String(form.get("status")) as ReturnStatus,
          adminNotes: String(form.get("adminNotes") ?? ""),
          refundAmount: Number(form.get("refundAmount")),
        },
      });
      if (!result.success) throw new Error(result.message);
      toast.success("Return updated");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update return");
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
            <p className="label-caps text-olive">Return request</p>
            <h2 className="font-display text-3xl">{request.orderId}</h2>
          </div>
          <button onClick={onClose} className="label-caps text-muted-foreground">
            Close
          </button>
        </div>
        <div className="mt-8 space-y-2 text-sm">
          <p>
            {request.customerName} · {request.productName}
          </p>
          <p className="text-muted-foreground">{request.reason}</p>
          <form onSubmit={save} className="mt-6 space-y-4">
            <label className="block">
              Status
              <select
                name="status"
                defaultValue={request.status}
                className="mt-1 w-full border border-border bg-background p-2"
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
            <label className="block">
              Refund amount
              <input
                name="refundAmount"
                type="number"
                min="0"
                max={request.requestedAmount}
                step="0.01"
                defaultValue={request.requestedAmount}
                className="mt-1 w-full border border-border bg-background p-2"
              />
            </label>
            <label className="block">
              Admin notes
              <textarea
                name="adminNotes"
                defaultValue={request.adminNotes}
                rows={4}
                className="mt-1 w-full border border-border bg-background p-2"
              />
            </label>
            <button
              disabled={saving}
              className="w-full bg-primary px-4 py-3 text-primary-foreground"
            >
              {saving ? "Saving..." : "Save decision"}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
