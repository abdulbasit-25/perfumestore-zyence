import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import type { Order, OrderStatus } from "@/lib/catalog-types";
import { getAdminOrders, updateOrderStatus, updatePaymentStatus } from "@/lib/order-server";
import { currency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const statuses: OrderStatus[] = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

export function statusTone(status: OrderStatus) {
  return cn(
    "label-caps px-2 py-1",
    status === "Delivered" && "bg-olive-soft text-foreground",
    status === "Cancelled" && "bg-destructive/10 text-destructive",
    (status === "Pending" || status === "Confirmed" || status === "Shipped") && "bg-surface-2",
  );
}

function AdminOrders() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const {
    data: ordersPage,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["admin-orders", page],
    queryFn: () => getAdminOrders({ data: { token: undefined, page, pageSize: 25 } }),
  });
  const orders = ordersPage?.items ?? [];
  const [selected, setSelected] = useState<Order | null>(null);

  const setStatus = async (order: Order, status: OrderStatus) => {
    try {
      const result = await updateOrderStatus({
        data: { token: undefined, id: order.id, status },
      });
      if (!result.success) throw new Error(result.message);
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setSelected((current) => (current?.id === order.id ? (result.order ?? current) : current));
      toast.success(`${order.id} → ${status}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update order");
    }
  };

  const togglePaid = async (order: Order) => {
    try {
      const result = await updatePaymentStatus({
        data: {
          token: undefined,
          id: order.id,
          paymentStatus: order.paid ? "unpaid" : "paid",
        },
      });
      if (!result.success) throw new Error(result.message);
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update payment");
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "Order" },
      { accessorKey: "customerName", header: "Customer" },
      { accessorKey: "createdAt", header: "Placed" },
      {
        accessorKey: "totalAmount",
        header: "Total",
        cell: ({ getValue }: { getValue: () => unknown }) => currency(Number(getValue())),
      },
      {
        accessorKey: "paid",
        header: "Payment",
        cell: ({ row }: { row: { original: Order } }) => (
          <button
            onClick={() => void togglePaid(row.original)}
            className={cn(
              "label-caps px-2 py-1",
              row.original.paid ? "bg-olive-soft" : "bg-surface-2",
            )}
          >
            {row.original.paid ? "Collected" : "COD due"}
          </button>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: { row: { original: Order } }) => (
          <select
            value={row.original.status}
            onChange={(e) => {
              void setStatus(row.original, e.target.value as OrderStatus);
            }}
            className="border border-border bg-background px-2 py-1 text-xs outline-none focus:border-olive"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }: { row: { original: Order } }) => (
          <button onClick={() => setSelected(row.original)} className="label-caps text-olive">
            View
          </button>
        ),
      },
    ],
    [orders],
  );

  return (
    <AdminShell title="Orders">
      {isPending ? <p className="py-12 text-muted-foreground">Loading orders...</p> : null}
      {isError ? (
        <p role="alert" className="py-12 text-destructive">
          Unable to load orders.
        </p>
      ) : null}
      {!isPending && !isError ? (
        <DataTable
          data={orders}
          columns={columns}
          searchPlaceholder="Search orders, customers…"
          emptyTitle="No orders match"
          emptyBody="Try a different search term."
          page={ordersPage?.page ?? page}
          pageSize={ordersPage?.pageSize ?? 25}
          total={ordersPage?.total ?? 0}
          onPageChange={setPage}
        />
      ) : null}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-foreground/30 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <aside
            className="h-full w-full max-w-md overflow-y-auto bg-background p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="label-caps text-muted-foreground">Order</p>
                <h2 className="font-display text-3xl">{selected.id}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="label-caps text-muted-foreground"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-1 text-sm">
              <p>{selected.customerName}</p>
              <p className="text-muted-foreground">{selected.customerEmail}</p>
              {selected.customerPhone ? (
                <p className="text-muted-foreground">{selected.customerPhone}</p>
              ) : null}
              <p className="mt-3 whitespace-pre-line text-muted-foreground">
                {selected.shippingAddress}
              </p>
            </div>

            <span className={cn("mt-4 inline-block", statusTone(selected.status))}>
              {selected.status}
            </span>

            <table className="mt-6 w-full text-sm">
              <tbody>
                {selected.items.map((item) => (
                  <tr key={item.productId} className="border-b border-border">
                    <td className="py-2">
                      {item.name} × {item.qty}
                    </td>
                    <td className="py-2 text-right">{currency(item.priceAtPurchase * item.qty)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 font-medium">Total ({selected.paymentMethod})</td>
                  <td className="py-2 text-right font-medium">{currency(selected.totalAmount)}</td>
                </tr>
              </tbody>
            </table>

            {selected.notes && (
              <p className="mt-4 border-l-2 border-olive pl-3 text-sm text-muted-foreground">
                {selected.notes}
              </p>
            )}

            <div className="mt-8">
              <p className="label-caps text-muted-foreground">History</p>
              <ol className="mt-3 space-y-2 text-sm">
                {selected.statusHistory.map((entry, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{entry.status}</span>
                    <span className="text-muted-foreground">{entry.at}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      )}
    </AdminShell>
  );
}
