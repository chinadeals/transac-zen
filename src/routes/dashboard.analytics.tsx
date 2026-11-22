import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, ChartNoAxesCombined, LoaderCircle } from "lucide-react";
import { fmt } from "@/lib/mock-data";
import { docTotal, listDocs, listPayments, type PayDoc, type PaymentRow } from "@/lib/payment-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/analytics")({
  head: () => ({ meta: [
    { title: "Analytics — PayFlow Gateway" },
    { name: "description", content: "Explore recorded payment trends and invoice activity in your PayFlow workspace." },
    { property: "og:title", content: "Analytics — PayFlow Gateway" },
    { property: "og:description", content: "Explore recorded payment trends and invoice activity." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AnalyticsPage,
});

const palette = ["var(--color-chart-1)", "var(--color-chart-3)", "var(--color-chart-2)", "var(--color-chart-4)"];
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function AnalyticsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [invoices, setInvoices] = useState<PayDoc[]>([]);
  const [currency, setCurrency] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([listPayments(), listDocs("invoice")]).then(([nextPayments, nextInvoices]) => {
      if (!active) return;
      setPayments(nextPayments);
      setInvoices(nextInvoices);
      setCurrency(nextInvoices[0]?.currency ?? nextPayments[0]?.currency ?? "USD");
    }).catch(() => {
      if (active) setError(true);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const currencies = useMemo(() => Array.from(new Set([
    ...invoices.map((invoice) => invoice.currency),
    ...payments.map((payment) => payment.currency),
  ])).sort(), [invoices, payments]);
  const currencyPayments = useMemo(() => payments.filter((payment) => payment.currency === currency), [payments, currency]);
  const currencyInvoices = useMemo(() => invoices.filter((invoice) => invoice.currency === currency), [invoices, currency]);
  const approved = useMemo(() => currencyPayments.filter((payment) => payment.status === "Approved"), [currencyPayments]);
  const received = approved.reduce((total, payment) => total + payment.amount, 0);
  const outstanding = currencyInvoices.filter((invoice) => !["paid", "cancelled"].includes(invoice.dbStatus)).reduce((total, invoice) => total + docTotal(invoice), 0);

  const monthly = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      return { key: `${date.getFullYear()}-${date.getMonth()}`, month: monthLabels[date.getMonth()], collected: 0 };
    });
    const lookup = new Map(buckets.map((bucket) => [bucket.key, bucket]));
    for (const payment of approved) {
      const date = new Date(payment.createdAt);
      const bucket = lookup.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (bucket) bucket.collected += payment.amount;
    }
    return buckets;
  }, [approved]);

  const methods = useMemo(() => {
    const groups = new Map<string, number>();
    for (const payment of currencyPayments) {
      const lower = payment.method.toLowerCase();
      const label = lower.includes("pesa") || lower.includes("momo") || lower.includes("airtel") || lower.includes("orange")
        ? "Mobile money"
        : lower.includes("bank") || lower.includes("wire")
          ? "Bank transfer"
          : lower.includes("btc") || lower.includes("eth") || lower.includes("usdt")
            ? "Digital currency"
            : "Card";
      groups.set(label, (groups.get(label) ?? 0) + 1);
    }
    return Array.from(groups, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [currencyPayments]);

  const topClients = useMemo(() => {
    const grouped = new Map<string, { name: string; value: number; count: number }>();
    for (const invoice of currencyInvoices) {
      const key = (invoice.clientEmail || invoice.clientName).trim().toLowerCase();
      const current = grouped.get(key) ?? { name: invoice.clientName, value: 0, count: 0 };
      current.value += docTotal(invoice);
      current.count += 1;
      grouped.set(key, current);
    }
    return Array.from(grouped.values()).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [currencyInvoices]);

  if (loading) return <div className="flex items-center gap-3 py-16 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading payment analytics…</div>;
  if (error) return <div className="border-y border-border py-14 text-center text-sm text-muted-foreground">Analytics could not be loaded. Check your connection and try again.</div>;

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Workspace / Performance</p>
          <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Analytics</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Payment activity recorded in your workspace.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase text-muted-foreground">Currency</span>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>{currencies.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid gap-4 border-b border-border pb-6 sm:grid-cols-3">
        <Summary label="Collected" value={fmt(received, currency)} />
        <Summary label="Outstanding invoices" value={fmt(outstanding, currency)} />
        <Summary label="Payment attempts" value={String(currencyPayments.length)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.8fr)]">
        <section className="min-w-0 border-y border-border py-5 sm:py-6">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="font-display text-lg font-semibold">Collected over time</h2><p className="mt-1 text-xs text-muted-foreground">Approved payments · last six months · {currency}</p></div>
            <ChartNoAxesCombined className="h-5 w-5 text-primary" />
          </div>
          {approved.length ? (
            <div className="mt-5 h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <defs><linearGradient id="analyticsCollected" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.22} /><stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 5" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => fmt(value, currency)} />
                  <Area type="monotone" dataKey="collected" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#analyticsCollected)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyChart message="Approved payments in this currency will appear here." />}
        </section>

        <section className="min-w-0 border-y border-border py-5 sm:py-6">
          <div><h2 className="font-display text-lg font-semibold">Attempts by method</h2><p className="mt-1 text-xs text-muted-foreground">Recorded attempts · {currency}</p></div>
          {methods.length ? <>
            <div className="mt-3 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={methods} dataKey="value" nameKey="name" innerRadius={49} outerRadius={73} paddingAngle={3}>{methods.map((method, index) => <Cell key={method.name} fill={palette[index % palette.length]} />)}</Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="divide-y divide-border">
              {methods.map((method, index) => <li key={method.name} className="flex items-center justify-between py-2 text-sm"><span className="flex items-center gap-2 text-muted-foreground"><span className="h-2 w-2 rounded-full" style={{ background: palette[index % palette.length] }} />{method.name}</span><span className="font-medium tabular-nums">{method.value}</span></li>)}
            </ul>
          </> : <EmptyChart message="Recorded attempts will be grouped by payment method." />}
        </section>
      </div>

      <section className="border-t border-border pt-6">
        <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="font-display text-lg font-semibold">Invoice activity by client</h2><p className="mt-1 text-xs text-muted-foreground">Invoice totals in {currency}</p></div><span className="text-xs text-muted-foreground">{topClients.length} client{topClients.length === 1 ? "" : "s"}</span></div>
        {topClients.length ? <div className="divide-y divide-border border-y border-border">
          {topClients.map((client) => {
            const percent = topClients[0]?.value ? Math.round((client.value / topClients[0].value) * 100) : 0;
            return <div key={client.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-4 sm:grid-cols-[minmax(140px,0.65fr)_minmax(80px,1fr)_auto]">
              <span className="truncate text-sm font-medium">{client.name}</span>
              <span className="h-1.5 overflow-hidden rounded-sm bg-secondary"><span className="block h-full rounded-sm bg-primary" style={{ width: `${percent}%` }} /></span>
              <span className="text-right text-sm font-medium tabular-nums">{fmt(client.value, currency)} <span className="ml-1 text-xs font-normal text-muted-foreground">· {client.count} invoice{client.count === 1 ? "" : "s"}</span></span>
            </div>;
          })}
        </div> : <div className="border-y border-border py-10 text-sm text-muted-foreground">Invoices in this currency will appear here.</div>}
      </section>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 border-l border-border pl-4 first:border-l-0 first:pl-0"><p className="text-xs uppercase text-muted-foreground">{label}</p><p className="mt-2 truncate font-display text-2xl font-semibold tabular-nums">{value}</p></div>;
}

function EmptyChart({ message }: { message: string }) {
  return <div className="mt-4 flex min-h-48 items-center justify-center border-y border-dashed border-border px-6 text-center text-sm text-muted-foreground">{message}</div>;
}