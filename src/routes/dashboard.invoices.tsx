import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Copy, ExternalLink, FileText, Plus, Receipt, RefreshCw, Search } from "lucide-react";
import { fmt } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateDocDialog } from "@/components/create-doc-dialog";
import {
  listDocs,
  payLink,
  docTotal,
  setDocStatus,
  type PayDoc,
} from "@/lib/payment-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices — PayFlow Gateway" },
      { name: "description", content: "Create invoices, share payment links, and track what's been paid." },
      { property: "og:title", content: "Invoices — PayFlow Gateway" },
      { property: "og:description", content: "Create invoices and share secure payment links." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<PayDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const refresh = useCallback(async () => {
    try {
      setDocs(await listDocs("invoice"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load invoices");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("payflow:docs-changed", handler);
    return () => window.removeEventListener("payflow:docs-changed", handler);
  }, [refresh]);

  const filtered = docs.filter((d) =>
    (d.number + d.clientName + d.clientEmail).toLowerCase().includes(q.toLowerCase()),
  );
  const outstanding = docs
    .filter((d) => d.dbStatus !== "paid" && d.dbStatus !== "cancelled")
    .reduce((s, d) => s + docTotal(d), 0);
  const currency = docs[0]?.currency ?? "USD";

  const copyLink = async (token: string) => {
    await navigator.clipboard.writeText(payLink(token));
    toast.success("Payment link copied");
  };

  const cancel = async (d: PayDoc) => {
    try {
      await setDocStatus("invoice", d.id, "cancelled");
      toast.success(`${d.number} cancelled`);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update invoice");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Invoices</p>
          <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Invoices</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {fmt(outstanding, currency)} outstanding across {docs.length} invoice{docs.length === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> New invoice
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoices…" className="pl-9" />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading your invoices…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onCreate={() => setOpen(true)} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Number</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Due</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{d.number}</td>
                  <td className="px-4 py-3">
                    <p>{d.clientName}</p>
                    <p className="text-xs text-muted-foreground">{d.clientEmail}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">{fmt(docTotal(d), d.currency)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {d.dueAt ? new Date(d.dueAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyLink(d.token)}>
                        <Copy className="mr-1 h-3 w-3" /> Link
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/pay/$token" params={{ token: d.token }} target="_blank">
                          <ExternalLink className="mr-1 h-3 w-3" /> Open
                        </Link>
                      </Button>
                      {d.dbStatus === "paid" ? (
                        <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Link to="/receipt/$token" params={{ token: d.token }} target="_blank">
                            <Receipt className="mr-1 h-3 w-3" /> Receipt
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => cancel(d)}>Cancel</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateDocDialog open={open} onOpenChange={setOpen} kind="invoice" />
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 className="mt-4 font-display text-xl font-bold">No invoices yet</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Create your first invoice — you'll get a shareable payment link your client can pay
        without creating an account.
      </p>
      <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90" onClick={onCreate}>
        <Plus className="mr-1 h-4 w-4" /> New invoice
      </Button>
    </div>
  );
}
