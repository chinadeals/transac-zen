import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — PayFlow Gateway" },
      { name: "description", content: "Start accepting global payments with PayFlow." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", company: "", country: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: {
          full_name: form.full_name,
          company: form.company,
          country: form.country,
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created — welcome to PayFlow");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-bold">P</div>
            <span className="font-display text-lg font-bold">PayFlow</span>
          </Link>
          <h2 className="mt-6 font-display text-3xl font-bold">Start collecting payments</h2>
          <p className="mt-2 text-sm text-muted-foreground">Free to start. No card required.</p>
          <form className="mt-8 space-y-4" onSubmit={submit}>
            <div>
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" required value={form.full_name} onChange={set("full_name")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" required value={form.company} onChange={set("company")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" placeholder="e.g. Kenya, Nigeria, United States" required
                value={form.country} onChange={set("country")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" required value={form.email} onChange={set("email")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6}
                value={form.password} onChange={set("password")} className="mt-1.5" />
            </div>
            <Button type="submit" disabled={busy}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</>
                    : <>Create account <ArrowRight className="ml-1 h-4 w-4" /></>}
            </Button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
      <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">
        <div />
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Join 12,000+ businesses</p>
          <blockquote className="mt-4 font-display text-3xl font-bold leading-snug">
            "PayFlow cut our days-sales-outstanding from 42 to 9. Quote-to-cash is one flow now."
          </blockquote>
          <p className="mt-4 text-primary-foreground/70">Ada Okoye · CFO, Northwind Traders</p>
        </div>
        <p className="text-xs text-primary-foreground/50">© 2026 PayFlow Gateway</p>
      </div>
    </div>
  );
}
