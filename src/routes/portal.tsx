import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Layers3, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Client Portal — PayFlow Gateway" },
      { name: "description", content: "Open a shared PayFlow payment link to review a quotation or invoice without creating an account." },
      { property: "og:title", content: "Client Portal — PayFlow Gateway" },
      { property: "og:description", content: "Open a shared payment link to review a quotation or invoice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const openPaymentLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const entered = value.trim();
    const match = entered.match(/(?:^|\/)pay\/([^/?#]+)/i);
    const token = match?.[1] ?? entered.replace(/^\/+/, "").replace(/^pay\//i, "").split(/[?#]/)[0];
    if (!token) {
      setError(true);
      return;
    }
    setError(false);
    navigate({ to: "/pay/$token", params: { token } });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2.5" aria-label="PayFlow Gateway home">
            <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><Layers3 className="size-4" /></span>
            <span className="font-display font-semibold">PayFlow <span className="font-normal text-muted-foreground">Gateway</span></span>
          </Link>
          <Button asChild variant="outline" size="sm"><Link to="/login">Merchant sign in</Link></Button>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl content-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] md:items-center md:gap-16">
        <section className="max-w-xl">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Client portal</p>
          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Review a quote or pay an invoice.</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
            Open the payment link sent by your business. You can review the document and available payment options without creating an account.
          </p>
        </section>

        <section className="rounded-md border border-border bg-card p-5 sm:p-6" aria-labelledby="link-heading">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <span className="grid size-10 place-items-center rounded-md bg-secondary text-foreground"><Link2 className="size-5" /></span>
            <div>
              <h2 id="link-heading" className="font-display text-lg font-semibold">Open a payment link</h2>
              <p className="text-sm text-muted-foreground">Paste the link or its payment code.</p>
            </div>
          </div>
          <form className="mt-5 space-y-4" onSubmit={openPaymentLink}>
            <div>
              <Label htmlFor="payment-link">Payment link or code</Label>
              <Input
                id="payment-link"
                value={value}
                onChange={(event) => { setValue(event.target.value); setError(false); }}
                placeholder="https://…/pay/…"
                autoComplete="off"
                required
                className="mt-1.5"
                aria-invalid={error}
                aria-describedby={error ? "link-error" : undefined}
              />
              {error && <p id="link-error" className="mt-2 text-sm text-destructive" role="alert">Enter the payment link or code from your sender.</p>}
            </div>
            <Button type="submit" className="w-full">Continue to document <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </form>
          <p className="mt-4 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
            Payment methods and availability depend on the sender’s provider setup and your region. If you do not have a link, contact the sender.
          </p>
        </section>
      </main>
    </div>
  );
}