import { useEffect, useState } from "react";
import { Copy, Check, ExternalLink, Plus, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createDoc, payLink, SAMPLE_IMAGES, type DocKind, type PayDoc } from "@/lib/payment-store";
import { fmt } from "@/lib/mock-data";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  kind: DocKind;
}

interface DraftItem {
  name: string;
  description: string;
  image: string;
  quantity: number;
  unitPrice: number;
}

const emptyItem = (i = 0): DraftItem => ({
  name: "",
  description: "",
  image: SAMPLE_IMAGES[i % SAMPLE_IMAGES.length],
  quantity: 1,
  unitPrice: 0,
});

export function CreateDocDialog({ open, onOpenChange, kind }: Props) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");
  const [dueInDays, setDueInDays] = useState(14);
  const [items, setItems] = useState<DraftItem[]>([emptyItem(0)]);
  const [created, setCreated] = useState<PayDoc | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setClientName("");
      setClientEmail("");
      setNotes("");
      setDueInDays(14);
      setItems([emptyItem(0)]);
      setCreated(null);
      setCopied(false);
    }
  }, [open]);

  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const updateItem = (idx: number, patch: Partial<DraftItem>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const submit = () => {
    if (!clientName || items.length === 0 || items.some((i) => !i.name || i.unitPrice <= 0)) return;
    const doc = createDoc({
      kind,
      clientName,
      clientEmail,
      currency,
      items,
      notes,
      dueInDays: kind === "invoice" ? dueInDays : undefined,
    });
    setCreated(doc);
  };

  const link = created ? payLink(created.token) : "";

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {!created ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                New {kind === "invoice" ? "Invoice" : "Quotation"}
              </DialogTitle>
              <DialogDescription>
                Add products and get a shareable payment link. Your client doesn't need an account.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="cn">Client name</Label>
                  <Input id="cn" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Acme Inc." />
                </div>
                <div>
                  <Label htmlFor="ce">Client email</Label>
                  <Input id="ce" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="billing@acme.com" />
                </div>
                <div>
                  <Label htmlFor="cur">Currency</Label>
                  <Input id="cur" value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} />
                </div>
                {kind === "invoice" && (
                  <div>
                    <Label htmlFor="dd">Due in (days)</Label>
                    <Input id="dd" type="number" value={dueInDays} onChange={(e) => setDueInDays(Number(e.target.value))} />
                  </div>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>Line items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setItems((p) => [...p, emptyItem(p.length)])}>
                    <Plus className="mr-1 h-3 w-3" /> Add item
                  </Button>
                </div>
                <div className="space-y-3">
                  {items.map((it, idx) => (
                    <div key={idx} className="rounded-xl border border-border bg-secondary/30 p-3">
                      <div className="flex gap-3">
                        <img
                          src={it.image}
                          alt=""
                          className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                        />
                        <div className="grid flex-1 gap-2">
                          <Input placeholder="Product name" value={it.name} onChange={(e) => updateItem(idx, { name: e.target.value })} />
                          <Textarea placeholder="Description" rows={2} value={it.description} onChange={(e) => updateItem(idx, { description: e.target.value })} />
                          <Input placeholder="Image URL" value={it.image} onChange={(e) => updateItem(idx, { image: e.target.value })} />
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">Qty</Label>
                              <Input type="number" min={1} value={it.quantity} onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} />
                            </div>
                            <div>
                              <Label className="text-xs">Unit price</Label>
                              <Input type="number" min={0} step="0.01" value={it.unitPrice} onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) })} />
                            </div>
                            <div className="flex items-end justify-end">
                              {items.length > 1 && (
                                <Button type="button" variant="ghost" size="sm" onClick={() => setItems((p) => p.filter((_, i) => i !== idx))}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display text-2xl font-bold">{fmt(total, currency)}</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={submit}>
                Create & generate link
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Payment link ready</DialogTitle>
              <DialogDescription>
                Share this link with {created.clientName}. They can review the items and pay without creating an account.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-xl border border-border bg-secondary/40 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{created.kind === "invoice" ? "Invoice" : "Quotation"}</p>
                <p className="mt-1 font-display text-xl font-bold">{created.number}</p>
                <p className="text-sm text-muted-foreground">To {created.clientName}</p>
              </div>

              <div className="flex items-stretch gap-2">
                <Input readOnly value={link} className="font-mono text-xs" />
                <Button onClick={copy} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link to="/pay/$token" params={{ token: created.token }} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" /> Preview payment page
                </Link>
              </Button>
            </div>

            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
