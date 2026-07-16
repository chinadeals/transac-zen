// Client-side store for user-created quotations and invoices with shareable
// payment links. Backed by localStorage so links survive reloads. Swap for
// Supabase once backend is wired up.

import type { InvoiceStatus, QuotationStatus, TxStatus, PaymentMethod } from "./mock-data";

export interface LineItem {
  id: string;
  name: string;
  description: string;
  image: string; // URL (unsplash / user-provided)
  quantity: number;
  unitPrice: number;
}

export type DocKind = "invoice" | "quotation";

export interface PayDoc {
  token: string; // shareable slug
  kind: DocKind;
  number: string;
  clientName: string;
  clientEmail: string;
  currency: string;
  items: LineItem[];
  notes?: string;
  status: InvoiceStatus | QuotationStatus;
  createdAt: string;
  dueAt?: string;
  paidWith?: PaymentMethod;
  paidAt?: string;
  txStatus?: TxStatus;
}

const KEY = "payflow.paydocs.v1";

const SEED_IMAGES = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
  "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400",
];

function read(): PayDoc[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as PayDoc[];
  } catch {
    return [];
  }
}

function write(docs: PayDoc[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(docs));
  window.dispatchEvent(new Event("payflow:docs-changed"));
}

function seed(): PayDoc[] {
  const demo: PayDoc[] = [
    {
      token: "demo-inv-northwind",
      kind: "invoice",
      number: "INV-DEMO-001",
      clientName: "Northwind Traders",
      clientEmail: "ada@northwind.co",
      currency: "USD",
      status: "Unpaid",
      createdAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + 14 * 86400000).toISOString(),
      items: [
        {
          id: "li1",
          name: "Premium Wireless Headphones",
          description: "Noise-cancelling, 40h battery, hi-res certified.",
          image: SEED_IMAGES[0],
          quantity: 2,
          unitPrice: 349,
        },
        {
          id: "li2",
          name: "Studio Microphone",
          description: "USB-C condenser with shock mount.",
          image: SEED_IMAGES[1],
          quantity: 1,
          unitPrice: 220,
        },
      ],
      notes: "Thanks for your business. Payment due in 14 days.",
    },
  ];
  write(demo);
  return demo;
}

function makeToken() {
  return (
    Math.random().toString(36).slice(2, 8) +
    Math.random().toString(36).slice(2, 8)
  );
}

function makeNumber(kind: DocKind) {
  const prefix = kind === "invoice" ? "INV" : "QT";
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${new Date().getFullYear()}-${n}`;
}

export function listDocs(): PayDoc[] {
  return read();
}

export function getDoc(token: string): PayDoc | undefined {
  return read().find((d) => d.token === token);
}

export interface CreateInput {
  kind: DocKind;
  clientName: string;
  clientEmail: string;
  currency: string;
  items: Omit<LineItem, "id">[];
  notes?: string;
  dueInDays?: number;
}

export function createDoc(input: CreateInput): PayDoc {
  const doc: PayDoc = {
    token: makeToken(),
    kind: input.kind,
    number: makeNumber(input.kind),
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    currency: input.currency || "USD",
    status: input.kind === "invoice" ? "Unpaid" : "Sent",
    createdAt: new Date().toISOString(),
    dueAt: input.dueInDays
      ? new Date(Date.now() + input.dueInDays * 86400000).toISOString()
      : undefined,
    items: input.items.map((i, idx) => ({ ...i, id: `li${Date.now()}-${idx}` })),
    notes: input.notes,
  };
  const all = read();
  all.unshift(doc);
  write(all);
  return doc;
}

export function markPaid(token: string, method: PaymentMethod) {
  const all = read();
  const idx = all.findIndex((d) => d.token === token);
  if (idx === -1) return;
  all[idx] = {
    ...all[idx],
    status: all[idx].kind === "invoice" ? "Paid" : "Approved",
    paidWith: method,
    paidAt: new Date().toISOString(),
    txStatus: "Approved",
  };
  write(all);
}

export function docTotal(doc: PayDoc) {
  return doc.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
}

export function payLink(token: string) {
  if (typeof window === "undefined") return `/pay/${token}`;
  return `${window.location.origin}/pay/${token}`;
}

export const SAMPLE_IMAGES = SEED_IMAGES;
