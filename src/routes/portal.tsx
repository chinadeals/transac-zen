import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bitcoin, Building2, CreditCard, Download, FileText, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { invoices, quotations, transactions, fmt } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Client Portal — PayFlow Gateway" },
      { name: "description", content: "View quotations, pay invoices, and download receipts." },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  const clientInvoices = invoices.filter((i) => i.clientId === "c1" || i.clientId === "c6");
  const clientQuotations = quotations.filter((q) => q.clientId === "c1" || q.clientId === "c6");
  const clientTx = transactions.filter((t) => t.clientName === "Northwind Traders" || t.clientName === "Sahara Solar");
  const openInvoice = clientInvoices.find((i) => i.status !== "Paid") ?? clientInvoices[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Client portal</p>
              <p className="font-display font-bold">Northwind Traders</p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard">Back to admin</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        {openInvoice && (
          <section className="mb-8 overflow-hidden rounded-3xl bg-primary text-primary-foreground">
            <div className="grid gap-6 p-6 md:grid-cols-3 md:p-10">
              <div className="md:col-span-2">
                <p className="text-xs uppercase tracking-widest text-primary-foreground/70">Amount due</p>
                <p className="mt-2 font-display text-5xl font-bold">
                  {fmt(openInvoice.amount - openInvoice.paid, openInvoice.currency)}
                </p>
                <p className="mt-2 text-primary-foreground/80">
                  Invoice {openInvoice.number} · Due {new Date(openInvoice.due).toLocaleDateString()}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <CreditCard className="mr-1 h-4 w-4" /> Pay with card
                  </Button>
                  <Button variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <Building2 className="mr-1 h-4 w-4" /> Bank transfer
                  </Button>
                  <Button variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <Bitcoin className="mr-1 h-4 w-4" /> Pay with crypto
                  </Button>
                </div>
              </div>
              <div className="rounded-2xl bg-primary-foreground/5 p-6 backdrop-blur">
                <p className="text-xs uppercase tracking-widest text-accent">Secure checkout</p>
                <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
                  <li>· PCI-DSS Level 1</li>
                  <li>· 3-D Secure enforced</li>
                  <li>· Instant receipt</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        <Tabs defaultValue="invoices">
          <TabsList>
            <TabsTrigger value="invoices"><Receipt className="mr-1 h-4 w-4" /> Invoices</TabsTrigger>
            <TabsTrigger value="quotations"><FileText className="mr-1 h-4 w-4" /> Quotations</TabsTrigger>
            <TabsTrigger value="history">Payment history</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Invoice</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Due</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clientInvoices.map((i) => (
                    <tr key={i.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{i.number}</td>
                      <td className="px-4 py-3">{fmt(i.amount, i.currency)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(i.due).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                      <td className="px-4 py-3 text-right">
                        {i.status === "Paid" ? (
                          <Button variant="outline" size="sm"><Download className="mr-1 h-3 w-3" /> Receipt</Button>
                        ) : (
                          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Pay now</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="quotations" className="mt-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Quote</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Valid until</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clientQuotations.map((q) => (
                    <tr key={q.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{q.number}</td>
                      <td className="px-4 py-3">{fmt(q.amount, q.currency)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(q.validUntil).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                      <td className="px-4 py-3 text-right">
                        {q.status === "Sent" || q.status === "Viewed" ? (
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">Reject</Button>
                            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Approve</Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm">View</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Invoice</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clientTx.map((t) => (
                    <tr key={t.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{t.invoiceNumber}</td>
                      <td className="px-4 py-3">{t.method}</td>
                      <td className="px-4 py-3">{fmt(t.amount, t.currency)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.date}</td>
                      <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
