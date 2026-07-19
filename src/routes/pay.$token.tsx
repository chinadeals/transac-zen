import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Bitcoin, Building2, CheckCircle2, Copy, CreditCard, FileText, Lock, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDoc, markPaid, docTotal, type PayDoc } from "@/lib/payment-store";
import { fmt, type PaymentMethod } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";

export const Route = createFileRoute("/pay/$token")({
  head: () => ({
    meta: [
      { title: "Complete your payment — PayFlow Gateway" },
      { name: "description", content: "Review your order and pay securely." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PayPage,
});

type Step = "review" | "method" | "details" | "done";

const METHODS: { id: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }>; hint: string; available: boolean }[] = [
  { id: "Visa", label: "Card (Visa / Mastercard / Amex)", icon: CreditCard, hint: "Secure card checkout via 3-D Secure", available: false },
  { id: "Bank Transfer", label: "Bank transfer", icon: Building2, hint: "Domestic ACH / SEPA", available: false },
  { id: "Wire", label: "International wire", icon: Wallet, hint: "SWIFT · 1–2 business days", available: false },
  { id: "BTC", label: "Bitcoin", icon: Bitcoin, hint: "On-chain BTC", available: true },
  { id: "USDT (TRC20)", label: "USDT (TRC20)", icon: Bitcoin, hint: "Low-fee stablecoin", available: true },
];

function PayPage() {
  const { token } = Route.useParams();
  const [doc, setDoc] = useState<PayDoc | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState<Step>("review");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setDoc(getDoc(token));
    setLoaded(true);
  }, [token]);

  const total = useMemo(() => (doc ? docTotal(doc) : 0), [doc]);

  if (!loaded) return null;
  if (!doc) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-bold">Link not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This payment link is invalid or has expired. Please contact the sender.
          </p>
          <Button asChild className="mt-6"><Link to="/">Go home</Link></Button>
        </div>
      </div>
    );
  }

  const isPaid = doc.status === "Paid" || doc.status === "Approved" || step === "done";

  const confirmPay = async () => {
    if (!method) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    markPaid(doc.token, method);
    setDoc(getDoc(doc.token));
    setProcessing(false);
    setStep("done");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary" />
            <span className="font-display font-bold">PayFlow Gateway</span>
          </Link>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" /> Secure checkout
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <Stepper current={isPaid ? "done" : step} kind={doc.kind} />

        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {isPaid ? (
              <SuccessCard doc={doc} />
            ) : step === "review" ? (
              <ReviewCard doc={doc} onNext={() => setStep("method")} />
            ) : step === "method" ? (
              <MethodCard
                selected={method}
                onSelect={setMethod}
                onBack={() => setStep("review")}
                onNext={() => setStep("details")}
              />
            ) : (
              <DetailsCard
                method={method!}
                onBack={() => setStep("method")}
                onPay={confirmPay}
                processing={processing}
                amountLabel={fmt(total, doc.currency)}
              />
            )}
          </div>

          <aside>
            <SummaryCard doc={doc} total={total} />
          </aside>
        </div>
      </main>
    </div>
  );
}

function Stepper({ current, kind }: { current: Step; kind: PayDoc["kind"] }) {
  const steps: { id: Step; label: string }[] = [
    { id: "review", label: kind === "quotation" ? "Review quote" : "Review order" },
    { id: "method", label: "Payment method" },
    { id: "details", label: "Pay" },
    { id: "done", label: "Confirmation" },
  ];
  const currentIdx = steps.findIndex((s) => s.id === current);
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {steps.map((s, i) => {
        const active = i === currentIdx;
        const done = i < currentIdx;
        return (
          <li key={s.id} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                done ? "bg-primary text-primary-foreground" : active ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </span>
            <span className={active ? "font-medium" : "text-muted-foreground"}>{s.label}</span>
            {i < steps.length - 1 && <span className="mx-1 text-muted-foreground">›</span>}
          </li>
        );
      })}
    </ol>
  );
}

