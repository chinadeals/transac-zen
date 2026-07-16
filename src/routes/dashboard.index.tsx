import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  FileText,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Pie,
  PieChart,
  Legend,
} from "recharts";
import {
  monthlyRevenue,
  paymentMethodBreakdown,
  stats,
  transactions,
  fmt,
} from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/")({
  component: Overview,
});

const kpi = [
  { label: "Total revenue", value: fmt(stats.totalRevenue), delta: "+26.4%", icon: DollarSign, tone: "text-primary" },
  { label: "Successful", value: stats.successful.toString(), delta: "+12", icon: CheckCircle2, tone: "text-success" },
  { label: "Pending", value: stats.pending.toString(), delta: "+3", icon: Clock, tone: "text-warning-foreground" },
  { label: "Failed", value: stats.failed.toString(), delta: "-2", icon: XCircle, tone: "text-destructive" },
];

const chartColors = ["oklch(0.28 0.09 145)", "oklch(0.55 0.12 145)", "oklch(0.88 0.19 132)"];

function Overview() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Overview</p>
          <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Good morning, Ada 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's what's happening across your accounts today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Export</Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
            <Link to="/dashboard/invoices">New invoice</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpi.map((k) => (
          <div key={k.label} className="stat-tile">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{k.label}</p>
              <k.icon className={"h-4 w-4 " + k.tone} />
            </div>
            <p className="mt-4 font-display text-3xl font-bold">{k.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className={k.tone}>{k.delta}</span> vs last period
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">Revenue</h2>
              <p className="text-xs text-muted-foreground">Last 7 months</p>
            </div>
            <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
              ↑ 26.4%
            </span>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.28 0.09 145)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.28 0.09 145)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 130)" />
                <XAxis dataKey="month" stroke="oklch(0.48 0.02 150)" fontSize={12} />
                <YAxis stroke="oklch(0.48 0.02 150)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(0.9 0.01 130)",
                    background: "oklch(1 0 0)",
                  }}
                  formatter={(v: number) => fmt(v)}
                />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.28 0.09 145)" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Payment methods</h2>
          <p className="text-xs text-muted-foreground">Share of processed volume</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {paymentMethodBreakdown.map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v: number) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Recent transactions</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/transactions">
                View all <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Method</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.slice(0, 6).map((t) => (
                  <tr key={t.id}>
                    <td className="py-3">
                      <p className="font-medium">{t.clientName}</p>
                      <p className="text-xs text-muted-foreground">{t.invoiceNumber}</p>
                    </td>
                    <td className="py-3">{t.method}</td>
                    <td className="py-3 font-medium">{fmt(t.amount, t.currency)}</td>
                    <td className="py-3"><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active clients</p>
                <p className="font-display text-2xl font-bold">{stats.activeClients}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className="font-display text-2xl font-bold">{fmt(stats.outstanding)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
            <p className="font-display font-bold">Connect Lovable Cloud</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Turn on backend to persist clients, invoices, and process real payments.
            </p>
            <Button size="sm" className="mt-3 bg-primary text-primary-foreground hover:bg-primary/90">
              Enable backend
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
