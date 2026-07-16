import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { transactions, fmt, type TxStatus } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const Route = createFileRoute("/dashboard/transactions")({
  component: TxPage,
});

const statuses: (TxStatus | "All")[] = ["All", "Pending", "Processing", "Approved", "Failed", "Refunded"];

function TxPage() {
  const [q, setQ] = useState("");
  const [s, setS] = useState<TxStatus | "All">("All");
  const filtered = transactions.filter(
    (t) =>
      (s === "All" || t.status === s) &&
      (t.clientName + t.invoiceNumber + t.method).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Transactions</p>
        <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every payment attempt, verified and reconciled automatically.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9" />
        </div>
        {statuses.map((x) => (
          <button
            key={x}
            onClick={() => setS(x)}
            className={
              "rounded-full px-3 py-1.5 text-xs font-medium transition " +
              (s === x
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-secondary")
            }
          >
            {x}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Transaction</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <p className="font-medium">{t.id.toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">{t.invoiceNumber}</p>
                </td>
                <td className="px-4 py-3">{t.clientName}</td>
                <td className="px-4 py-3">{t.method}</td>
                <td className="px-4 py-3 font-medium">{fmt(t.amount, t.currency)}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.date}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
