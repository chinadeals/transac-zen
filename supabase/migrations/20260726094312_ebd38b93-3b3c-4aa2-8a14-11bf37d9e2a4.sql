
-- 1) Remove broad public read access; replace with token-scoped RPCs
DROP POLICY IF EXISTS "public read invoices by token" ON public.invoices;
DROP POLICY IF EXISTS "public read quotations by token" ON public.quotations;
DROP POLICY IF EXISTS "invoice items visible" ON public.invoice_items;
DROP POLICY IF EXISTS "quotation items visible" ON public.quotation_items;
DROP POLICY IF EXISTS "public reads payments by invoice" ON public.payments;

CREATE POLICY "merchant reads own invoice items" ON public.invoice_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND (i.merchant_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "merchant reads own quotation items" ON public.quotation_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quotation_id AND (q.merchant_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

REVOKE SELECT ON public.invoices FROM anon;
REVOKE SELECT ON public.quotations FROM anon;
REVOKE SELECT ON public.invoice_items FROM anon;
REVOKE SELECT ON public.quotation_items FROM anon;
REVOKE SELECT ON public.payments FROM anon;

-- 2) Token-scoped public lookup (unguessable token acts as the credential)
CREATE OR REPLACE FUNCTION public.get_public_doc(_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  IF _token IS NULL OR length(_token) < 8 THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'kind', 'invoice',
    'id', i.id, 'token', i.token, 'number', i.number,
    'client_name', i.client_name, 'client_email', i.client_email,
    'client_phone', i.client_phone, 'client_country', i.client_country,
    'currency', i.currency, 'subtotal', i.subtotal, 'tax', i.tax, 'total', i.total,
    'status', i.status, 'notes', i.notes, 'due_at', i.due_at,
    'created_at', i.created_at,
    'merchant', jsonb_build_object(
      'company', p.company, 'full_name', p.full_name,
      'logo_url', p.logo_url, 'brand_color', p.brand_color,
      'website', p.website, 'invoice_footer', p.invoice_footer
    ),
    'items', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', it.id, 'name', it.name, 'description', it.description,
        'image_url', it.image_url, 'quantity', it.quantity, 'unit_price', it.unit_price
      ) ORDER BY it.created_at)
      FROM public.invoice_items it WHERE it.invoice_id = i.id
    ), '[]'::jsonb),
    'payments', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', pay.id, 'amount', pay.amount, 'currency', pay.currency,
        'method', pay.method, 'status', pay.status, 'tx_ref', pay.tx_ref,
        'created_at', pay.created_at
      ) ORDER BY pay.created_at DESC)
      FROM public.payments pay WHERE pay.invoice_id = i.id
    ), '[]'::jsonb)
  )
  INTO result
  FROM public.invoices i
  LEFT JOIN public.profiles p ON p.id = i.merchant_id
  WHERE i.token = _token;

  IF result IS NOT NULL THEN
    RETURN result;
  END IF;

  SELECT jsonb_build_object(
    'kind', 'quotation',
    'id', q.id, 'token', q.token, 'number', q.number,
    'client_name', q.client_name, 'client_email', q.client_email,
    'client_phone', q.client_phone, 'client_country', q.client_country,
    'currency', q.currency, 'subtotal', q.subtotal, 'tax', q.tax, 'total', q.total,
    'status', q.status, 'notes', q.notes, 'valid_until', q.valid_until,
    'created_at', q.created_at,
    'merchant', jsonb_build_object(
      'company', p.company, 'full_name', p.full_name,
      'logo_url', p.logo_url, 'brand_color', p.brand_color,
      'website', p.website, 'invoice_footer', p.invoice_footer
    ),
    'items', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', it.id, 'name', it.name, 'description', it.description,
        'image_url', it.image_url, 'quantity', it.quantity, 'unit_price', it.unit_price
      ) ORDER BY it.created_at)
      FROM public.quotation_items it WHERE it.quotation_id = q.id
    ), '[]'::jsonb),
    'payments', '[]'::jsonb
  )
  INTO result
  FROM public.quotations q
  LEFT JOIN public.profiles p ON p.id = q.merchant_id
  WHERE q.token = _token;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_doc(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_doc(TEXT) TO anon, authenticated, service_role;

-- 3) Token-scoped payment recording (replaces the permissive anon INSERT policy)
DROP POLICY IF EXISTS "public creates payment attempts" ON public.payments;
REVOKE INSERT ON public.payments FROM anon;

