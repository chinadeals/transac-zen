import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, Download, ExternalLink, Plus } from "lucide-react";
import { invoices, fmt } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreateDocDialog } from "@/components/create-doc-dialog";
import { listDocs, payLink, docTotal, type PayDoc } from "@/lib/payment-store";

export const Route = createFileRoute("/dashboard/invoices")({
  component: InvoicesPage,
});

function InvoicesPage() {
  const [open, setOpen] = useState(false);
  const [userDocs, setUserDocs] = useState<PayDoc[]>([]);

  useEffect(() => {
    const refresh = () => setUserDocs(listDocs().filter((d) => d.kind === "invoice"));
    refresh();
    window.addEventListener("payflow:docs-changed", refresh);
    return () => window.removeEventListener("payflow:docs-changed", refresh);
  }, []);

  const totalOutstanding = invoices
    .filter((i) => ["Unpaid", "Partially Paid", "Overdue"].includes(i.status))
    .reduce((sum, i) => sum + (i.amount - i.paid), 0);

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(payLink(token));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Invoices</p>
          <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Invoices</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {fmt(totalOutstanding)} outstanding across {invoices.length} invoices.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="mr-1 h-4 w-4" /> Export</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> New invoice
          </Button>
        </div>
      </div>

      {userDocs.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-primary/30 bg-card">
          <div className="border-b border-border bg-primary/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Your payment links</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Number</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Payment link</th>
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
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.map((i) => {
              const pct = i.amount > 0 ? Math.round((i.paid / i.amount) * 100) : 0;
              return (
                <tr key={i.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{i.number}</td>
                  <td className="px-4 py-3">{i.clientName}</td>
                  <td className="px-4 py-3 font-medium">{fmt(i.amount, i.currency)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="h-1.5 w-24" />
                      <span className="text-xs text-muted-foreground">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(i.due).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <CreateDocDialog open={open} onOpenChange={setOpen} kind="invoice" />
    </div>
  );
}