function ReviewCard({ doc, onNext }: { doc: PayDoc; onNext: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {doc.kind === "invoice" ? "Invoice" : "Quotation"} {doc.number}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold">Review your items</h1>
          <p className="mt-1 text-sm text-muted-foreground">Prepared for {doc.clientName}</p>
        </div>
        <StatusBadge status={doc.status} />
      </div>

      <div className="mt-6 space-y-3">
        {doc.items.map((it) => (
          <div key={it.id} className="flex gap-4 rounded-xl border border-border bg-secondary/30 p-3">
            <img src={it.image} alt={it.name} className="h-24 w-24 flex-shrink-0 rounded-lg object-cover" />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{it.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{it.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{fmt(it.quantity * it.unitPrice, doc.currency)}</p>
                  <p className="text-xs text-muted-foreground">
                    {it.quantity} × {fmt(it.unitPrice, doc.currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {doc.notes && (
        <div className="mt-4 rounded-xl bg-secondary/40 p-3 text-sm text-muted-foreground">{doc.notes}</div>
      )}

      <div className="mt-6 flex justify-end">
        <Button onClick={onNext} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Continue to payment <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function MethodCard({
  selected,
  onSelect,
  onBack,
  onNext,
}: {
  selected: PaymentMethod | null;
  onSelect: (m: PaymentMethod) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const selectedMethod = METHODS.find((m) => m.id === selected);
  const isUnavailable = !!selectedMethod && !selectedMethod.available;
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-2xl font-bold">Choose payment method</h2>
      <p className="mt-1 text-sm text-muted-foreground">All methods are processed through PayFlow's secure gateway.</p>

      <div className="mt-5 space-y-2">
        {METHODS.map((m) => {
          const Icon = m.icon;
          const active = selected === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                active ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{m.label}</p>
                  {!m.available && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Unavailable
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{m.hint}</p>
              </div>
              <div className={`h-4 w-4 rounded-full border ${active ? "border-primary bg-primary" : "border-border"}`} />
            </button>
          );
        })}
      </div>

      {isUnavailable && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Not available in your region</p>
            <p className="mt-1 text-muted-foreground">
              Card and bank payments are temporarily unavailable in your region. Please pay with Bitcoin or USDT to complete this order.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
        <Button disabled={!selected || isUnavailable} onClick={onNext} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Continue <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function DetailsCard({
  method,
  onBack,
  onPay,
  processing,
  amountLabel,
}: {
  method: PaymentMethod;
  onBack: () => void;
  onPay: () => void;
  processing: boolean;
  amountLabel: string;
}) {
  const isCard = ["Visa", "Mastercard", "Amex"].includes(method);
  const isCrypto = ["BTC", "ETH", "USDT (TRC20)", "USDT (ERC20)"].includes(method);
  const isBank = ["Bank Transfer", "Wire"].includes(method);

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-2xl font-bold">Payment details</h2>
      <p className="mt-1 text-sm text-muted-foreground">Paying with {method}</p>

      <div className="mt-5 space-y-4">
        {isCard && (
          <>
            <div>
              <Label>Cardholder name</Label>
              <Input placeholder="Name on card" />
            </div>
            <div>
              <Label>Card number</Label>
              <Input placeholder="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Expiry</Label>
                <Input placeholder="MM / YY" />
              </div>
              <div>
                <Label>CVC</Label>
                <Input placeholder="123" />
              </div>
            </div>
          </>
        )}
        {isBank && (
          <div className="rounded-xl bg-secondary/40 p-4 text-sm">
            <p className="font-medium">Transfer to:</p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-muted-foreground">
              <dt>Bank</dt><dd className="text-foreground">PayFlow Trust NA</dd>
              <dt>Account</dt><dd className="font-mono text-foreground">0021 4488 9910</dd>
              <dt>Routing</dt><dd className="font-mono text-foreground">026 073 150</dd>
              <dt>Reference</dt><dd className="font-mono text-foreground">Use invoice number</dd>
            </dl>
          </div>
        )}
        {isCrypto && (
          <div className="rounded-xl bg-secondary/40 p-4 text-sm">
            <p className="font-medium">Send exact amount to:</p>
            <p className="mt-2 break-all rounded-lg bg-background px-3 py-2 font-mono text-xs">
              TXYZa9k3JqLp2WwK4vQ8bR7nMxHtGf6dCe
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Payment auto-confirms after 1 network confirmation.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={processing}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
        <Button onClick={onPay} disabled={processing} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {processing ? "Processing…" : `Pay ${amountLabel}`}
        </Button>
      </div>
    </div>
  );
}

function SuccessCard({ doc }: { doc: PayDoc }) {
  const receiptUrl = typeof window !== "undefined" ? `${window.location.origin}/receipt/${doc.token}` : `/receipt/${doc.token}`;
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(receiptUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-9 w-9" />
      </div>
      <h2 className="mt-4 font-display text-2xl font-bold">Payment received</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Thank you! A receipt for {doc.number} has been sent to {doc.clientEmail || "your email"}.
      </p>
      {doc.paidWith && (
        <p className="mt-1 text-xs text-muted-foreground">Method: {doc.paidWith}</p>
      )}

      <div className="mt-6 space-y-2 text-left">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Receipt link</Label>
        <div className="flex items-stretch gap-2">
          <Input readOnly value={receiptUrl} className="font-mono text-xs" />
          <Button type="button" onClick={copy} variant="outline">
            <Copy className="h-4 w-4" />
            <span className="ml-1 text-xs">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/receipt/$token" params={{ token: doc.token }}>
            <FileText className="mr-2 h-4 w-4" /> View receipt
          </Link>
        </Button>
        <Button asChild variant="outline"><Link to="/">Return home</Link></Button>
      </div>
    </div>
  );
}

function SummaryCard({ doc, total }: { doc: PayDoc; total: number }) {
  return (
    <div className="sticky top-6 space-y-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Amount due</p>
        <p className="mt-1 font-display text-3xl font-bold">{fmt(total, doc.currency)}</p>
      </div>
      <div className="space-y-1 border-t border-border pt-3 text-sm">
        {doc.items.map((it) => (
          <div key={it.id} className="flex justify-between text-muted-foreground">
            <span className="truncate pr-2">{it.name} × {it.quantity}</span>
            <span className="text-foreground">{fmt(it.quantity * it.unitPrice, doc.currency)}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between border-t border-border pt-3 font-semibold">
        <span>Total</span>
        <span>{fmt(total, doc.currency)}</span>
      </div>
      <div className="rounded-xl bg-secondary/40 p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="font-medium">Protected checkout</span>
        </div>
        PCI-DSS Level 1 · 3-D Secure · Instant receipt
      </div>
    </div>
  );
}
