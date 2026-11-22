import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, Search } from "lucide-react";
import { type TxStatus, fmt } from "@/lib/mock-data";
import { listPayments, type PaymentRow } from "@/lib/payment-store";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dashboard/transactions")({
  head: () => ({ meta: [
    { title: "Transactions — PayFlow Gateway" },
    { name: "description", content: "Search and review payment activity recorded in your workspace." },
    { property: "og:title", content: "Transactions — PayFlow Gateway" },
    { property: "og:description", content: "Review recorded payment attempts, methods, amounts, and statuses." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: TxPage,
});

const statuses: (TxStatus | "All")[] = ["All", "Pending", "Processing", "Approved", "Failed", "Refunded"];

function TxPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TxStatus | "All">("All");
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setPayments(await listPayments());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const filtered = useMemo(() => payments.filter((payment) =>
    (status === "All" || payment.status === status) &&
    `${payment.txRef ?? ""} ${payment.clientName ?? ""} ${payment.invoiceNumber ?? ""} ${payment.method}`.toLowerCase().includes(q.toLowerCase()),
  ), [payments, q, status]);

  const counts = useMemo(() => ({
    total: payments.length,
    approved: payments.filter((payment) => payment.status === "Approved").length,
    pending: payments.filter((payment) => payment.status === "Pending" || payment.status === "Processing").length,
  }), [payments]);

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Payments / Activity</p>
          <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Transactions</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Recorded payment attempts and their latest status.</p>
        </div>
        <Button variant="outline" onClick={() => void refresh()} disabled={loading}>
          <ArrowDownToLine className="mr-2 h-4 w-4" /> Refresh activity
        </Button>
      </header>

      <div className="grid gap-4 border-b border-border pb-6 sm:grid-cols-3">
        <Summary label="Recorded attempts" value={String(counts.total)} />
        <Summary label="Approved" value={String(counts.approved)} />
        <Summary label="In progress" value={String(counts.pending)} />
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-sm">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search transactions" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search reference, client, invoice…" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Filter transactions by status">
          {statuses.map((item) => (
            <Button key={item} type="button" variant={status === item ? "default" : "outline"} size="sm" className="rounded-sm" aria-pressed={status === item} onClick={() => setStatus(item)}>
              {item}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="border-y border-border py-14 text-center text-sm text-muted-foreground">Loading payment activity…</div>
      ) : error ? (
        <div className="border-y border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">Payment activity could not be loaded.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => void refresh()}>Try again</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border-y border-border py-14 text-center text-sm text-muted-foreground">
          {payments.length ? "No payment attempts match this search." : "No payment attempts have been recorded yet."}
        </div>
      ) : (
        <div className="overflow-x-auto border-y border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((payment) => (
                <tr key={payment.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-4 py-4">
                    <p className="font-mono text-xs font-medium">{payment.txRef ?? payment.id.slice(0, 10).toUpperCase()}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{payment.invoiceNumber ?? "No invoice reference"}</p>
                  </td>
                  <td className="px-4 py-4">{payment.clientName ?? "—"}</td>
                  <td className="px-4 py-4">{payment.method}</td>
                  <td className="px-4 py-4 text-right font-medium tabular-nums">{fmt(payment.amount, payment.currency)}</td>
                  <td className="px-4 py-4 text-muted-foreground">{new Date(payment.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-4"><StatusBadge status={payment.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="border-l border-border pl-4 first:border-l-0 first:pl-0"><p className="text-xs uppercase text-muted-foreground">{label}</p><p className="mt-2 font-display text-2xl font-semibold tabular-nums">{value}</p></div>;
}