import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bitcoin,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  FileText,
  Globe2,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
  Timer,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type MethodDef = {
  id: PaymentMethod;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
  badge?: string;
  crypto?: boolean;
  momo?: boolean;
  /** ISO country codes where this rail is native/priority. */
  countries?: string[];
};

const METHODS: MethodDef[] = [
  { id: "M-Pesa", label: "M-Pesa (Safaricom)", icon: Smartphone, hint: "STK push · Instant", badge: "Popular", momo: true, countries: ["KE", "TZ"] },
  { id: "MTN MoMo", label: "MTN Mobile Money", icon: Smartphone, hint: "Instant · UG · GH · RW · CI · CM", momo: true, countries: ["UG", "GH", "RW", "CI", "CM", "ZM"] },
  { id: "Airtel Money", label: "Airtel Money", icon: Smartphone, hint: "Instant · KE · UG · TZ · ZM · NG", momo: true, countries: ["KE", "UG", "TZ", "ZM", "NG", "RW"] },
  { id: "Orange Money", label: "Orange Money", icon: Smartphone, hint: "Instant · SN · CI · CM · ML", momo: true, countries: ["SN", "CI", "CM", "ML", "BF"] },
  { id: "Visa", label: "Card — Visa / Mastercard / Amex", icon: CreditCard, hint: "3-D Secure · Instant" },
  { id: "Bank Transfer", label: "Bank transfer", icon: Building2, hint: "ACH / SEPA · 1 business day" },
  { id: "Wire", label: "International wire", icon: Wallet, hint: "SWIFT · 1–2 business days" },
  { id: "BTC", label: "Bitcoin", icon: Bitcoin, hint: "On-chain BTC · ~10 min", badge: "Recommended", crypto: true },
  { id: "USDT (TRC20)", label: "USDT (TRC20)", icon: Bitcoin, hint: "Low fee stablecoin · ~1 min", badge: "Fastest", crypto: true },
];

// Mock live rates for USD→crypto
const RATES: Record<string, number> = {
  BTC: 1 / 68_000,
  "USDT (TRC20)": 1,
};

const CRYPTO_ADDRESSES: Record<string, string> = {
  BTC: "bc1qs7f9jw8pza0hkkq3xp6zh4qk3l8u3d7v9n2m5x",
  "USDT (TRC20)": "TXYZa9k3JqLp2WwK4vQ8bR7nMxHtGf6dCe",
};

// Country → default currency for mobile money display
const COUNTRY_CURRENCY: Record<string, string> = {
  KE: "KES", UG: "UGX", TZ: "TZS", RW: "RWF", GH: "GHS", NG: "NGN",
  ZM: "ZMW", SN: "XOF", CI: "XOF", CM: "XAF", ML: "XOF", BF: "XOF",
};

// Country prefix hints
const COUNTRY_PREFIX: Record<string, string> = {
  KE: "+254", UG: "+256", TZ: "+255", RW: "+250", GH: "+233", NG: "+234",
  ZM: "+260", SN: "+221", CI: "+225", CM: "+237", ML: "+223", BF: "+226",
};


