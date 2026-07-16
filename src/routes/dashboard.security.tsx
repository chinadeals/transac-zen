import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, KeyRound, History, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/dashboard/security")({
  component: SecurityPage,
});

function SecurityPage() {
  const events = [
    { t: "Successful login", who: "ada@northwind.co", ip: "102.89.44.10", when: "Just now", tone: "success" },
    { t: "New API key created", who: "system", ip: "—", when: "2 hours ago", tone: "muted" },
    { t: "Suspicious login blocked", who: "unknown", ip: "185.220.101.42", when: "Yesterday 22:11", tone: "destructive" },
    { t: "Password changed", who: "ada@northwind.co", ip: "102.89.44.10", when: "3 days ago", tone: "muted" },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Security</p>
        <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Security & audit</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { icon: ShieldCheck, title: "Multi-factor authentication", desc: "Require MFA for all admin users.", on: true },
          { icon: KeyRound, title: "Session timeout", desc: "Sign out inactive sessions after 30 minutes.", on: true },
          { icon: AlertTriangle, title: "Fraud alerts", desc: "Notify admins on suspicious transaction patterns.", on: true },
          { icon: History, title: "IP allowlist", desc: "Restrict dashboard access to trusted IPs.", on: false },
        ].map((s) => (
          <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display font-bold">{s.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
              <Switch defaultChecked={s.on} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Recent audit events</h2>
          <Button variant="outline" size="sm">Download log</Button>
        </div>
        <div className="mt-4 divide-y divide-border">
          {events.map((e, i) => (
            <div key={i} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className={"font-medium " + (e.tone === "destructive" ? "text-destructive" : "")}>{e.t}</p>
                <p className="text-xs text-muted-foreground">{e.who} · {e.ip}</p>
              </div>
              <span className="text-xs text-muted-foreground">{e.when}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
