import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FilePlus2, Search, UsersRound } from "lucide-react";
import { fmt } from "@/lib/mock-data";
import { docTotal, listDocs, type PayDoc } from "@/lib/payment-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dashboard/clients")({
  head: () => ({ meta: [
    { title: "Clients — PayFlow Gateway" },
    { name: "description", content: "Review client records and related billing activity in your PayFlow workspace." },
    { property: "og:title", content: "Clients — PayFlow Gateway" },
    { property: "og:description", content: "Search and review client records in your business workspace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ClientsPage,
});

function ClientsPage() {
  const [q, setQ] = useState("");
  const [documents, setDocuments] = useState<PayDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [invoices, quotations] = await Promise.all([listDocs("invoice"), listDocs("quotation")]);
      setDocuments([...invoices, ...quotations]);
    } catch {
      setError("Client records could not be loaded. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    window.addEventListener("payflow:docs-changed", refresh);
    return () => window.removeEventListener("payflow:docs-changed", refresh);
  }, [refresh]);

  const clients = useMemo(() => {
    const grouped = new Map<string, { name: string; email: string; country?: string; currency: string; value: number; count: number; latest: string }>();
    for (const doc of documents) {
      const identity = (doc.clientEmail || doc.clientName).trim().toLowerCase();
      const key = `${identity}:${doc.currency}`;
      const current = grouped.get(key) ?? {
        name: doc.clientName,
        email: doc.clientEmail,
        country: doc.clientCountry,
        currency: doc.currency,
        value: 0,
        count: 0,
        latest: doc.createdAt,
      };
      current.count += 1;
      if (doc.kind === "invoice") current.value += docTotal(doc);
      if (new Date(doc.createdAt).getTime() > new Date(current.latest).getTime()) current.latest = doc.createdAt;
      grouped.set(key, current);
    }
    return Array.from(grouped.values()).sort((a, b) => b.latest.localeCompare(a.latest));
  }, [documents]);

  const filtered = clients.filter((client) =>
    `${client.name} ${client.email} ${client.country ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Clients</p>
          <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">Client activity</h1>
          <p className="mt-2 text-sm text-muted-foreground">Contacts are organized from the documents you’ve created.</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/invoices"><FilePlus2 className="mr-2 h-4 w-4" /> New invoice</Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search clients" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients…" className="pl-9" />
        </div>
        <span className="text-sm text-muted-foreground">{clients.length} client{clients.length === 1 ? "" : "s"}</span>
      </div>

      {loading ? <div className="border-y border-border py-12 text-center text-sm text-muted-foreground">Loading client activity…</div> : error ? (
        <div className="border-y border-border py-10 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={() => void refresh()} className="mt-4">Try again</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border-y border-border py-16 text-center">
          <UsersRound className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-4 font-display text-lg font-semibold">No client records yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Create a quotation or invoice and its client details will appear here.</p>
          <Button asChild className="mt-5"><Link to="/dashboard/invoices">Go to invoices</Link></Button>
        </div>
      ) : (
      <div className="overflow-x-auto border-y border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium text-right">Invoice value</th>
              <th className="px-4 py-3 font-medium text-right">Documents</th>
              <th className="px-4 py-3 font-medium">Last activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c) => (
              <tr key={`${c.email || c.name}-${c.currency}`} className="hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <p className="font-medium">{c.name}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.email || "—"}</td>
                <td className="px-4 py-3">{c.country || "—"}</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">{fmt(c.value, c.currency)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{c.count}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(c.latest).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
