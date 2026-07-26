import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRightLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
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
  convertQuotationToInvoice,
  type PayDoc,
} from "@/lib/payment-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/quotations")({
  head: () => ({
    meta: [
      { title: "Quotations — PayFlow Gateway" },
      { name: "description", content: "Send quotations, track approvals, and convert them into invoices in one click." },
      { property: "og:title", content: "Quotations — PayFlow Gateway" },
      { property: "og:description", content: "Send quotations and convert approvals into invoices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuotationsPage,
});

const FILTERS = ["All", "Sent", "Viewed", "Approved", "Rejected"] as const;

function QuotationsPage() {
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<PayDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setDocs(await listDocs("quotation"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load quotations");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("payflow:docs-changed", handler);
    return () => window.removeEventListener("payflow:docs-changed", handler);
  }, [refresh]);

  const filtered = docs.filter(
    (d) =>
      (filter === "All" || d.status === filter) &&
      (d.number + d.clientName + d.clientEmail).toLowerCase().includes(q.toLowerCase()),
  );

  const pipeline = docs.reduce((s, d) => s + docTotal(d), 0);
  const approvedValue = docs
    .filter((d) => d.dbStatus === "approved")
    .reduce((s, d) => s + docTotal(d), 0);
  const currency = docs[0]?.currency ?? "USD";
  const winRate = docs.length
    ? Math.round((docs.filter((d) => d.dbStatus === "approved").length / docs.length) * 100)
    : 0;

  const act = async (fn: () => Promise<unknown>, id: string, msg: string) => {
    setBusyId(id);
    try {
      await fn();
      toast.success(msg);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
    setBusyId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Quotations</p>
          <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Quotations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Send, track approval, and convert straight into a payable invoice.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> New quotation
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Pipeline value" value={fmt(pipeline, currency)} />
        <Stat label="Approved value" value={fmt(approvedValue, currency)} />
        <Stat label="Win rate" value={`${winRate}%`} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search quotations…" className="pl-9" />
        </div>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              "rounded-full px-3 py-1.5 text-xs font-medium transition " +
              (filter === f
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-secondary")
            }
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading your quotations…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-xl font-bold">Nothing here yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Build a quotation with product photos and pricing, then share the link. Approve it later
            to turn it into an invoice.
          </p>
          <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> New quotation
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Number</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Valid until</th>
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
                    <p className="text-xs text-muted-foreground">{d.items.length} item{d.items.length === 1 ? "" : "s"}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">{fmt(docTotal(d), d.currency)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {d.validUntil ? new Date(d.validUntil).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await navigator.clipboard.writeText(payLink(d.token));
                          toast.success("Quotation link copied");
                        }}
                      >
                        <Copy className="mr-1 h-3 w-3" /> Link
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/pay/$token" params={{ token: d.token }} target="_blank">
                          <ExternalLink className="mr-1 h-3 w-3" /> Open
                        </Link>
                      </Button>
                      {d.dbStatus === "approved" ? (
                        <Button
                          size="sm"
                          disabled={busyId === d.id}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() =>
                            act(
                              () => convertQuotationToInvoice(d),
                              d.id,
                              "Invoice created from quotation",
                            )
                          }
                        >
                          <ArrowRightLeft className="mr-1 h-3 w-3" /> To invoice
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyId === d.id}
                            onClick={() =>
                              act(() => setDocStatus("quotation", d.id, "approved"), d.id, "Quotation approved")
                            }
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={busyId === d.id}
                            onClick={() =>
                              act(() => setDocStatus("quotation", d.id, "declined"), d.id, "Quotation declined")
                            }
                          >
                            <XCircle className="mr-1 h-3 w-3" /> Decline
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateDocDialog open={open} onOpenChange={setOpen} kind="quotation" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
