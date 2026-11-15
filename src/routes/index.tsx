import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Bitcoin,
  Check,
  ChevronDown,
  CircleCheck,
  Code2,
  CreditCard,
  FileText,
  Globe2,
  Layers3,
  LockKeyhole,
  Menu,
  Radio,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PayFlow Gateway — Business payments, clearly connected" },
      {
        name: "description",
        content:
          "Create quotations, issue invoices, and give customers a clear way to pay through the payment methods configured for your business.",
      },
      { property: "og:title", content: "PayFlow Gateway — Business payments, clearly connected" },
      {
        property: "og:description",
        content: "Quotations, invoices, payment links, and tracking in one workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const activityRows = [
  { id: "INV-1048", method: "Mobile money", amount: "$2,480.00", status: "Paid" },
  { id: "INV-1047", method: "Bank transfer", amount: "$860.00", status: "Processing" },
  { id: "INV-1046", method: "Digital currency", amount: "$1,240.00", status: "Paid" },
];

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className="inline-flex shrink-0 items-center gap-2.5" aria-label="PayFlow Gateway home">
      <span className={`grid size-8 place-items-center rounded-md ${inverse ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>
        <Layers3 className="size-4" strokeWidth={2.2} />
      </span>
      <span className="font-display text-base font-semibold tracking-normal">PayFlow<span className="font-normal opacity-65"> Gateway</span></span>
    </Link>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main>
        <Hero />
        <Workflow />
        <Infrastructure />
        <GlobalPayments />
        <DeveloperSection />
        <SecuritySection />
        <Questions />
        <ClosingSection />
      </main>
      <Footer />
    </div>
  );
}

function Navigation() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Products", href: "#products" },
    { label: "Solutions", href: "#solutions" },
    { label: "Developers", href: "#developers" },
    { label: "Pricing", href: "#pricing" },
    { label: "Company", href: "#company" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto grid min-h-[68px] max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-10">
        <Brand />
        <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center justify-end gap-2 lg:flex">
          <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
          <Button asChild size="sm"><Link to="/signup">Get started <ArrowRight className="ml-1.5 size-3.5" /></Link></Button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="lg:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav aria-label="Mobile navigation" className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <a key={link.label} href={link.href} onClick={() => setOpen(false)} className="rounded-sm px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                {link.label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
              <Button asChild variant="outline"><Link to="/login">Sign in</Link></Button>
              <Button asChild><Link to="/signup">Get started</Link></Button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

function Hero() {
  const [period, setPeriod] = useState("30 days");
  return (
    <section className="overflow-hidden border-b border-border">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20 lg:px-10 lg:pt-24">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase text-primary">
            <span className="h-px w-7 bg-primary" /> Payment operations for modern business
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-normal sm:text-5xl lg:text-6xl">
            From the first quote to the final payment.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Create quotations, send invoices, and let customers pay through the methods available to your business—all in one clear workflow.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild size="lg"><Link to="/signup">Get started <ArrowRight className="ml-1.5 size-4" /></Link></Button>
            <Button asChild size="lg" variant="outline"><a href="#products">Explore the platform <ArrowDownRight className="ml-1.5 size-4" /></a></Button>
          </div>
        </div>

        <div className="mt-12 overflow-hidden border border-border bg-card shadow-elevated sm:mt-16">
          <div className="grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-sm bg-primary text-primary-foreground"><Layers3 className="size-3.5" /></span>
              <span className="truncate text-xs font-semibold sm:text-sm">Workspace overview</span>
              <span className="hidden border-l border-border pl-2 text-xs text-muted-foreground sm:inline">Illustrative preview</span>
            </div>
            <div className="flex items-center gap-1" aria-label="Preview period">
              {["7 days", "30 days", "90 days"].map((item) => (
                <button key={item} type="button" onClick={() => setPeriod(item)} aria-pressed={period === item}
                  className={`rounded-sm px-2 py-1.5 text-[10px] font-medium transition-colors sm:px-2.5 sm:text-xs ${period === item ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.8fr)]">
            <div className="min-w-0 border-b border-border p-4 sm:p-6 lg:border-b-0 lg:border-r">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
                <Metric label="Collected" value="$48,290" delta="Illustrative" up />
                <Metric label="Successful" value="1,204" delta="Payments" up />
                <Metric label="In progress" value="18" delta="Payments" />
                <Metric label="Needs review" value="06" delta="Attempts" alert />
              </div>
              <div className="mt-7 flex items-center justify-between gap-2">
                <div><p className="text-xs text-muted-foreground">Payment volume</p><p className="mt-1 font-display text-xl font-semibold">$48,290.00</p></div>
                <span className="text-[10px] text-muted-foreground sm:text-xs">Sample · {period}</span>
              </div>
              <div className="mt-4 h-36 sm:h-48">
                <VolumeChart period={period} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground sm:text-xs">
                <span>01 {period === "7 days" ? "Mon" : "Jun"}</span><span>10 {period === "7 days" ? "Wed" : "Jun"}</span><span>20 {period === "7 days" ? "Fri" : "Jun"}</span><span>30 {period === "7 days" ? "Sun" : "Jun"}</span>
              </div>
            </div>

            <div className="min-w-0 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Recent activity</h2>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground sm:text-xs"><span className="size-1.5 rounded-full bg-success" /> Activity preview</span>
              </div>
              <div className="mt-4 divide-y divide-border">
                {activityRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="grid size-8 shrink-0 place-items-center rounded-sm bg-secondary text-muted-foreground">
                        <ReceiptText className="size-4" />
                      </div>
                      <div className="min-w-0"><p className="truncate text-xs font-medium">{row.id}</p><p className="mt-0.5 truncate text-[10px] text-muted-foreground">{row.method}</p></div>
                    </div>
                    <div className="text-right"><p className="text-xs font-semibold tabular-nums">{row.amount}</p><p className={`mt-0.5 text-[10px] ${row.status === "Paid" ? "text-success" : "text-warning-foreground"}`}>{row.status}</p></div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 border-t border-border pt-4 text-[10px] text-muted-foreground sm:text-xs">
                <Radio className="size-3.5 shrink-0 text-primary" /> Payment methods depend on business setup and customer location.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-secondary/40 px-4 py-2.5 text-[10px] text-muted-foreground sm:px-6 sm:text-xs">
            <span>Sample interface · Illustrative figures, not live account data</span>
            <Link to="/signup" className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary">Open your workspace <ArrowUpRight className="size-3" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, delta, up, alert }: { label: string; value: string; delta: string; up?: boolean; alert?: boolean }) {
  return (
    <div className="min-w-0 border-l border-border pl-3 first:border-l-0 first:pl-0 sm:pl-4">
      <p className="truncate text-[10px] text-muted-foreground sm:text-xs">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold tabular-nums sm:text-xl">{value}</p>
      <p className={`mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] ${alert ? "text-warning-foreground" : up ? "text-success" : "text-muted-foreground"}`}>
        {up ? <ArrowUpRight className="size-3" /> : alert ? <span className="size-1.5 rounded-full bg-warning" /> : null}{delta}
      </p>
    </div>
  );
}