function PayPage() {
  const { token } = Route.useParams();
  const [doc, setDoc] = useState<PayDoc | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState<Step>("review");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [regionBlocked, setRegionBlocked] = useState(false);
  const [region, setRegion] = useState<string>("your region");

  useEffect(() => {
    setDoc(getDoc(token));
    setLoaded(true);
    // best-effort geo detection; fallback silently
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const guess = tz.split("/")[1]?.replace(/_/g, " ");
      if (guess) setRegion(guess);
    } catch {
      // ignore
    }
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
  const selectedMethod = METHODS.find((m) => m.id === method);
  const isCrypto = !!selectedMethod?.crypto;
  const isMomo = !!selectedMethod?.momo;

  const confirmPay = async () => {
    if (!method) return;
    setProcessing(true);
    // simulate network + auth
    await new Promise((r) => setTimeout(r, 1600));
    if (!isCrypto && !isMomo) {
      setProcessing(false);
      setRegionBlocked(true);
      return;
    }
    markPaid(doc.token, method);
    setDoc(getDoc(doc.token));
    setProcessing(false);
    setStep("done");
  };

  const switchToAlt = (m: PaymentMethod) => {
    setMethod(m);
    setRegionBlocked(false);
    setStep("details");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary" />
            <span className="font-display font-bold">PayFlow Gateway</span>
          </Link>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden items-center gap-1 sm:flex">
              <Globe2 className="h-3 w-3" /> {region}
            </span>
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" /> Secure checkout
            </span>
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
                doc={doc}
                total={total}
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

      <RegionBlockedDialog
        open={regionBlocked}
        region={region}
        method={method}
        onClose={() => setRegionBlocked(false)}
        onSwitch={switchToAlt}
      />
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
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition ${
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
    <div className="rounded-2xl border border-border bg-card p-6 animate-fade-in">
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
          <div key={it.id} className="flex gap-4 rounded-xl border border-border bg-secondary/30 p-3 transition hover:border-primary/40">
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
  return (
    <div className="rounded-2xl border border-border bg-card p-6 animate-fade-in">
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
                active ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:bg-secondary/40"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{m.label}</p>
                  {m.badge && (
                    <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                      {m.badge}
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

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
        <Button disabled={!selected} onClick={onNext} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Continue <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function DetailsCard({
  method,
  doc,
  total,
  onBack,
  onPay,
  processing,
  amountLabel,
}: {
  method: PaymentMethod;
  doc: PayDoc;
  total: number;
  onBack: () => void;
  onPay: () => void;
  processing: boolean;
  amountLabel: string;
}) {
  const isCard = ["Visa", "Mastercard", "Amex"].includes(method);
  const isCrypto = ["BTC", "USDT (TRC20)"].includes(method);
  const isBank = ["Bank Transfer", "Wire"].includes(method);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 animate-fade-in">
      <h2 className="font-display text-2xl font-bold">Payment details</h2>
      <p className="mt-1 text-sm text-muted-foreground">Paying with {method}</p>

      <div className="mt-5 space-y-4">
        {isCard && <CardForm />}
        {isBank && <BankInstructions doc={doc} />}
        {isCrypto && <CryptoInstructions method={method} amountUsd={total} />}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={processing}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
        <Button onClick={onPay} disabled={processing} className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[160px]">
          {processing ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>
          ) : (
            <>{isCrypto ? "I've sent the payment" : `Pay ${amountLabel}`}</>
          )}
        </Button>
      </div>
    </div>
  );
}

function CardForm() {
  const [num, setNum] = useState("");
  const formatted = num.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  return (
    <>
      <div>
        <Label>Cardholder name</Label>
        <Input placeholder="Name on card" />
      </div>
      <div>
        <Label>Card number</Label>
        <Input placeholder="4242 4242 4242 4242" value={formatted} onChange={(e) => setNum(e.target.value)} inputMode="numeric" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Expiry</Label>
          <Input placeholder="MM / YY" inputMode="numeric" />
        </div>
        <div>
          <Label>CVC</Label>
          <Input placeholder="123" inputMode="numeric" maxLength={4} />
        </div>
      </div>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" /> Encrypted with TLS 1.3 · Never stored
      </p>
    </>
  );
}

function BankInstructions({ doc }: { doc: PayDoc }) {
  return (
    <div className="rounded-xl bg-secondary/40 p-4 text-sm">
      <p className="font-medium">Transfer to:</p>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-muted-foreground">
        <dt>Bank</dt><dd className="text-foreground">PayFlow Trust NA</dd>
        <dt>Account</dt><dd className="font-mono text-foreground">0021 4488 9910</dd>
        <dt>Routing</dt><dd className="font-mono text-foreground">026 073 150</dd>
        <dt>Reference</dt><dd className="font-mono text-foreground">{doc.number}</dd>
      </dl>
    </div>
  );
}

function CryptoInstructions({ method, amountUsd }: { method: PaymentMethod; amountUsd: number }) {
  const rate = RATES[method] ?? 1;
  const cryptoAmount = amountUsd * rate;
  const address = CRYPTO_ADDRESSES[method] ?? "";
  const symbol = method === "BTC" ? "BTC" : "USDT";
  const displayAmount = symbol === "BTC" ? cryptoAmount.toFixed(8) : cryptoAmount.toFixed(2);
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(address)}`;

  const [copied, setCopied] = useState<"addr" | "amt" | null>(null);
  const copy = async (val: string, key: "addr" | "amt") => {
    await navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-3">
      <Countdown minutes={15} />
      <div className="grid gap-4 rounded-xl border border-border bg-secondary/30 p-4 sm:grid-cols-[180px_1fr]">
        <div className="flex items-start justify-center">
          <img src={qr} alt="Payment QR" className="h-[180px] w-[180px] rounded-lg bg-white p-2" />
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Send exactly</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="font-display text-xl font-bold">{displayAmount} {symbol}</p>
              <Button variant="ghost" size="sm" onClick={() => copy(displayAmount, "amt")}>
                {copied === "amt" ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">≈ {fmt(amountUsd, "USD")} · Rate locked for 15 min</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">To address</p>
            <div className="mt-1 flex items-center gap-2 rounded-lg bg-background px-3 py-2">
              <span className="flex-1 break-all font-mono text-xs">{address}</span>
              <Button variant="ghost" size="sm" onClick={() => copy(address, "addr")}>
                {copied === "addr" ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Payment auto-confirms after {method === "BTC" ? "1 network confirmation (~10 min)" : "1 TRC20 confirmation (~1 min)"}.
      </p>
    </div>
  );
}

function Countdown({ minutes }: { minutes: number }) {
  const [left, setLeft] = useState(minutes * 60);
  const target = useRef(Date.now() + minutes * 60_000);
  useEffect(() => {
    const t = setInterval(() => {
      const s = Math.max(0, Math.round((target.current - Date.now()) / 1000));
      setLeft(s);
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const low = left < 120;
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${low ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border bg-secondary/40 text-muted-foreground"}`}>
      <Timer className="h-3 w-3" />
      <span>Rate locked · expires in <span className="font-mono font-semibold">{mm}:{ss}</span></span>
    </div>
  );
}

function RegionBlockedDialog({
  open,
  region,
  method,
  onClose,
  onSwitch,
}: {
  open: boolean;
  region: string;
  method: PaymentMethod | null;
  onClose: () => void;
  onSwitch: (m: PaymentMethod) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">Not available in {region}</DialogTitle>
          <DialogDescription className="text-center">
            {method ? `${method} payments` : "This payment method"} could not be authorized for your region right now.
            You can complete this order instantly with crypto — no account needed.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-2">
          <button
            onClick={() => onSwitch("BTC")}
            className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:border-primary hover:bg-primary/5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bitcoin className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Pay with Bitcoin</p>
              <p className="text-xs text-muted-foreground">On-chain BTC · ~10 min</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => onSwitch("USDT (TRC20)")}
            className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:border-primary hover:bg-primary/5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bitcoin className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Pay with USDT (TRC20)</p>
              <p className="text-xs text-muted-foreground">Stablecoin · ~1 min · lowest fees</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="w-full">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    <div className="rounded-2xl border border-border bg-card p-8 text-center animate-scale-in">
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
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
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
