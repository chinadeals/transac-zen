import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Clock,
  FileText,
  Plus,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { fmt } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { CreateDocDialog } from "@/components/create-doc-dialog";
import { getMerchantStats, type MerchantStats } from "@/lib/payment-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Overview — PayFlow Gateway" },
      { name: "description", content: "Live revenue, outstanding invoices, and payment activity for your business." },
      { property: "og:title", content: "Overview — PayFlow Gateway" },
      { property: "og:description", content: "Live revenue and payment activity for your business." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OverviewPage,
});

const chartColors = ["oklch(0.28 0.09 145)", "oklch(0.55 0.12 145)", "oklch(0.88 0.19 132)", "oklch(0.7 0.1 200)"];

function OverviewPage() {
  const { user } = useCurrentUser();
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<null | "invoice" | "quotation">(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      getMerchantStats()
        .then((s) => alive && setStats(s))
        .catch(() => undefined)
        .finally(() => alive && setLoading(false));
    };
    load();
    window.addEventListener("payflow:docs-changed", load);
    return () => {
      alive = false;
      window.removeEventListener("payflow:docs-changed", load);
    };
  }, []);

  const name = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0];
  const c = stats?.currency ?? "USD";
  const hasData = !!stats && (stats.invoiceCount > 0 || stats.quotationCount > 0);

  return (
    <div className="space-y-6">
      <OnboardingWizard />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Overview</p>
          <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">
            {name ? `Welcome back, ${name}` : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything here is live data from your own account.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDialog("quotation")}>
            <FileText className="mr-1 h-4 w-4" /> New quotation
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setDialog("invoice")}>
            <Plus className="mr-1 h-4 w-4" /> New invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={Wallet}
          label="Collected revenue"
          value={loading ? "—" : fmt(stats?.revenue ?? 0, c)}
          hint={`${stats?.successful ?? 0} successful payments`}
        />
        <Kpi
          icon={Clock}
          label="Outstanding"
          value={loading ? "—" : fmt(stats?.outstanding ?? 0, c)}
          hint={`${stats?.invoiceCount ?? 0} invoices issued`}
        />
        <Kpi
          icon={TrendingUp}
          label="In progress"
          value={loading ? "—" : String(stats?.pending ?? 0)}
          hint={`${stats?.failed ?? 0} failed attempts`}
        />
        <Kpi
          icon={Users}
          label="Clients billed"
          value={loading ? "—" : String(stats?.clientCount ?? 0)}
          hint={`${stats?.quotationCount ?? 0} quotations sent`}
        />
      </div>

      {!loading && !hasData && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <Receipt className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-xl font-bold">Your dashboard is ready</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            No numbers to show yet — that's expected on a brand-new account. Create your first
            invoice and every chart below fills in with real data as clients pay.
          </p>
          <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setDialog("invoice")}>
            <Plus className="mr-1 h-4 w-4" /> Create your first invoice
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Collected — last 6 months</h2>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthly ?? []}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.28 0.09 145)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.28 0.09 145)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 145)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => fmt(v, c)} />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.28 0.09 145)" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Payment rails</h2>
          {stats?.methodBreakdown.length ? (
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.methodBreakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                    {stats.methodBreakdown.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Once your first payment settles you'll see the split between mobile money, crypto,
              cards and bank rails here.
            </p>
          )}
          <ul className="mt-2 space-y-1 text-sm">
            {(stats?.methodBreakdown ?? []).map((m, i) => (
              <li key={m.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: chartColors[i % chartColors.length] }} />
                  {m.name}
                </span>
                <span className="font-medium">{m.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-display text-lg font-bold">Recent payments</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard/transactions">
              View all <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
        {stats?.recent.length ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.recent.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs">{p.txRef ?? p.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{p.clientName ?? "—"}</td>
                  <td className="px-4 py-3">{p.method}</td>
                  <td className="px-4 py-3 font-medium">{fmt(p.amount, p.currency)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No payments recorded yet.
          </p>
        )}
      </div>

      <CreateDocDialog
        open={dialog !== null}
        onOpenChange={(v) => setDialog(v ? dialog : null)}
        kind={dialog ?? "invoice"}
      />
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
