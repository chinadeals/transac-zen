import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe2,
  CreditCard,
  Building2,
  Bitcoin,
  FileText,
  BarChart3,
  Lock,
  Menu,
  X,
  Sparkles,
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
      { title: "PayFlow Gateway — Generate Invoices & Accept Payments Worldwide" },
      {
        name: "description",
        content:
          "The all-in-one payment platform for modern businesses. Send quotations, issue invoices, and accept cards, bank transfers, and crypto in 180+ countries.",
      },
      { property: "og:title", content: "PayFlow Gateway — Global business payments" },
      {
        property: "og:description",
        content:
          "Quotations, invoices, and multi-channel payments — from one enterprise-grade dashboard.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <LogoStrip />
      <Features />
      <PaymentMethods />
      <Benefits />
      <Security />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Features", href: "#features" },
    { label: "Payments", href: "#payments" },
    { label: "Security", href: "#security" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-bold">
            P
          </div>
          <span className="font-display text-lg font-bold tracking-tight">PayFlow</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/signup">
              Get started <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="flex flex-col gap-2 px-4 py-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-1 text-sm font-medium">
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2">
              <Button variant="outline" asChild className="flex-1">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild className="flex-1 bg-primary text-primary-foreground">
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,theme(colors.accent/30),transparent_60%)]" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24 lg:py-32">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Enterprise payments. Built for the whole world.
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Generate invoices <br />
            <span className="relative inline-block">
              <span className="relative z-10">& accept payments</span>
              <span className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-accent md:h-4" />
            </span>{" "}
            worldwide.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            PayFlow Gateway is the fintech-grade platform your business needs to
            quote, invoice, and collect — via cards, bank transfers, and crypto —
            from customers in 180+ countries.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/signup">
                Start free <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/dashboard">See live demo</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> No setup fees
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> PCI-DSS Level 1
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> 180+ countries
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="glass-card relative rounded-3xl p-6 shadow-[0_20px_60px_-20px_theme(colors.primary/40)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Invoice</p>
                <p className="font-display text-2xl font-bold">INV-3211</p>
              </div>
              <span className="rounded-full bg-warning/20 px-3 py-1 text-xs font-semibold text-warning-foreground">
                Partially Paid
              </span>
            </div>
            <div className="mt-6 rounded-2xl bg-primary p-6 text-primary-foreground">
              <p className="text-xs uppercase tracking-widest opacity-70">Amount due</p>
              <p className="mt-1 font-display text-4xl font-bold">$64,500.00</p>
              <p className="mt-1 text-sm opacity-80">Sahara Solar · Due Jul 25</p>
              <div className="mt-6 flex gap-2">
                <div className="flex-1 rounded-lg bg-primary-foreground/10 px-3 py-2 text-xs font-medium">
                  Visa •••• 4242
                </div>
                <div className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground">
                  Pay now →
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              {[
                { l: "Card", v: "48%" },
                { l: "Bank", v: "27%" },
                { l: "Crypto", v: "25%" },
              ].map((m) => (
                <div key={m.l} className="rounded-lg border border-border p-2">
                  <p className="text-muted-foreground">{m.l}</p>
                  <p className="font-display font-bold">{m.v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -left-6 -bottom-6 hidden rounded-2xl border border-border bg-card p-4 shadow-lg md:block">
            <p className="text-xs text-muted-foreground">Monthly revenue</p>
            <p className="font-display text-2xl font-bold">$128,500</p>
            <p className="text-xs text-success">↑ 26% vs last month</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  const items = ["Northwind", "Helios", "Kaizen", "Andes", "Bluewave", "Sahara Solar", "Loop"];
  return (
    <section className="border-y border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">
          Trusted by finance teams at fast-moving businesses
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {items.map((n) => (
            <span key={n} className="font-display text-lg font-semibold text-muted-foreground/70">
              {n}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: FileText, title: "Quotations that close", desc: "Draft, send, and track quotations with client approval workflows and automatic conversion to invoices." },
    { icon: Zap, title: "Instant invoicing", desc: "Generate branded PDF invoices with unique numbers, tax, discounts, and multi-currency support in one click." },
    { icon: Globe2, title: "Global reach", desc: "Collect from customers in 180+ countries in the currency they prefer, with automatic FX." },
    { icon: BarChart3, title: "Realtime analytics", desc: "Track revenue, payment success rates, top clients, and outstanding invoices — live." },
    { icon: ShieldCheck, title: "Enterprise security", desc: "MFA, RBAC, audit logs, transaction monitoring, and fraud alerts on every account." },
    { icon: Sparkles, title: "Automations", desc: "Auto-approve verified payments, send reminders, and reconcile — without lifting a finger." },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          Everything you need
        </span>
        <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
          One platform, from quote to cash.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Replace the patchwork of spreadsheets, PDF tools, and payment processors with a single dashboard.
        </p>
      </div>
      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          <div key={f.title} className="rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-[var(--shadow-card)]">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-xl font-bold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PaymentMethods() {
  const groups = [
    {
      icon: CreditCard,
      title: "Card payments",
      items: ["Visa", "Mastercard", "American Express", "Apple Pay & Google Pay"],
    },
    {
      icon: Building2,
      title: "Bank transfers",
      items: ["Local bank transfer", "International wire (SWIFT)", "Account verification", "ACH & SEPA"],
    },
    {
      icon: Bitcoin,
      title: "Cryptocurrency",
      items: ["Bitcoin (BTC)", "Ethereum (ETH)", "USDT (TRC20)", "USDT (ERC20)"],
    },
  ];
  return (
    <section id="payments" className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="grid gap-10 md:grid-cols-2 md:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Payment methods
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
              Every way your customers want to pay.
            </h2>
          </div>
          <p className="text-primary-foreground/70">
            Accept cards, bank transfers, and crypto from a single checkout. We verify each
            transaction, update your invoice automatically, and notify both sides.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {groups.map((g) => (
            <div key={g.title} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 backdrop-blur">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                <g.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold">{g.title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
                {g.items.map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" /> {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const stats = [
    { v: "180+", l: "Countries supported" },
    { v: "99.99%", l: "Uptime SLA" },
    { v: "<2s", l: "Avg. checkout time" },
    { v: "$0", l: "Setup fees" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Business benefits
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
            Get paid faster, with less back-and-forth.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Approved quotations flow directly into invoices. Verified payments auto-close them.
            Your team spends less time chasing and more time growing.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Convert approved quotations into invoices in one click",
              "Automatic payment verification and reconciliation",
              "Real-time notifications by email, SMS, and in-app",
              "Client portal with self-service invoice history and receipts",
            ].map((i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.l} className="rounded-2xl border border-border bg-secondary/40 p-6">
              <p className="font-display text-4xl font-bold text-primary">{s.v}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Security() {
  const items = [
    { icon: Lock, title: "End-to-end encryption" },
    { icon: ShieldCheck, title: "Multi-factor authentication" },
    { icon: BarChart3, title: "Audit logs & monitoring" },
    { icon: Zap, title: "Fraud detection alerts" },
  ];
  return (
    <section id="security" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Security-first
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
            Bank-grade security. Zero compromise.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {items.map((i) => (
            <div key={i.title} className="rounded-2xl border border-border bg-card p-6 text-center">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                <i.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold">{i.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      per: "/month",
      desc: "For freelancers and small teams",
      features: ["Up to 20 invoices/mo", "Card & bank payments", "Basic analytics", "Email support"],
      cta: "Start free",
      highlight: false,
    },
    {
      name: "Business",
      price: "$49",
      per: "/month",
      desc: "For growing companies",
      features: ["Unlimited invoices", "Crypto payments", "Advanced analytics", "Client portal", "Priority support"],
      cta: "Choose Business",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      per: "",
      desc: "For teams needing scale & SLAs",
      features: ["Custom volume pricing", "SSO & SAML", "Dedicated CSM", "99.99% uptime SLA", "Audit exports"],
      cta: "Talk to sales",
      highlight: false,
    },
  ];
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          Pricing
        </span>
        <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Simple, transparent pricing.</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Pay only for what you use. Cancel anytime.
        </p>
      </div>
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={
              "rounded-3xl border p-8 " +
              (p.highlight
                ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-elevated)] md:-translate-y-2"
                : "border-border bg-card")
            }
          >
            <p className="font-display text-lg font-bold">{p.name}</p>
            <p className={p.highlight ? "text-primary-foreground/70 text-sm" : "text-muted-foreground text-sm"}>
              {p.desc}
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-5xl font-bold">{p.price}</span>
              <span className={p.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}>{p.per}</span>
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle2 className={p.highlight ? "h-4 w-4 text-accent" : "h-4 w-4 text-primary"} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              className={
                "mt-8 w-full " +
                (p.highlight
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90")
              }
            >
              <Link to="/signup">{p.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      quote:
        "PayFlow cut our days-sales-outstanding from 42 to 9. Quotation-to-cash is now a single flow.",
      name: "Ada Okoye",
      role: "CFO, Northwind Traders",
    },
    {
      quote:
        "We accept crypto and wires from customers on four continents. Reconciliation runs itself.",
      name: "Farid Nasser",
      role: "Head of Finance, Sahara Solar",
    },
    {
      quote:
        "The dashboard is beautiful, the security is boring — exactly what an enterprise finance tool should be.",
      name: "Priya Menon",
      role: "COO, Loop Analytics",
    },
  ];
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
        <h2 className="max-w-2xl font-display text-4xl font-bold md:text-5xl">
          Loved by finance teams worldwide.
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {items.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-border bg-card p-6">
              <blockquote className="text-base leading-relaxed">"{t.quote}"</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {t.name.split(" ").map((w) => w[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "How long does it take to get started?", a: "You can sign up and send your first invoice in under 5 minutes. Live payments activate after quick verification." },
    { q: "Which payment methods can I accept?", a: "Visa, Mastercard, Amex, local & international bank transfers, and crypto (BTC, ETH, USDT on TRC20/ERC20)." },
    { q: "Do you support multi-currency invoicing?", a: "Yes. Invoice in the currency your customer prefers; we handle FX and settlement automatically." },
    { q: "Is PayFlow secure?", a: "PayFlow is PCI-DSS Level 1 compliant, with MFA, RBAC, end-to-end encryption, and continuous transaction monitoring." },
    { q: "Can I integrate with my existing tools?", a: "Yes — via native integrations (Stripe, PayPal, Flutterwave, Paystack, Wise, Binance Pay, Coinbase Commerce) and our Webhooks API." },
  ];
  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 py-20 md:px-8 md:py-28">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">FAQ</span>
        <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Common questions.</h2>
      </div>
      <Accordion type="single" collapsible className="mt-12">
        {items.map((f, i) => (
          <AccordionItem key={f.q} value={`i-${i}`}>
            <AccordionTrigger className="text-left font-display text-lg font-semibold">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-7xl px-4 pb-20 md:px-8 md:pb-28">
      <div className="relative overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground md:p-16">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/40 blur-3xl" />
        <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-4xl font-bold md:text-5xl">
              Ready to get paid, everywhere?
            </h2>
            <p className="mt-4 max-w-md text-primary-foreground/80">
              Join thousands of businesses using PayFlow to send quotations, invoice
              globally, and collect in minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/signup">Create your account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <a href="mailto:sales@payflow.example">Talk to sales</a>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl bg-primary-foreground/5 p-6 backdrop-blur">
            <p className="text-sm font-medium uppercase tracking-widest text-accent">Contact</p>
            <div className="mt-4 space-y-3 text-sm">
              <p><span className="text-primary-foreground/60">Sales</span><br />sales@payflow.example</p>
              <p><span className="text-primary-foreground/60">Support</span><br />support@payflow.example</p>
              <p><span className="text-primary-foreground/60">Office</span><br />1 Payments Way, London EC2A</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-bold">P</div>
            <span className="font-display text-lg font-bold">PayFlow</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Global payments infrastructure for modern businesses.
          </p>
        </div>
        {[
          { title: "Product", links: ["Features", "Payments", "Pricing", "Security"] },
          { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
          { title: "Legal", links: ["Terms", "Privacy", "Compliance", "Cookies"] },
        ].map((c) => (
          <div key={c.title}>
            <p className="text-sm font-semibold">{c.title}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {c.links.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground md:flex-row md:px-8">
          <p>© 2026 PayFlow Gateway. All rights reserved.</p>
          <p>PCI-DSS Level 1 · SOC 2 Type II · ISO 27001</p>
        </div>
      </div>
    </footer>
  );
}
