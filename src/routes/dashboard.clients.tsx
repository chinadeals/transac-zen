import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { clients, fmt } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dashboard/clients")({
  component: ClientsPage,
});

function ClientsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("All");
  const filtered = clients.filter((c) => {
    const matchesQ = [c.company, c.contact, c.email, c.country]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase());
    const matchesS = status === "All" || c.status === status;
    return matchesQ && matchesS;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Clients</p>
          <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Client directory</h1>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-1 h-4 w-4" /> Add client
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients…" className="pl-9" />
        </div>
        {["All", "Active", "Pending", "Suspended"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={
              "rounded-full px-3 py-1.5 text-xs font-medium transition " +
              (status === s
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-secondary")
            }
          >
            {s}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Total billed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <p className="font-semibold">{c.company}</p>
                  <p className="text-xs text-muted-foreground">Since {new Date(c.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{c.contact}</p>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                </td>
                <td className="px-4 py-3">{c.country}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-right font-medium">{fmt(c.totalBilled)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No clients match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
