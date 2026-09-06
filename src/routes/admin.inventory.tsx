import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import type { InventoryItem } from "@/lib/inventory-server";
import { adjustInventory, getInventory, getInventoryMovements } from "@/lib/inventory-server";
import { cn, currency } from "@/lib/utils";

export const Route = createFileRoute("/admin/inventory")({ component: AdminInventory });

type Filter = "all" | "low" | "out";

function AdminInventory() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null);
  const {
    data: items = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["admin-inventory", filter],
    queryFn: () => getInventory({ data: { token: undefined, filter } }),
  });
  const totals = useMemo(
    () => ({
      value: items.reduce((sum, item) => sum + item.inventoryValue, 0),
      low: items.filter((item) => item.status === "Low stock").length,
      out: items.filter((item) => item.status === "Out of stock").length,
    }),
    [items],
  );
  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Product" },
      { accessorKey: "sku", header: "SKU" },
      { accessorKey: "category", header: "Category" },
      { accessorKey: "stock", header: "Stock" },
      { accessorKey: "restockThreshold", header: "Threshold" },
      {
        accessorKey: "price",
        header: "Unit price",
        cell: ({ getValue }: { getValue: () => unknown }) => currency(Number(getValue())),
      },
      {
        accessorKey: "inventoryValue",
        header: "Inventory value",
        cell: ({ getValue }: { getValue: () => unknown }) => currency(Number(getValue())),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }: { getValue: () => unknown }) => (
          <span
            className={cn(
              "label-caps",
              getValue() === "Out of stock" && "text-destructive",
              getValue() === "Low stock" && "text-olive",
            )}
          >
            {String(getValue())}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }: { row: { original: InventoryItem } }) => (
          <div className="flex gap-3">
            <button className="label-caps text-olive" onClick={() => setAdjusting(row.original)}>
              Adjust
            </button>
            <button
              className="label-caps text-muted-foreground"
              onClick={() => setSelected(row.original)}
            >
              History
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminShell title="Inventory">
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Summary label="Inventory value" value={currency(totals.value)} />
        <Summary label="Low stock" value={String(totals.low)} />
        <Summary label="Out of stock" value={String(totals.out)} />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "low", "out"] as Filter[]).map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              "label-caps border border-border px-3 py-2",
              filter === value && "bg-olive-soft",
            )}
          >
            {value === "all" ? "All products" : value === "low" ? "Low stock" : "Out of stock"}
          </button>
        ))}
      </div>
      {isPending ? <p className="py-12 text-muted-foreground">Loading inventory...</p> : null}
      {isError ? (
        <p role="alert" className="py-12 text-destructive">
          Unable to load inventory from MongoDB.
        </p>
      ) : null}
      {!isPending && !isError ? (
        <DataTable
          data={items}
          columns={columns}
          searchPlaceholder="Search products or SKU…"
          emptyTitle="No inventory matches"
          emptyBody="Products will appear here when they are active."
        />
      ) : null}
      {selected ? <MovementDrawer item={selected} onClose={() => setSelected(null)} /> : null}
      {adjusting ? (
        <AdjustmentDrawer
          item={adjusting}
          onClose={() => setAdjusting(null)}
          onSaved={() => {
            setAdjusting(null);
            void queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
          }}
        />
      ) : null}
    </AdminShell>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}

function MovementDrawer({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const { data: movements = [], isPending } = useQuery({
    queryKey: ["inventory-movements", item.id],
    queryFn: () =>
      getInventoryMovements({
        data: { token: undefined, productId: item.id },
      }),
  });
  return (
    <Drawer title={`${item.name} history`} onClose={onClose}>
      {isPending ? (
        <p className="py-8 text-muted-foreground">Loading history...</p>
      ) : movements.length === 0 ? (
        <p className="py-8 text-muted-foreground">No stock adjustments recorded.</p>
      ) : (
        <div className="divide-y divide-border">
          {movements.map((movement) => (
            <div key={movement.id} className="py-4 text-sm">
              <div className="flex justify-between">
                <span className={movement.delta > 0 ? "text-olive" : "text-destructive"}>
                  {movement.delta > 0 ? "+" : ""}
                  {movement.delta} units
                </span>
                <span>{new Date(movement.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-1">{movement.reason}</p>
              {movement.note ? <p className="text-muted-foreground">{movement.note}</p> : null}
              <p className="text-xs text-muted-foreground">
                {movement.previousStock} → {movement.newStock}
              </p>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}

function AdjustmentDrawer({
  item,
  onClose,
  onSaved,
}: {
  item: InventoryItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const mode = String(form.get("mode")) === "remove" ? -1 : 1;
    const quantity = Number(form.get("quantity"));
    setSaving(true);
    try {
      const result = await adjustInventory({
        data: {
          token: undefined,
          productId: item.id,
          delta: mode * quantity,
          reason: String(form.get("reason") ?? ""),
          note: String(form.get("note") ?? ""),
          restockThreshold: Number(form.get("threshold")),
        },
      });
      if (!result.success) throw new Error(result.message);
      toast.success("Inventory updated");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update inventory");
    } finally {
      setSaving(false);
    }
  };
  return (
    <Drawer title={`Adjust ${item.name}`} onClose={onClose}>
      <form onSubmit={save} className="space-y-4 text-sm">
        <label className="block">
          Direction
          <select name="mode" className="mt-1 w-full border border-border bg-background p-2">
            <option value="add">Add stock</option>
            <option value="remove">Remove stock</option>
          </select>
        </label>
        <label className="block">
          Quantity
          <input
            name="quantity"
            type="number"
            min="1"
            step="1"
            required
            className="mt-1 w-full border border-border bg-background p-2"
          />
        </label>
        <label className="block">
          Restock threshold
          <input
            name="threshold"
            type="number"
            min="0"
            step="1"
            defaultValue={item.restockThreshold}
            required
            className="mt-1 w-full border border-border bg-background p-2"
          />
        </label>
        <label className="block">
          Reason
          <input
            name="reason"
            required
            placeholder="Receiving, damage, correction..."
            className="mt-1 w-full border border-border bg-background p-2"
          />
        </label>
        <label className="block">
          Note
          <textarea
            name="note"
            rows={3}
            className="mt-1 w-full border border-border bg-background p-2"
          />
        </label>
        <button
          disabled={saving}
          className="w-full bg-primary px-4 py-3 text-primary-foreground disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save adjustment"}
        </button>
      </form>
    </Drawer>
  );
}

function Drawer({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-foreground/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        className="h-full w-full max-w-lg overflow-y-auto bg-background p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-8 flex items-start justify-between">
          <h2 className="font-display text-3xl">{title}</h2>
          <button onClick={onClose} className="label-caps text-muted-foreground">
            Close
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
