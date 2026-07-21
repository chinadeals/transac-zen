import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Building2, Coins, CreditCard, Loader2, Plus, Radio, ShieldAlert,
  Smartphone, Trash2, Users as UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({ meta: [{ title: "Admin Console — PayFlow Gateway" }] }),
  component: AdminPage,
});

type Kind = "bank" | "mpesa" | "mtn" | "airtel" | "orange" | "crypto" | "card";
type Account = {
  id: string; kind: Kind; label: string; country: string | null; currency: string | null;
  details: Record<string, string>; is_active: boolean; created_at: string;
};
type Profile = { id: string; email: string | null; full_name: string | null; company: string | null; country: string | null; created_at: string };
type Session = { user_id: string; last_seen: string; page: string | null };

const KIND_META: Record<Kind, { label: string; icon: React.ComponentType<{ className?: string }>; fields: { key: string; label: string; placeholder?: string }[] }> = {
  bank:   { label: "Bank Account", icon: Building2,  fields: [{ key: "bank_name", label: "Bank name" }, { key: "account_name", label: "Account name" }, { key: "account_number", label: "Account number" }, { key: "routing", label: "Routing / SWIFT" }] },
  mpesa:  { label: "M-Pesa Paybill", icon: Smartphone, fields: [{ key: "paybill", label: "Paybill / Till" }, { key: "account_ref", label: "Account reference" }, { key: "shortcode", label: "Business shortcode" }] },
  mtn:    { label: "MTN MoMo",      icon: Smartphone, fields: [{ key: "merchant_code", label: "Merchant code" }, { key: "msisdn", label: "MoMo number" }] },
  airtel: { label: "Airtel Money",  icon: Smartphone, fields: [{ key: "merchant_code", label: "Merchant code" }, { key: "msisdn", label: "Airtel number" }] },
  orange: { label: "Orange Money",  icon: Smartphone, fields: [{ key: "merchant_code", label: "Merchant code" }, { key: "msisdn", label: "Orange number" }] },
  crypto: { label: "Crypto Wallet", icon: Coins,      fields: [{ key: "asset", label: "Asset (BTC/USDT-TRC20…)" }, { key: "address", label: "Wallet address" }, { key: "network", label: "Network" }] },
  card:   { label: "Card Processor",icon: CreditCard, fields: [{ key: "processor", label: "Processor (Stripe/Adyen…)" }, { key: "publishable_key", label: "Publishable key" }, { key: "webhook_id", label: "Webhook ID" }] },
};

function AdminPage() {
  const { role, loading } = useCurrentUser();

  if (loading) {
    return <div className="p-8 text-sm text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading…</div>;
  }
  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-lg p-10 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 font-display text-2xl font-bold">Admin access required</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account isn't an admin yet. Ask a workspace owner to grant you the <code>admin</code> role,
          or use the SQL Editor to insert a row into <code>user_roles</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Console</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage where payments land, review every merchant, and see who's live right now.
        </p>
      </header>

      <Tabs defaultValue="collect">
        <TabsList>
          <TabsTrigger value="collect">Collection Accounts</TabsTrigger>
          <TabsTrigger value="merchants">Merchants</TabsTrigger>
          <TabsTrigger value="live">Live Users</TabsTrigger>
        </TabsList>
        <TabsContent value="collect" className="mt-4"><CollectionAccounts /></TabsContent>
        <TabsContent value="merchants" className="mt-4"><MerchantsTable /></TabsContent>
        <TabsContent value="live" className="mt-4"><LiveUsers /></TabsContent>
      </Tabs>
    </div>
  );
}

