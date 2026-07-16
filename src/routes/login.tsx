import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — PayFlow Gateway" },
      { name: "description", content: "Sign in to your PayFlow Gateway account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-accent text-accent-foreground font-bold">P</div>
          <span className="font-display text-lg font-bold">PayFlow</span>
        </Link>
        <div>
          <h1 className="font-display text-5xl font-bold leading-tight">
            The fintech-grade platform for global business payments.
          </h1>
          <p className="mt-6 text-primary-foreground/70">
            Quotations, invoices, cards, transfers, crypto — all from one dashboard.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-primary-foreground/70">
            <ShieldCheck className="h-5 w-5 text-accent" /> PCI-DSS Level 1 · SOC 2 · ISO 27001
          </div>
        </div>
        <p className="text-xs text-primary-foreground/50">© 2026 PayFlow Gateway</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="md:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-bold">P</div>
              <span className="font-display text-lg font-bold">PayFlow</span>
            </Link>
          </div>
          <h2 className="mt-6 font-display text-3xl font-bold">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your PayFlow workspace.
          </p>
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/dashboard" });
            }}
          >
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline">
                  Forgot?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Sign in <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
          <p className="mt-4 rounded-md bg-secondary/60 p-3 text-xs text-muted-foreground">
            Demo mode: any credentials will sign you in. Connect Lovable Cloud to enable real auth.
          </p>
        </div>
      </div>
    </div>
  );
}
