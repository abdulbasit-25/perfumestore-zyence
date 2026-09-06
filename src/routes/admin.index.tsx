import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminShell } from "@/components/admin/admin-shell";
import { currency } from "@/lib/utils";
import { getAdminOrders, getAdminRevenue } from "@/lib/order-server";
import { getProducts } from "@/lib/product-server";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data: ordersPage } = useQuery({
    queryKey: ["admin-overview-orders"],
    queryFn: () => getAdminOrders({ data: { token: undefined, page: 1, pageSize: 50 } }),
  });
  const orders = ordersPage?.items ?? [];

  const { data: salesByMonth = [] } = useQuery({
    queryKey: ["admin-overview-revenue"],
    queryFn: () => getAdminRevenue({ data: { token: undefined } }),
  });

  // Fetch products from server
  const { data: products = [] } = useQuery({
    queryKey: ["admin-overview-products"],
    queryFn: async () => {
      try {
        const result = await getProducts({ data: {} });
        return result;
      } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
      }
    },
  });

  const revenue = salesByMonth.reduce((sum, point) => sum + point.revenue, 0);
  const pending = orders.filter((o) => o.status === "Pending").length;
  const lowStock = products.filter((p) => p.stock <= 5);

  const topProducts = Object.values(
    orders
      .flatMap((o) => o.items)
      .reduce<Record<string, { name: string; units: number }>>((acc, item) => {
        const entry = acc[item.productId] ?? { name: item.name, units: 0 };
        entry.units += item.qty;
        acc[item.productId] = entry;
        return acc;
      }, {}),
  )
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  return (
    <AdminShell title="Overview">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total orders"
          value={String(ordersPage?.total ?? 0)}
          note={`${pending} awaiting confirmation`}
        />
        <Stat label="Revenue" value={currency(revenue)} note="Excludes cancelled orders" />
        <Stat
          label="Products"
          value={String(products.length)}
          note={`${lowStock.length} low on stock`}
        />
        <Stat
          label="Delivered"
          value={String(orders.filter((o) => o.status === "Delivered").length)}
          note="Payment collected"
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[3fr_2fr]">
        <Panel title="Revenue, last 6 months">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={salesByMonth} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-olive)"
                fill="var(--color-olive)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Top-selling products">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 40, right: 8 }}>
              <CartesianGrid stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tickLine={false}
                axisLine={false}
                fontSize={10}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="units" fill="var(--color-olive)" barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Recent orders">
          <ul className="divide-y divide-border text-sm">
            {orders.slice(0, 6).map((order) => (
              <li key={order.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.customerName} · {order.createdAt}
                  </p>
                </div>
                <div className="text-right">
                  <p>{currency(order.totalAmount)}</p>
                  <p className="text-xs text-muted-foreground">{order.status}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/admin/orders" className="label-caps mt-4 inline-block text-olive">
            All orders
          </Link>
        </Panel>

        <Panel title="Low stock alerts">
          {lowStock.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Every product is comfortably stocked.
            </p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {lowStock.map((product) => (
                <li key={product.id} className="flex items-center justify-between py-2.5">
                  <span>{product.name}</span>
                  <span className={product.stock === 0 ? "text-destructive" : "text-olive"}>
                    {product.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AdminShell>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="border border-border bg-card p-4">
      <p className="label-caps text-muted-foreground">{label}</p>
      <p className="mt-3 font-display text-4xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border bg-card p-4">
      <h2 className="label-caps mb-4 text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}
