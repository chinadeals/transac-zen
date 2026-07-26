import { useEffect, useState } from "react";
import { Building2, Check, ImageIcon, Loader2, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Profile = {
  id: string;
  company: string | null;
  full_name: string | null;
  industry: string | null;
  phone: string | null;
  website: string | null;
  tax_id: string | null
  country: string | null;
  default_currency: string | null;
  brand_color: string | null;
  logo_url: string | null;
  invoice_footer: string | null;
  onboarded: boolean | null;
};

const STEPS = ["Business", "Branding", "Invoicing"] as const;

/** Professional 3-step profile setup shown until the merchant completes it. */
export function OnboardingWizard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    company: "",
    full_name: "",
    industry: "",
    phone: "",
    website: "",
    tax_id: "",
    country: "",
    default_currency: "USD",
    brand_color: "#1a3d2e",
    invoice_footer: "Thank you for your business.",
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (!alive || !data) return;
      const p = data as unknown as Profile;
      setProfile(p);
      setForm((f) => ({
        ...f,
        company: p.company ?? "",
        full_name: p.full_name ?? "",
        industry: p.industry ?? "",
        phone: p.phone ?? "",
        website: p.website ?? "",
        tax_id: p.tax_id ?? "",
        country: p.country ?? "",
        default_currency: p.default_currency ?? "USD",
        brand_color: p.brand_color ?? "#1a3d2e",
        invoice_footer: p.invoice_footer ?? f.invoice_footer,
      }));
    })();
    return () => {
      alive = false;
    };
  }, []);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const uploadLogo = async (file: File) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const path = `${auth.user.id}/logo-${Date.now()}-${file.name.replace(/[^\w.-]/g, "")}`;
    const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    if (error) {
      toast.error(error.message);
      return;
    }
    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    await supabase.from("profiles").update({ logo_url: data.publicUrl }).eq("id", auth.user.id);
    setProfile((p) => (p ? { ...p, logo_url: data.publicUrl } : p));
    toast.success("Logo uploaded");
  };

  const finish = async () => {
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ ...form, onboarded: true })
      .eq("id", auth.user.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Your business profile is live");
    setProfile((p) => (p ? { ...p, onboarded: true } : p));
    window.dispatchEvent(new Event("payflow:docs-changed"));
  };

  if (!profile || profile.onboarded) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-primary/30 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-primary/5 px-5 py-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Set up your business profile
          </p>
          <h2 className="mt-1 font-display text-xl font-bold">
            This is what your clients see on every quote, invoice and receipt
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={
                "rounded-full px-3 py-1 text-xs font-medium " +
                (i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                    ? "bg-accent text-accent-foreground"
                    : "border border-border text-muted-foreground")
              }
            >
              {i < step ? <Check className="inline h-3 w-3" /> : i + 1}. {s}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-5">
        {step === 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Legal / trading name" icon={Building2}>
              <Input value={form.company} onChange={(e) => set("company")(e.target.value)} placeholder="Northwind Traders Ltd" />
            </Field>
            <Field label="Your full name">
              <Input value={form.full_name} onChange={(e) => set("full_name")(e.target.value)} />
            </Field>
            <Field label="Industry">
              <Input value={form.industry} onChange={(e) => set("industry")(e.target.value)} placeholder="Retail, SaaS, Logistics…" />
            </Field>
            <Field label="Business phone">
              <Input value={form.phone} onChange={(e) => set("phone")(e.target.value)} placeholder="+254 7XX XXX XXX" />
            </Field>
            <Field label="Country">
              <Input value={form.country} onChange={(e) => set("country")(e.target.value)} placeholder="Kenya" />
            </Field>
            <Field label="Tax / VAT ID">
              <Input value={form.tax_id} onChange={(e) => set("tax_id")(e.target.value)} />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Website">
              <Input value={form.website} onChange={(e) => set("website")(e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Brand colour" icon={Palette}>
              <div className="flex gap-2">
                <Input type="color" className="h-10 w-14 p-1" value={form.brand_color} onChange={(e) => set("brand_color")(e.target.value)} />
                <Input value={form.brand_color} onChange={(e) => set("brand_color")(e.target.value)} />
              </div>
            </Field>
            <Field label="Company logo" icon={ImageIcon}>
              <div className="flex items-center gap-3">
                {profile.logo_url && (
                  <img src={profile.logo_url} alt="Your company logo" className="h-10 w-10 rounded-md object-cover" />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadLogo(f);
                  }}
                />
              </div>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Default currency">
              <Input maxLength={3} value={form.default_currency} onChange={(e) => set("default_currency")(e.target.value.toUpperCase())} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Invoice footer">
                <Textarea rows={2} value={form.invoice_footer} onChange={(e) => set("invoice_footer")(e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-1">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={step === 0 && !form.company}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
            </Button>
          ) : (
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={busy} onClick={finish}>
              {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Finish setup"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-primary" />} {label}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
