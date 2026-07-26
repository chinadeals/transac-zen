
-- Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#00B67A',
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS tax_id TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS invoice_footer TEXT,
  ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS onboarded BOOLEAN NOT NULL DEFAULT false;

-- Enums
DO $$ BEGIN
  CREATE TYPE public.doc_status AS ENUM ('draft','sent','viewed','paid','partially_paid','overdue','cancelled','expired','approved','declined');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending','processing','approved','failed','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Quotations
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_country TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax NUMERIC(14,2) NOT NULL DEFAULT 0,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  status public.doc_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotations TO authenticated;
GRANT SELECT ON public.quotations TO anon;
GRANT ALL ON public.quotations TO service_role;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchant manages own quotations" ON public.quotations FOR ALL TO authenticated
  USING (auth.uid() = merchant_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "public read quotations by token" ON public.quotations FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotation_items TO authenticated;
GRANT SELECT ON public.quotation_items TO anon;
GRANT ALL ON public.quotation_items TO service_role;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quotation items visible" ON public.quotation_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "merchant writes own quotation items" ON public.quotation_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quotation_id AND (q.merchant_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quotation_id AND q.merchant_id = auth.uid()));

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_country TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax NUMERIC(14,2) NOT NULL DEFAULT 0,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  status public.doc_status NOT NULL DEFAULT 'sent',
  notes TEXT,
  due_at TIMESTAMPTZ,
  converted_from UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT SELECT ON public.invoices TO anon;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchant manages own invoices" ON public.invoices FOR ALL TO authenticated
  USING (auth.uid() = merchant_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "public read invoices by token" ON public.invoices FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
GRANT SELECT ON public.invoice_items TO anon;
GRANT ALL ON public.invoice_items TO service_role;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoice items visible" ON public.invoice_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "merchant writes own invoice items" ON public.invoice_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND (i.merchant_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND i.merchant_id = auth.uid()));

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  method TEXT NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  tx_ref TEXT,
  phone TEXT,
  wallet_address TEXT,
  collection_account_id UUID REFERENCES public.collection_accounts(id) ON DELETE SET NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT SELECT, INSERT ON public.payments TO anon;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchant reads own payments" ON public.payments FOR SELECT TO authenticated
  USING (merchant_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "merchant updates own payments" ON public.payments FOR UPDATE TO authenticated
  USING (merchant_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (merchant_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "public reads payments by invoice" ON public.payments FOR SELECT TO anon USING (true);
CREATE POLICY "public creates payment attempts" ON public.payments FOR INSERT TO anon, authenticated WITH CHECK (
  invoice_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id)
);

-- Activity log
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  merchant_id UUID,
  invoice_id UUID,
  payment_id UUID,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id UUID,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT INSERT ON public.activity_log TO anon;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchant reads own activity" ON public.activity_log FOR SELECT TO authenticated
  USING (merchant_id = auth.uid() OR actor_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "anyone can log activity" ON public.activity_log FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Updated-at triggers
DROP TRIGGER IF EXISTS trg_quotations_updated ON public.quotations;
CREATE TRIGGER trg_quotations_updated BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_invoices_updated ON public.invoices;
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_payments_updated ON public.payments;
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_merchant ON public.invoices(merchant_id);
CREATE INDEX IF NOT EXISTS idx_quotations_merchant ON public.quotations(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_merchant ON public.payments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_activity_merchant ON public.activity_log(merchant_id, created_at DESC);