function CollectionAccounts() {
  const [rows, setRows] = useState<Account[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState<Kind>("mpesa");
  const [form, setForm] = useState({ label: "", country: "", currency: "", details: {} as Record<string, string> });

  const load = async () => {
    const { data, error } = await supabase.from("collection_accounts").select("*").order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setRows((data ?? []) as Account[]);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("collection_accounts").insert({
      kind, label: form.label, country: form.country || null, currency: form.currency || null,
      details: form.details, created_by: u.user?.id,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Collection account added");
    setOpen(false);
    setForm({ label: "", country: "", currency: "", details: {} });
    load();
  };

  const toggle = async (a: Account) => {
    const { error } = await supabase.from("collection_accounts").update({ is_active: !a.is_active }).eq("id", a.id);
    if (error) { toast.error(error.message); return; }
    load();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("collection_accounts").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const meta = KIND_META[kind];

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Where payments land</h2>
          <p className="text-sm text-muted-foreground">Bank accounts, mobile money paybills, crypto wallets and card processors used to collect from clients.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="mr-1 h-4 w-4" /> Add account</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add collection account</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Type</Label>
                <Select value={kind} onValueChange={(v) => { setKind(v as Kind); setForm((f) => ({ ...f, details: {} })); }}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(KIND_META).map(([k, m]) => (<SelectItem key={k} value={k}>{m.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Label</Label>
                  <Input className="mt-1.5" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="Main M-Pesa Paybill" />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input className="mt-1.5" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="KE" />
                </div>
              </div>
              <div>
                <Label>Currency</Label>
                <Input className="mt-1.5" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} placeholder="KES / USD / EUR" />
              </div>
              <div className="grid gap-3 border-t border-border pt-3">
                {meta.fields.map((f) => (
                  <div key={f.key}>
                    <Label>{f.label}</Label>
                    {f.key === "address" ? (
                      <Textarea className="mt-1.5 font-mono text-xs" rows={2}
                        value={form.details[f.key] ?? ""}
                        onChange={(e) => setForm((s) => ({ ...s, details: { ...s.details, [f.key]: e.target.value } }))} />
                    ) : (
                      <Input className="mt-1.5" value={form.details[f.key] ?? ""} placeholder={f.placeholder}
                        onChange={(e) => setForm((s) => ({ ...s, details: { ...s.details, [f.key]: e.target.value } }))} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create} disabled={busy || !form.label}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead><TableHead>Label</TableHead><TableHead>Country</TableHead>
              <TableHead>Details</TableHead><TableHead>Status</TableHead><TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">No collection accounts yet. Add one to start receiving payments.</TableCell></TableRow>
            )}
            {rows.map((a) => {
              const Icon = KIND_META[a.kind]?.icon ?? Building2;
              return (
                <TableRow key={a.id}>
                  <TableCell><span className="inline-flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{KIND_META[a.kind]?.label ?? a.kind}</span></TableCell>
                  <TableCell className="font-medium">{a.label}</TableCell>
                  <TableCell>{a.country ?? "—"} {a.currency ? <span className="text-xs text-muted-foreground">· {a.currency}</span> : null}</TableCell>
                  <TableCell className="max-w-xs font-mono text-xs text-muted-foreground">
                    {Object.entries(a.details).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(" · ") || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.is_active ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggle(a)}>
                      {a.is_active ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function MerchantsTable() {
  const [rows, setRows] = useState<Profile[]>([]);
  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) toast.error(error.message);
      else setRows((data ?? []) as Profile[]);
    });
  }, []);
  return (
    <section>
      <div className="mb-4 flex items-center gap-2"><UsersIcon className="h-5 w-5 text-primary" /><h2 className="font-display text-xl font-bold">All merchants</h2></div>
      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Company</TableHead><TableHead>Country</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 && (<TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">No merchants yet.</TableCell></TableRow>)}
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                <TableCell>{p.email || "—"}</TableCell>
                <TableCell>{p.company || "—"}</TableCell>
                <TableCell>{p.country || "—"}</TableCell>
                <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function LiveUsers() {
  const [rows, setRows] = useState<(Session & { profile?: Profile })[]>([]);
  const load = async () => {
    const { data: sessions } = await supabase.from("live_sessions")
      .select("*").gte("last_seen", new Date(Date.now() - 5 * 60_000).toISOString());
    const ids = (sessions ?? []).map((s) => s.user_id);
    let profiles: Profile[] = [];
    if (ids.length) {
      const { data } = await supabase.from("profiles").select("*").in("id", ids);
      profiles = (data ?? []) as Profile[];
    }
    setRows((sessions ?? []).map((s: Session) => ({ ...s, profile: profiles.find((p) => p.id === s.user_id) })));
  };
  useEffect(() => {
    load();
    const t = setInterval(load, 15_000);
    return () => clearInterval(t);
  }, []);
  const count = useMemo(() => rows.length, [rows]);
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Radio className="h-5 w-5 text-primary animate-pulse" />
        <h2 className="font-display text-xl font-bold">Live users</h2>
        <Badge variant="secondary" className="ml-2">{count} online now</Badge>
      </div>
      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Company</TableHead><TableHead>Page</TableHead><TableHead>Last seen</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 && (<TableRow><TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">No one online in the last 5 minutes.</TableCell></TableRow>)}
            {rows.map((r) => (
              <TableRow key={r.user_id}>
                <TableCell className="font-medium">{r.profile?.full_name || r.profile?.email || r.user_id.slice(0, 8)}</TableCell>
                <TableCell>{r.profile?.company || "—"}</TableCell>
                <TableCell className="font-mono text-xs">{r.page || "—"}</TableCell>
                <TableCell>{new Date(r.last_seen).toLocaleTimeString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
