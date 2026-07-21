// Mock data for PayFlow Gateway. Replace with Supabase queries when backend is wired up.

export type ClientStatus = "Active" | "Pending" | "Suspended";
export type QuotationStatus = "Draft" | "Sent" | "Viewed" | "Approved" | "Rejected";
export type InvoiceStatus = "Draft" | "Unpaid" | "Partially Paid" | "Paid" | "Overdue";
export type TxStatus = "Pending" | "Processing" | "Approved" | "Failed" | "Refunded";
export type PaymentMethod =
  | "Visa"
  | "Mastercard"
  | "Amex"
  | "Bank Transfer"
  | "Wire"
  | "BTC"
  | "ETH"
  | "USDT (TRC20)"
  | "USDT (ERC20)"
  | "M-Pesa"
  | "MTN MoMo"
  | "Airtel Money"
  | "Orange Money";

export interface Client {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  country: string;
  status: ClientStatus;
  totalBilled: number;
  createdAt: string;
}

export interface Quotation {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  amount: number;
  currency: string;
  status: QuotationStatus;
  createdAt: string;
  validUntil: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  amount: number;
  paid: number;
  currency: string;
  status: InvoiceStatus;
  issued: string;
  due: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  clientName: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  status: TxStatus;
  date: string;
}

export const clients: Client[] = [
  { id: "c1", company: "Northwind Traders", contact: "Ada Okoye", email: "ada@northwind.co", phone: "+234 803 555 0110", country: "Nigeria", status: "Active", totalBilled: 148200, createdAt: "2025-11-02" },
  { id: "c2", company: "Helios Robotics", contact: "Marc Dubois", email: "marc@helios.io", phone: "+33 6 12 34 56 78", country: "France", status: "Active", totalBilled: 92100, createdAt: "2025-09-14" },
  { id: "c3", company: "Kaizen Studios", contact: "Yuki Tanaka", email: "yuki@kaizen.jp", phone: "+81 90 1234 5678", country: "Japan", status: "Pending", totalBilled: 12400, createdAt: "2026-02-04" },
  { id: "c4", company: "Andes Freight", contact: "Camila Rojas", email: "camila@andes.cl", phone: "+56 9 8765 4321", country: "Chile", status: "Active", totalBilled: 65800, createdAt: "2025-07-22" },
  { id: "c5", company: "Bluewave Media", contact: "Ellis Turner", email: "ellis@bluewave.co", phone: "+44 20 7946 0102", country: "United Kingdom", status: "Suspended", totalBilled: 4200, createdAt: "2025-05-30" },
  { id: "c6", company: "Sahara Solar", contact: "Farid Nasser", email: "farid@saharasolar.ma", phone: "+212 6 61 22 33 44", country: "Morocco", status: "Active", totalBilled: 218000, createdAt: "2024-12-11" },
  { id: "c7", company: "Loop Analytics", contact: "Priya Menon", email: "priya@loop.ai", phone: "+91 98765 43210", country: "India", status: "Active", totalBilled: 37600, createdAt: "2026-01-19" },
];

export const quotations: Quotation[] = [
  { id: "q1", number: "QT-2026-0142", clientId: "c1", clientName: "Northwind Traders", amount: 24800, currency: "USD", status: "Approved", createdAt: "2026-07-01", validUntil: "2026-07-30" },
  { id: "q2", number: "QT-2026-0143", clientId: "c2", clientName: "Helios Robotics", amount: 18400, currency: "EUR", status: "Sent", createdAt: "2026-07-05", validUntil: "2026-08-04" },
  { id: "q3", number: "QT-2026-0144", clientId: "c3", clientName: "Kaizen Studios", amount: 6200, currency: "USD", status: "Viewed", createdAt: "2026-07-08", validUntil: "2026-08-07" },
  { id: "q4", number: "QT-2026-0145", clientId: "c4", clientName: "Andes Freight", amount: 42100, currency: "USD", status: "Draft", createdAt: "2026-07-10", validUntil: "2026-08-09" },
  { id: "q5", number: "QT-2026-0146", clientId: "c6", clientName: "Sahara Solar", amount: 128500, currency: "USD", status: "Approved", createdAt: "2026-07-11", validUntil: "2026-08-10" },
  { id: "q6", number: "QT-2026-0147", clientId: "c7", clientName: "Loop Analytics", amount: 9800, currency: "USD", status: "Rejected", createdAt: "2026-07-12", validUntil: "2026-08-11" },
];

