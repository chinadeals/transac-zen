// Supabase-backed data layer for quotations, invoices, payments and activity.
// Public checkout reads/writes go through token-scoped RPCs so a client never
// needs an account (and can never enumerate other merchants' documents).

import { supabase } from "@/integrations/supabase/client";
import type {
  InvoiceStatus,
  QuotationStatus,
  TxStatus,
  PaymentMethod,
} from "./mock-data";

export type DocKind = "invoice" | "quotation";

export type DocStatusDb =
  | "draft"
  | "sent"
  | "viewed"
  | "paid"
  | "partially_paid"
  | "overdue"
  | "cancelled"
  | "expired"
  | "approved"
  | "declined";

export interface LineItem {
  id: string;
  name: string;
  description: string;
  image: string;
  quantity: number;
  unitPrice: number;
}

export interface MerchantBrand {
  company: string | null;
  fullName: string | null;
  logoUrl: string | null;
  brandColor: string | null;
  website: string | null;
  invoiceFooter: string | null;
}

export interface PayDoc {
  id: string;
  token: string;
  kind: DocKind;
  number: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCountry?: string;
  currency: string;
  items: LineItem[];
  notes?: string;
  /** Human label used by StatusBadge. */
  status: InvoiceStatus | QuotationStatus;
  dbStatus: DocStatusDb;
  total: number;
  createdAt: string;
  dueAt?: string;
  validUntil?: string;
  paidWith?: PaymentMethod | string;
  paidAt?: string;
  merchant?: MerchantBrand;
}

export interface PaymentRow {
  id: string;
  invoiceId: string | null;
  amount: number;
  currency: string;
  method: string;
  status: TxStatus;
  txRef: string | null;
  phone: string | null;
  createdAt: string;
  invoiceNumber?: string;
  clientName?: string;
}

export interface ActivityRow {
  id: string;
  action: string;
  entity: string | null;
  merchantId: string | null;
  invoiceId: string | null;
  meta: Record<string, unknown>;
  createdAt: string;
}

/* ------------------------------------------------------------------ labels */

export function docStatusLabel(s: string): InvoiceStatus | QuotationStatus {
  switch (s) {
    case "paid":
      return "Paid";
    case "partially_paid":
      return "Partially Paid";
    case "sent":
      return "Sent";
    case "viewed":
      return "Viewed";
    case "approved":
      return "Approved";
    case "overdue":
    case "expired":
      return "Overdue";
    case "cancelled":
    case "declined":
      return "Rejected";
    default:
      return "Draft";
  }
}

export function txStatusLabel(s: string): TxStatus {
  switch (s) {
    case "approved":
      return "Approved";
    case "processing":
      return "Processing";
    case "failed":
      return "Failed";
    case "refunded":
      return "Refunded";
    default:
      return "Pending";
  }
}

/* ------------------------------------------------------------------ helpers */

export const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
  "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400",
];

function makeToken() {
  const bytes = new Uint8Array(12);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 20);
}

