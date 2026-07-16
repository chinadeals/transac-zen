import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Settings</p>
        <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Workspace settings</h1>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">Company</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="cname">Company name</Label>
            <Input id="cname" defaultValue="Northwind Traders" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="cemail">Billing email</Label>
            <Input id="cemail" defaultValue="billing@northwind.co" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="ccountry">Country</Label>
            <Input id="ccountry" defaultValue="Nigeria" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="ccurrency">Default currency</Label>
            <Input id="ccurrency" defaultValue="USD" className="mt-1.5" />
          </div>
        </div>
        <div className="mt-4">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Save changes</Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">Integrations</h2>
        <p className="mt-1 text-sm text-muted-foreground">Connect your existing payment processors.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {["Stripe", "PayPal", "Flutterwave", "Paystack", "Wise", "Binance Pay", "Coinbase Commerce", "Webhooks API"].map((i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-border p-3">
              <span className="text-sm font-medium">{i}</span>
              <Button variant="outline" size="sm">Connect</Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