function VolumeChart({ period }: { period: string }) {
  const d = period === "7 days"
    ? "M0 115 C35 102 45 126 78 88 S130 98 156 63 204 80 232 46 276 60 300 24"
    : period === "90 days"
      ? "M0 106 C28 90 44 110 72 92 S116 103 145 70 183 88 214 52 258 75 278 43 291 35 300 12"
      : "M0 108 C24 102 36 75 60 86 S91 105 116 68 149 82 171 59 204 83 225 49 251 62 273 30 289 41 300 20";
  return (
    <svg className="h-full w-full overflow-visible" viewBox="0 0 300 140" preserveAspectRatio="none" role="img" aria-label={`Illustrative payment volume chart, ${period}`}>
      <defs><linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--color-primary)" stopOpacity="0.18" /><stop offset="1" stopColor="var(--color-primary)" stopOpacity="0" /></linearGradient></defs>
      {[25, 65, 105].map((y) => <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="var(--color-border)" strokeDasharray="3 5" />)}
      <path d={`${d} L300 140 L0 140 Z`} fill="url(#volumeFill)" />
      <path d={d} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      <circle cx="300" cy={period === "7 days" ? "24" : period === "90 days" ? "12" : "20"} r="4" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function SectionIntro({ eyebrow, title, copy, dark = false }: { eyebrow: string; title: string; copy: string; dark?: boolean }) {
  return (
    <div className="max-w-2xl">
      <p className={`text-xs font-semibold uppercase ${dark ? "text-accent" : "text-primary"}`}>{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">{title}</h2>
      <p className={`mt-4 text-base leading-7 ${dark ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{copy}</p>
    </div>
  );
}

function Workflow() {
  const stages = [
    { n: "01", icon: FileText, title: "Prepare a quotation", copy: "Set out the work, item by item, and share a clear proposal with your customer." },
    { n: "02", icon: ReceiptText, title: "Issue an invoice", copy: "Move approved work into a structured invoice with its own payment link." },
    { n: "03", icon: CircleCheck, title: "Track the outcome", copy: "See when a link is opened and follow payment activity through to its receipt." },
  ];
  return (
    <section id="products" className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-10 lg:py-24">
      <SectionIntro eyebrow="One connected workflow" title="Clarity from quote to cash." copy="Keep the customer journey and the work behind it in view, instead of scattering every step across separate tools." />
      <div className="divide-y divide-border border-y border-border">
        {stages.map((stage) => (
          <article key={stage.n} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-start sm:gap-6 sm:py-6">
            <span className="pt-1 font-mono text-xs text-muted-foreground">{stage.n}</span>
            <div><h3 className="font-display text-lg font-semibold">{stage.title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{stage.copy}</p></div>
            <stage.icon className="hidden size-5 text-primary sm:mt-1 sm:block" strokeWidth={1.7} />
          </article>
        ))}
      </div>
    </section>
  );
}

function Infrastructure() {
  const methods = [
    { icon: CreditCard, name: "Cards", detail: "Card processing, when configured" },
    { icon: Smartphone, name: "Mobile money", detail: "Regional providers, where available" },
    { icon: Banknote, name: "Bank transfer", detail: "Local and international rails" },
    { icon: Bitcoin, name: "Digital currency", detail: "Supported assets and networks" },
  ];
  return (
    <section id="solutions" className="border-y border-border bg-secondary/45">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20 lg:px-10 lg:py-24">
        <SectionIntro eyebrow="Payment infrastructure" title="Meet customers on familiar rails." copy="Offer payment methods through your configured collection accounts. What customers can use depends on your region, provider setup, and currency." />
        <div className="grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {methods.map((method, i) => (
            <article key={method.name} className={`flex min-h-28 items-start gap-4 py-5 sm:px-5 sm:py-6 ${i > 1 ? "sm:border-t sm:border-border" : ""} ${i % 2 === 0 ? "sm:pl-0" : ""}`}>
              <span className="grid size-9 shrink-0 place-items-center rounded-sm border border-border bg-card"><method.icon className="size-4 text-primary" strokeWidth={1.7} /></span>
              <div><h3 className="text-sm font-semibold">{method.name}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{method.detail}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function GlobalPayments() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-24 lg:px-10 lg:py-24">
        <SectionIntro dark eyebrow="Operations, in context" title="Know what needs attention." copy="A single view brings payment status, invoice references, settlement details, and customer activity closer together—so teams can see what has happened and what remains open." />
        <div className="border-y border-primary-foreground/20">
          <div className="flex items-center justify-between gap-4 border-b border-primary-foreground/20 py-4">
            <div className="flex items-center gap-3"><Globe2 className="size-5 text-accent" /><div><p className="text-sm font-semibold">Market-aware collection</p><p className="mt-1 text-xs text-primary-foreground/60">Availability follows your account setup</p></div></div>
            <ChevronDown className="size-4 rotate-[-90deg] text-primary-foreground/50" />
          </div>
          <div className="grid grid-cols-2 divide-x divide-primary-foreground/20">
            <div className="py-5 pr-4"><p className="text-xs text-primary-foreground/60">Payment tracking</p><p className="mt-2 text-sm font-medium">Initiated to completed</p></div>
            <div className="py-5 pl-5"><p className="text-xs text-primary-foreground/60">Settlement visibility</p><p className="mt-2 text-sm font-medium">Reference and status</p></div>
          </div>
          <div className="flex items-center gap-3 border-t border-primary-foreground/20 py-4"><Zap className="size-4 text-accent" /><p className="text-xs leading-5 text-primary-foreground/70">Configured payment methods appear in the customer checkout flow.</p></div>
        </div>
      </div>
    </section>
  );
}

function DeveloperSection() {
  return (
    <section id="developers" className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20 lg:px-10 lg:py-24">
      <div>
        <p className="text-xs font-semibold uppercase text-primary">For the people who build</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl">A useful product before you write a line of code.</h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">Start with shareable payment links. When you need more, connect your existing workflow using the integration options configured in your workspace.</p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><Check className="size-4 text-primary" /> Hosted checkout</span>
          <span className="flex items-center gap-2"><Check className="size-4 text-primary" /> Public payment links</span>
          <span className="flex items-center gap-2"><Check className="size-4 text-primary" /> Payment activity</span>
        </div>
      </div>
      <div className="overflow-hidden border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2 text-xs font-medium"><Code2 className="size-4 text-primary" /> Integration status</div>
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="size-1.5 rounded-full bg-success" /> Workspace preview</span>
        </div>
        <div className="space-y-0 px-4 py-2 font-mono text-xs sm:px-5">
          <div className="flex gap-4 border-b border-border py-3"><span className="text-muted-foreground">01</span><span><span className="text-primary">const</span> invoice = <span className="text-warning-foreground">await</span> createInvoice(&#123;</span></div>
          <div className="flex gap-4 border-b border-border py-3"><span className="text-muted-foreground">02</span><span className="pl-4">customer: <span className="text-primary">"customer@example.com"</span>,</span></div>
          <div className="flex gap-4 border-b border-border py-3"><span className="text-muted-foreground">03</span><span className="pl-4">currency: <span className="text-primary">"USD"</span></span></div>
          <div className="flex gap-4 py-3"><span className="text-muted-foreground">04</span><span>&#125;);</span></div>
        </div>
        <div className="flex items-center gap-2 border-t border-border bg-secondary/45 px-4 py-3 text-[10px] text-muted-foreground sm:px-5 sm:text-xs"><LockKeyhole className="size-3.5 shrink-0" /> Example only — API access depends on your integration setup.</div>
      </div>
    </section>
  );
}

function SecuritySection() {
  const safeguards = [
    { icon: ShieldCheck, title: "Account access", copy: "Sign-in and workspace access are tied to your account." },
    { icon: LockKeyhole, title: "Scoped records", copy: "Data access is governed by configured account permissions." },
    { icon: Radio, title: "Activity visibility", copy: "Follow payment activity as it moves through the checkout flow." },
  ];
  return (
    <section id="company" className="border-y border-border bg-secondary/45">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-10 lg:py-24">
        <SectionIntro eyebrow="Trust is operational" title="Clear controls. Clear status." copy="A reliable payments workflow starts with access controls, transparent payment states, and records your team can follow—not unsupported promises." />
        <div className="divide-y divide-border border-y border-border">
          {safeguards.map((item, i) => (
            <div key={item.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_2rem] sm:items-center sm:gap-6 sm:py-6">
              <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              <div className="flex items-start gap-3"><item.icon className="mt-0.5 size-4 shrink-0 text-primary" /><div><h3 className="text-sm font-semibold">{item.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.copy}</p></div></div>
              <Check className="hidden size-4 text-primary sm:block" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Questions() {
  const items = [
    { q: "Can a customer pay without creating an account?", a: "Yes. You can share a public payment link with a customer, who can review the invoice or quotation and continue through the checkout flow without signing in." },
    { q: "Which payment methods can I offer?", a: "Payment options depend on your configured collection accounts, region, provider setup, and currency. Customers see the methods available for that checkout." },
    { q: "Can a quotation become an invoice?", a: "Yes. Approved quotations can be converted into invoices from your workspace." },
    { q: "Where can I see payment activity?", a: "Your workspace shows payment and document activity, including statuses available from the configured payment flow." },
  ];
  return (
    <section id="pricing" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <div className="text-center"><p className="text-xs font-semibold uppercase text-primary">A few details</p><h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Questions, answered.</h2></div>
      <Accordion type="single" collapsible className="mt-8 border-t border-border sm:mt-10">
        {items.map((item, index) => (
          <AccordionItem key={item.q} value={`item-${index}`}>
            <AccordionTrigger className="py-5 text-left font-display text-base font-medium sm:text-lg">{item.q}</AccordionTrigger>
            <AccordionContent className="max-w-3xl text-sm leading-6 text-muted-foreground">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-2 text-sm text-muted-foreground"><span>Have a specific setup in mind?</span><a href="#get-started" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">Talk with our team <ArrowRight className="size-3.5" /></a></div>
    </section>
  );
}

function ClosingSection() {
  return (
    <section id="get-started" className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-16 md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:px-10">
        <div><p className="text-xs font-semibold uppercase text-accent">PayFlow Gateway</p><h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">Bring your payment workflow into one view.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-primary-foreground/70">Start with quotations, invoices, and shareable payment links for your business.</p></div>
        <Button asChild size="lg" variant="secondary"><Link to="/signup">Create an account <ArrowRight className="ml-1.5 size-4" /></Link></Button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-[1.3fr_1fr_1fr] lg:px-10">
        <div><Brand inverse /><p className="mt-4 max-w-xs text-sm leading-6 text-primary-foreground/65">Quotations, invoices, payment links, and transaction tracking for business.</p></div>
        <div><p className="text-xs font-semibold uppercase text-primary-foreground/55">Platform</p><ul className="mt-4 space-y-3 text-sm text-primary-foreground/85"><li><a href="#products" className="hover:text-accent">Workflow</a></li><li><a href="#solutions" className="hover:text-accent">Payment methods</a></li><li><a href="#developers" className="hover:text-accent">Integrations</a></li></ul></div>
        <div><p className="text-xs font-semibold uppercase text-primary-foreground/55">Your workspace</p><ul className="mt-4 space-y-3 text-sm text-primary-foreground/85"><li><Link to="/login" className="hover:text-accent">Sign in</Link></li><li><Link to="/signup" className="hover:text-accent">Create account</Link></li><li><a href="#pricing" className="hover:text-accent">Questions</a></li></ul></div>
      </div>
      <div className="border-t border-primary-foreground/15"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-primary-foreground/55 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10"><span>© {new Date().getFullYear()} PayFlow Gateway</span><span>Payment availability varies by region and account configuration.</span></div></div>
    </footer>
  );
}