export const invoices: Invoice[] = [
  { id: "i1", number: "INV-3210", clientId: "c1", clientName: "Northwind Traders", amount: 24800, paid: 24800, currency: "USD", status: "Paid", issued: "2026-07-02", due: "2026-07-16" },
  { id: "i2", number: "INV-3211", clientId: "c6", clientName: "Sahara Solar", amount: 128500, paid: 64000, currency: "USD", status: "Partially Paid", issued: "2026-07-11", due: "2026-07-25" },
  { id: "i3", number: "INV-3212", clientId: "c2", clientName: "Helios Robotics", amount: 18400, paid: 0, currency: "EUR", status: "Unpaid", issued: "2026-07-06", due: "2026-07-20" },
  { id: "i4", number: "INV-3213", clientId: "c4", clientName: "Andes Freight", amount: 42100, paid: 0, currency: "USD", status: "Overdue", issued: "2026-06-14", due: "2026-06-28" },
  { id: "i5", number: "INV-3214", clientId: "c7", clientName: "Loop Analytics", amount: 3200, paid: 3200, currency: "USD", status: "Paid", issued: "2026-07-08", due: "2026-07-22" },
  { id: "i6", number: "INV-3215", clientId: "c3", clientName: "Kaizen Studios", amount: 6200, paid: 0, currency: "USD", status: "Draft", issued: "2026-07-13", due: "2026-07-27" },
];

export const transactions: Transaction[] = [
  { id: "t1", invoiceNumber: "INV-3210", clientName: "Northwind Traders", method: "Visa", amount: 24800, currency: "USD", status: "Approved", date: "2026-07-14 09:22" },
  { id: "t2", invoiceNumber: "INV-3211", clientName: "Sahara Solar", method: "Wire", amount: 64000, currency: "USD", status: "Approved", date: "2026-07-13 17:05" },
  { id: "t3", invoiceNumber: "INV-3214", clientName: "Loop Analytics", method: "Mastercard", amount: 3200, currency: "USD", status: "Approved", date: "2026-07-12 11:48" },
  { id: "t4", invoiceNumber: "INV-3212", clientName: "Helios Robotics", method: "BTC", amount: 18400, currency: "EUR", status: "Processing", date: "2026-07-15 08:14" },
  { id: "t5", invoiceNumber: "INV-3213", clientName: "Andes Freight", method: "USDT (TRC20)", amount: 42100, currency: "USD", status: "Pending", date: "2026-07-15 10:02" },
  { id: "t6", invoiceNumber: "INV-3209", clientName: "Bluewave Media", method: "Amex", amount: 4200, currency: "USD", status: "Failed", date: "2026-07-10 15:33" },
  { id: "t7", invoiceNumber: "INV-3208", clientName: "Northwind Traders", method: "ETH", amount: 12400, currency: "USD", status: "Refunded", date: "2026-07-09 12:20" },
  { id: "t8", invoiceNumber: "INV-3207", clientName: "Helios Robotics", method: "Bank Transfer", amount: 8600, currency: "EUR", status: "Approved", date: "2026-07-08 09:10" },
];

export const monthlyRevenue = [
  { month: "Jan", revenue: 42000 },
  { month: "Feb", revenue: 58000 },
  { month: "Mar", revenue: 71000 },
  { month: "Apr", revenue: 64000 },
  { month: "May", revenue: 88000 },
  { month: "Jun", revenue: 102000 },
  { month: "Jul", revenue: 128500 },
];

export const paymentMethodBreakdown = [
  { name: "Cards", value: 48 },
  { name: "Bank / Wire", value: 27 },
  { name: "Crypto", value: 25 },
];

export const stats = {
  totalRevenue: 553500,
  successful: 412,
  pending: 18,
  failed: 6,
  activeClients: 5,
  outstanding: 188600,
};

export function statusTone(
  status: ClientStatus | QuotationStatus | InvoiceStatus | TxStatus,
): "success" | "warning" | "destructive" | "muted" | "primary" {
  switch (status) {
    case "Active":
    case "Approved":
    case "Paid":
      return "success";
    case "Pending":
    case "Sent":
    case "Viewed":
    case "Processing":
    case "Partially Paid":
    case "Unpaid":
      return "warning";
    case "Draft":
      return "muted";
    case "Rejected":
    case "Suspended":
    case "Failed":
    case "Overdue":
      return "destructive";
    case "Refunded":
      return "primary";
    default:
      return "muted";
  }
}

export function fmt(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