function makeNumber(kind: DocKind) {
  const prefix = kind === "invoice" ? "INV" : "QT";
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${new Date().getFullYear()}-${n}`;
}

export function docTotal(doc: PayDoc) {
  return doc.items.length
    ? doc.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    : doc.total;
}

export function payLink(token: string) {
  if (typeof window === "undefined") return `/pay/${token}`;
  return `${window.location.origin}/pay/${token}`;
}

export function receiptLink(token: string) {
  if (typeof window === "undefined") return `/receipt/${token}`;
  return `${window.location.origin}/receipt/${token}`;
}

type RawItem = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  quantity: number | string;
  unit_price: number | string;
};

function mapItems(items: RawItem[] | null | undefined): LineItem[] {
  return (items ?? []).map((it) => ({
    id: it.id,
    name: it.name,
    description: it.description ?? "",
    image: it.image_url ?? SAMPLE_IMAGES[0],
    quantity: Number(it.quantity),
    unitPrice: Number(it.unit_price),
  }));
}

/* ---------------------------------------------------------- merchant reads */

type RawDoc = {
  id: string;
  token: string;
  number: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_country: string | null;
  currency: string;
  total: number | string;
  status: string;
  notes: string | null;
  created_at: string;
  due_at?: string | null;
  valid_until?: string | null;
  invoice_items?: RawItem[];
  quotation_items?: RawItem[];
};

function mapDoc(row: RawDoc, kind: DocKind): PayDoc {
  return {
    id: row.id,
    token: row.token,
    kind,
    number: row.number,
    clientName: row.client_name,
    clientEmail: row.client_email ?? "",
    clientPhone: row.client_phone ?? undefined,
    clientCountry: row.client_country ?? undefined,
    currency: row.currency,
    items: mapItems(kind === "invoice" ? row.invoice_items : row.quotation_items),
    notes: row.notes ?? undefined,
    status: docStatusLabel(row.status),
    dbStatus: row.status as DocStatusDb,
    total: Number(row.total),
    createdAt: row.created_at,
    dueAt: row.due_at ?? undefined,
    validUntil: row.valid_until ?? undefined,
  };
}

export async function listDocs(kind: DocKind): Promise<PayDoc[]> {
  if (kind === "invoice") {
    const { data, error } = await supabase
      .from("invoices")
      .select("*, invoice_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => mapDoc(r as unknown as RawDoc, "invoice"));
  }
  const { data, error } = await supabase
    .from("quotations")
    .select("*, quotation_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => mapDoc(r as unknown as RawDoc, "quotation"));
}

export async function listPayments(): Promise<PaymentRow[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*, invoices(number, client_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map((p) => {
    const row = p as unknown as {
      id: string;
      invoice_id: string | null;
      amount: number | string;
      currency: string;
      method: string;
      status: string;
      tx_ref: string | null;
      phone: string | null;
      created_at: string;
      invoices: { number: string; client_name: string } | null;
    };
    return {
      id: row.id,
      invoiceId: row.invoice_id,
      amount: Number(row.amount),
      currency: row.currency,
      method: row.method,
      status: txStatusLabel(row.status),
      txRef: row.tx_ref,
      phone: row.phone,
      createdAt: row.created_at,
      invoiceNumber: row.invoices?.number,
      clientName: row.invoices?.client_name,
    };
  });
}

export async function listActivity(limit = 100): Promise<ActivityRow[]> {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((a) => ({
    id: a.id,
    action: a.action,
    entity: a.entity,
    merchantId: a.merchant_id,
    invoiceId: a.invoice_id,
    meta: (a.meta ?? {}) as Record<string, unknown>,
    createdAt: a.created_at,
  }));
}

/* -------------------------------------------------------------- mutations */

export interface CreateInput {
  kind: DocKind;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCountry?: string;
  currency: string;
  items: Omit<LineItem, "id">[];
  notes?: string;
  dueInDays?: number;
  validForDays?: number;
}

export async function createDoc(input: CreateInput): Promise<PayDoc> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("You must be signed in to create documents.");

  const token = makeToken();
  const number = makeNumber(input.kind);
  const subtotal = input.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const base = {
    merchant_id: uid,
    token,
    number,
    client_name: input.clientName,
    client_email: input.clientEmail || null,
    client_phone: input.clientPhone || null,
    client_country: input.clientCountry || null,
    currency: input.currency || "USD",
    subtotal,
    tax: 0,
    total: subtotal,
    notes: input.notes || null,
  };

  if (input.kind === "invoice") {
    const { data, error } = await supabase
      .from("invoices")
      .insert({
        ...base,
        status: "sent",
        due_at: input.dueInDays
          ? new Date(Date.now() + input.dueInDays * 86400000).toISOString()
          : null,
      })
      .select("*")
      .single();
    if (error) throw error;

    const { error: itemsError } = await supabase.from("invoice_items").insert(
      input.items.map((i) => ({
        invoice_id: data.id,
        name: i.name,
        description: i.description || null,
        image_url: i.image || null,
        quantity: i.quantity,
        unit_price: i.unitPrice,
      })),
    );
    if (itemsError) throw itemsError;

    await logMerchantEvent("invoice.created", { invoice_id: data.id, number, total: subtotal });
    return { ...mapDoc(data as unknown as RawDoc, "invoice"), items: withIds(input.items) };
  }

  const { data, error } = await supabase
    .from("quotations")
    .insert({
      ...base,
      status: "sent",
      valid_until: new Date(
        Date.now() + (input.validForDays ?? 30) * 86400000,
      ).toISOString(),
    })
    .select("*")
    .single();
  if (error) throw error;

  const { error: itemsError } = await supabase.from("quotation_items").insert(
    input.items.map((i) => ({
      quotation_id: data.id,
      name: i.name,
      description: i.description || null,
      image_url: i.image || null,
      quantity: i.quantity,
      unit_price: i.unitPrice,
    })),
  );
  if (itemsError) throw itemsError;

  await logMerchantEvent("quotation.created", { quotation_id: data.id, number, total: subtotal });
  return { ...mapDoc(data as unknown as RawDoc, "quotation"), items: withIds(input.items) };
}

function withIds(items: Omit<LineItem, "id">[]): LineItem[] {
  return items.map((i, idx) => ({ ...i, id: `tmp-${idx}` }));
}

export async function setDocStatus(
  kind: DocKind,
  id: string,
  status: DocStatusDb,
) {
  const table = kind === "invoice" ? "invoices" : "quotations";
  const { error } = await supabase.from(table).update({ status }).eq("id", id);
  if (error) throw error;
  await logMerchantEvent(`${kind}.status_changed`, { id, status });
}

export async function deleteDoc(kind: DocKind, id: string) {
  const table = kind === "invoice" ? "invoices" : "quotations";
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

/** Converts an approved quotation into a live invoice with a fresh pay link. */
export async function convertQuotationToInvoice(q: PayDoc): Promise<PayDoc> {
  const doc = await createDoc({
    kind: "invoice",
    clientName: q.clientName,
    clientEmail: q.clientEmail,
    clientPhone: q.clientPhone,
    clientCountry: q.clientCountry,
    currency: q.currency,
    notes: q.notes,
    dueInDays: 14,
    items: q.items.map(({ name, description, image, quantity, unitPrice }) => ({
      name,
      description,
      image,
      quantity,
      unitPrice,
    })),
  });
  await supabase.from("invoices").update({ converted_from: q.id }).eq("id", doc.id);
  await setDocStatus("quotation", q.id, "approved");
  return doc;
}

async function logMerchantEvent(action: string, meta: Record<string, unknown>) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return;
  await supabase.from("activity_log").insert({
    actor_id: uid,
    merchant_id: uid,
    action,
    entity: "document",
    meta: meta as never,
  });
}

/* ------------------------------------------------------- public (no auth) */

type PublicDocPayload = {
  kind: DocKind;
  id: string;
  token: string;
  number: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_country: string | null;
  currency: string;
  total: number | string;
  status: string;
  notes: string | null;
  created_at: string;
  due_at?: string | null;
  valid_until?: string | null;
  merchant: {
    company: string | null;
    full_name: string | null;
    logo_url: string | null;
    brand_color: string | null;
    website: string | null;
    invoice_footer: string | null;
  } | null;
  items: RawItem[];
  payments: {
    id: string;
    amount: number | string;
    currency: string;
    method: string;
    status: string;
    created_at: string;
  }[];
};

/** Fetches an invoice/quotation using only the secret share token. */
export async function getPublicDoc(token: string): Promise<PayDoc | undefined> {
  const { data, error } = await supabase.rpc("get_public_doc", { _token: token });
  if (error || !data) return undefined;
  const p = data as unknown as PublicDocPayload;
  const approved = p.payments?.find((x) => x.status === "approved");
  return {
    id: p.id,
    token: p.token,
    kind: p.kind,
    number: p.number,
    clientName: p.client_name,
    clientEmail: p.client_email ?? "",
    clientPhone: p.client_phone ?? undefined,
    clientCountry: p.client_country ?? undefined,
    currency: p.currency,
    items: mapItems(p.items),
    notes: p.notes ?? undefined,
    status: docStatusLabel(p.status),
    dbStatus: p.status as DocStatusDb,
    total: Number(p.total),
    createdAt: p.created_at,
    dueAt: p.due_at ?? undefined,
    validUntil: p.valid_until ?? undefined,
    paidWith: approved?.method,
    paidAt: approved?.created_at,
    merchant: p.merchant
      ? {
          company: p.merchant.company,
          fullName: p.merchant.full_name,
          logoUrl: p.merchant.logo_url,
          brandColor: p.merchant.brand_color,
          website: p.merchant.website,
          invoiceFooter: p.merchant.invoice_footer,
        }
      : undefined,
  };
}

/** Records a payment attempt from the public checkout. */
export async function recordPublicPayment(opts: {
  token: string;
  method: string;
  status?: "pending" | "processing" | "approved" | "failed";
  phone?: string;
  walletAddress?: string;
  txRef?: string;
  meta?: Record<string, unknown>;
}) {
  const { data, error } = await supabase.rpc("record_public_payment", {
    _token: opts.token,
    _method: opts.method,
    _phone: opts.phone ?? undefined,
    _wallet_address: opts.walletAddress ?? undefined,
    _status: opts.status ?? "pending",
    _tx_ref: opts.txRef ?? undefined,
    _meta: (opts.meta ?? {}) as never,
  });
  if (error) throw error;
  return data as string;
}

/** Fire-and-forget checkout telemetry keyed on the share token. */
export function logPublicEvent(
  token: string,
  action: string,
  meta: Record<string, unknown> = {},
) {
  void supabase.rpc("log_public_doc_event", {
    _token: token,
    _action: action,
    _meta: meta as never,
  });
}

/** Active payout destinations configured by platform admins. */
export async function getPayoutTargets(country?: string) {
  const { data, error } = await supabase.rpc("get_payout_targets", {
    _country: country ?? undefined,
  });
  if (error) return [];
  return (data ?? []) as {
    id: string;
    kind: string;
    label: string;
    country: string | null;
    currency: string | null;
    details: Record<string, string>;
  }[];
}

/* -------------------------------------------------------------- analytics */

export interface MerchantStats {
  revenue: number;
  outstanding: number;
  successful: number;
  pending: number;
  failed: number;
  invoiceCount: number;
  quotationCount: number;
  clientCount: number;
  currency: string;
  monthly: { month: string; revenue: number }[];
  methodBreakdown: { name: string; value: number }[];
  recent: PaymentRow[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getMerchantStats(): Promise<MerchantStats> {
  const [invoices, quotations, payments] = await Promise.all([
    listDocs("invoice"),
    listDocs("quotation"),
    listPayments(),
  ]);

  const currency = invoices[0]?.currency ?? "USD";
  const approved = payments.filter((p) => p.status === "Approved");
  const revenue = approved.reduce((s, p) => s + p.amount, 0);
  const outstanding = invoices
    .filter((i) => i.dbStatus !== "paid" && i.dbStatus !== "cancelled")
    .reduce((s, i) => s + docTotal(i), 0);

  const monthBuckets = new Map<string, number>();
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthBuckets.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
  }
  for (const p of approved) {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthBuckets.has(key)) monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + p.amount);
  }
  const monthly = Array.from(monthBuckets.entries()).map(([key, revenueValue]) => ({
    month: MONTHS[Number(key.split("-")[1])],
    revenue: revenueValue,
  }));

  const groups = new Map<string, number>();
  for (const p of approved) {
    const name = groupMethod(p.method);
    groups.set(name, (groups.get(name) ?? 0) + p.amount);
  }
  const groupTotal = Array.from(groups.values()).reduce((s, v) => s + v, 0);
  const methodBreakdown = Array.from(groups.entries()).map(([name, v]) => ({
    name,
    value: groupTotal ? Math.round((v / groupTotal) * 100) : 0,
  }));

  const clients = new Set(
    [...invoices, ...quotations].map((d) => d.clientEmail || d.clientName),
  );

  return {
    revenue,
    outstanding,
    successful: approved.length,
    pending: payments.filter((p) => p.status === "Pending" || p.status === "Processing").length,
    failed: payments.filter((p) => p.status === "Failed").length,
    invoiceCount: invoices.length,
    quotationCount: quotations.length,
    clientCount: clients.size,
    currency,
    monthly,
    methodBreakdown,
    recent: payments.slice(0, 6),
  };
}

function groupMethod(method: string) {
  const m = method.toLowerCase();
  if (m.includes("btc") || m.includes("usdt") || m.includes("eth")) return "Crypto";
  if (m.includes("pesa") || m.includes("momo") || m.includes("airtel") || m.includes("orange"))
    return "Mobile money";
  if (m.includes("bank") || m.includes("wire")) return "Bank / Wire";
  return "Cards";
}
