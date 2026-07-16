import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { clients, monthlyRevenue, paymentMethodBreakdown, fmt } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/analytics")({
  component: AnalyticsPage,
});

const chartColors = ["oklch(0.28 0.09 145)", "oklch(0.55 0.12 145)", "oklch(0.88 0.19 132)"];

function AnalyticsPage() {
  const topClients = [...clients].sort((a, b) => b.totalBilled - a.totalBilled).slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Analytics</p>
        <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Analytics</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Revenue trend</h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 130)" />
                <XAxis dataKey="month" stroke="oklch(0.48 0.02 150)" fontSize={12} />
                <YAxis stroke="oklch(0.48 0.02 150)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.01 130)", background: "oklch(1 0 0)" }}
                  formatter={(v: number) => fmt(v)}
                />
                <Bar dataKey="revenue" fill="oklch(0.28 0.09 145)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Payment method mix</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentMethodBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4}>
                  {paymentMethodBreakdown.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                </Pie>
                <Legend />
                <Tooltip formatter={(v: number) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">Top clients by revenue</h2>
        <div className="mt-4 space-y-3">
          {topClients.map((c) => {
            const pct = (c.totalBilled / topClients[0].totalBilled) * 100;
            return (
              <div key={c.id} className="flex items-center gap-4">
                <div className="w-40 truncate text-sm font-medium">{c.company}</div>
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="w-28 text-right text-sm font-medium">{fmt(c.totalBilled)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
