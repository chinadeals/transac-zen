import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Copy, Download, Printer, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPublicDoc, docTotal, type PayDoc } from "@/lib/payment-store";
import { fmt } from "@/lib/mock-data";

export const Route = createFileRoute("/receipt/$token")({
  head: () => ({
    meta: [
      { title: "Payment receipt — PayFlow Gateway" },
      { name: "description", content: "Your PayFlow payment receipt." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReceiptPage,
});

function ReceiptPage() {
  const { token } = Route.useParams();
  const [doc, setDoc] = useState<PayDoc | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    getPublicDoc(token).then((d) => {
      if (!alive) return;
      setDoc(d);
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [token]);

  if (!loaded) return null;
  if (!doc) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-bold">Receipt not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This receipt link is invalid or has expired.
          </p>
          <Button asChild className="mt-6"><Link to="/">Go home</Link></Button>
        </div>
      </div>
    );
  }

  const isPaid = doc.status === "Paid" || doc.status === "Approved";
  const total = docTotal(doc);
  const receiptUrl = typeof window !== "undefined" ? `${window.location.origin}/receipt/${doc.token}` : `/receipt/${doc.token}`;
  const receiptNo = `RCPT-${doc.number}`;
  const paidAt = doc.paidAt ? new Date(doc.paidAt).toLocaleString() : "—";

  const copy = async () => {
    await navigator.clipboard.writeText(receiptUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen bg-background print:bg-white">
      <header className="border-b border-border bg-card print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary" />
            <span className="font-display font-bold">PayFlow Gateway</span>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-1 h-4 w-4" /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Download className="mr-1 h-4 w-4" /> Save PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        {!isPaid && (
          <div className="mb-4 rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            This receipt is pending — payment has not been confirmed yet.
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-8 print:border-0 print:p-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary" />
                <span className="font-display text-lg font-bold">PayFlow Gateway</span>
              </div>
              <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">Receipt</p>
              <h1 className="mt-1 font-display text-3xl font-bold">{receiptNo}</h1>
            </div>
            {isPaid && (
              <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                <CheckCircle2 className="h-4 w-4" /> Paid
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Billed to</p>
              <p className="mt-1 font-medium">{doc.clientName}</p>
              {doc.clientEmail && <p className="text-sm text-muted-foreground">{doc.clientEmail}</p>}
            </div>
            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Reference</p>
              <p className="mt-1 font-mono text-sm">{doc.number}</p>
              <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">Paid on</p>
              <p className="mt-1 text-sm">{paidAt}</p>
              {doc.paidWith && (
                <>
                  <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">Method</p>
                  <p className="mt-1 text-sm">{doc.paidWith}</p>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 text-right font-medium">Qty</th>
                  <th className="px-4 py-3 text-right font-medium">Unit</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {doc.items.map((it) => (
                  <tr key={it.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{it.name}</p>
                      {it.description && (
                        <p className="text-xs text-muted-foreground">{it.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">{it.quantity}</td>
                    <td className="px-4 py-3 text-right">{fmt(it.unitPrice, doc.currency)}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {fmt(it.quantity * it.unitPrice, doc.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">{fmt(total, doc.currency)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Fees</span>
                <span className="text-foreground">{fmt(0, doc.currency)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 font-display text-lg font-bold">
                <span>Total paid</span>
                <span>{fmt(total, doc.currency)}</span>
              </div>
            </div>
          </div>

          {doc.notes && (
            <div className="mt-6 rounded-xl bg-secondary/40 p-4 text-sm text-muted-foreground">
              {doc.notes}
            </div>
          )}

          <div className="mt-8 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Verified by PayFlow Gateway · This receipt was generated automatically upon successful payment.
          </div>
        </div>

        <div className="mt-6 space-y-2 print:hidden">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Shareable receipt link</Label>
          <div className="flex items-stretch gap-2">
            <Input readOnly value={receiptUrl} className="font-mono text-xs" />
            <Button type="button" onClick={copy} variant="outline">
              <Copy className="h-4 w-4" />
              <span className="ml-1 text-xs">{copied ? "Copied" : "Copy"}</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
