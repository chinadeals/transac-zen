import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, ExternalLink, Plus } from "lucide-react";
import { quotations, fmt } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { CreateDocDialog } from "@/components/create-doc-dialog";
import { listDocs, payLink, docTotal, type PayDoc } from "@/lib/payment-store";

export const Route = createFileRoute("/dashboard/quotations")({
  component: QuotationsPage,
});

function QuotationsPage() {
  const [open, setOpen] = useState(false);
  const [userDocs, setUserDocs] = useState<PayDoc[]>([]);

  useEffect(() => {
    const refresh = () => setUserDocs(listDocs().filter((d) => d.kind === "quotation"));
    refresh();
    window.addEventListener("payflow:docs-changed", refresh);
    return () => window.removeEventListener("payflow:docs-changed", refresh);
  }, []);

  const copyLink = (token: string) => navigator.clipboard.writeText(payLink(token));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Quotations</p>
          <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Quotations</h1>
          <p className="mt-1 text-sm text-muted-foreground">Draft, send, and track approval status.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New quotation
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Total", v: quotations.length + userDocs.length },
          { l: "Approved", v: quotations.filter((q) => q.status === "Approved").length + userDocs.filter((d) => d.status === "Approved").length },
          { l: "Awaiting client", v: quotations.filter((q) => ["Sent", "Viewed"].includes(q.status)).length + userDocs.filter((d) => d.status === "Sent").length },
          { l: "Rejected", v: quotations.filter((q) => q.status === "Rejected").length },
        ].map((s) => (
          <div key={s.l} className="stat-tile">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.l}</p>
            <p className="mt-3 font-display text-3xl font-bold">{s.v}</p>
          </div>
        ))}
      </div>

      {userDocs.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-primary/30 bg-card">
          <div className="border-b border-border bg-primary/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Your shareable quotations</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Number</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {userDocs.map((d) => (
                <tr key={d.token} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{d.number}</td>
                  <td className="px-4 py-3">{d.clientName}</td>
                  <td className="px-4 py-3 font-medium">{fmt(docTotal(d), d.currency)}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyLink(d.token)}>
                        <Copy className="mr-1 h-3 w-3" /> Copy
                      </Button>
                      <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link to="/pay/$token" params={{ token: d.token }} target="_blank">
                          <ExternalLink className="mr-1 h-3 w-3" /> Open
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Number</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Valid until</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {quotations.map((q) => (
              <tr key={q.id} className="hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{q.number}</td>
                <td className="px-4 py-3">{q.clientName}</td>
                <td className="px-4 py-3 font-medium">{fmt(q.amount, q.currency)}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(q.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(q.validUntil).toLocaleDateString()}</td>
                <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateDocDialog open={open} onOpenChange={setOpen} kind="quotation" />
    </div>
  );
}