DROP POLICY IF EXISTS "merchant creates own payments" ON public.payments;
CREATE POLICY "merchant creates own payments" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (merchant_id = auth.uid());

CREATE OR REPLACE FUNCTION public.record_public_payment(
  _token TEXT,
  _method TEXT,
  _phone TEXT DEFAULT NULL,
  _wallet_address TEXT DEFAULT NULL,
  _status TEXT DEFAULT 'pending',
  _tx_ref TEXT DEFAULT NULL,
  _meta JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv public.invoices;
  new_id UUID;
  st public.payment_status;
BEGIN
  IF _token IS NULL OR length(_token) < 8 THEN
    RAISE EXCEPTION 'invalid token';
  END IF;
  IF _method IS NULL OR length(_method) > 40 THEN
    RAISE EXCEPTION 'invalid method';
  END IF;

  SELECT * INTO inv FROM public.invoices WHERE token = _token;
  IF inv.id IS NULL THEN
    RAISE EXCEPTION 'document not found';
  END IF;

  st := COALESCE(NULLIF(_status,'')::public.payment_status, 'pending');

  INSERT INTO public.payments (
    invoice_id, merchant_id, amount, currency, method, status,
    tx_ref, phone, wallet_address, meta
  ) VALUES (
    inv.id, inv.merchant_id, inv.total, inv.currency, _method, st,
    left(_tx_ref, 120), left(_phone, 40), left(_wallet_address, 120),
    COALESCE(_meta, '{}'::jsonb)
  ) RETURNING id INTO new_id;

  IF st = 'approved' THEN
    UPDATE public.invoices SET status = 'paid' WHERE id = inv.id;
  END IF;

  INSERT INTO public.activity_log (merchant_id, invoice_id, payment_id, action, entity, entity_id, meta)
  VALUES (inv.merchant_id, inv.id, new_id,
          CASE WHEN st = 'approved' THEN 'payment.approved' ELSE 'payment.' || st::text END,
          'payment', new_id, jsonb_build_object('method', _method));

  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_public_payment(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_public_payment(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,JSONB) TO anon, authenticated, service_role;

-- 4) Public activity logging via token-scoped RPC only
DROP POLICY IF EXISTS "anyone can log activity" ON public.activity_log;
REVOKE INSERT ON public.activity_log FROM anon;

DROP POLICY IF EXISTS "own activity insert" ON public.activity_log;
CREATE POLICY "own activity insert" ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

CREATE OR REPLACE FUNCTION public.log_public_doc_event(
  _token TEXT,
  _action TEXT,
  _meta JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m UUID;
  inv UUID;
BEGIN
  IF _token IS NULL OR length(_token) < 8 THEN RETURN; END IF;
  IF _action IS NULL OR length(_action) > 60 THEN RETURN; END IF;

  SELECT merchant_id, id INTO m, inv FROM public.invoices WHERE token = _token;
  IF m IS NULL THEN
    SELECT merchant_id INTO m FROM public.quotations WHERE token = _token;
  END IF;
  IF m IS NULL THEN RETURN; END IF;

  INSERT INTO public.activity_log (merchant_id, invoice_id, action, entity, meta)
  VALUES (m, inv, _action, 'document', COALESCE(_meta, '{}'::jsonb));
END;
$$;

REVOKE ALL ON FUNCTION public.log_public_doc_event(TEXT,TEXT,JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_public_doc_event(TEXT,TEXT,JSONB) TO anon, authenticated, service_role;

-- 5) collection_accounts: expose only active payout targets, not raw table access
DROP POLICY IF EXISTS "public read active accounts" ON public.collection_accounts;
DROP POLICY IF EXISTS "authenticated read active accounts" ON public.collection_accounts;
CREATE POLICY "authenticated read active accounts" ON public.collection_accounts FOR SELECT TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(),'admin'));
REVOKE SELECT ON public.collection_accounts FROM anon;

CREATE OR REPLACE FUNCTION public.get_payout_targets(_country TEXT DEFAULT NULL)
RETURNS TABLE (id UUID, kind public.collection_kind, label TEXT, country TEXT, currency TEXT, details JSONB)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.kind, c.label, c.country, c.currency, c.details
  FROM public.collection_accounts c
  WHERE c.is_active = true
    AND (_country IS NULL OR c.country IS NULL OR c.country = _country);
$$;

REVOKE ALL ON FUNCTION public.get_payout_targets(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_payout_targets(TEXT) TO anon, authenticated, service_role;
