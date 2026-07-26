
CREATE POLICY "logos read" ON storage.objects FOR SELECT TO authenticated, anon
  USING (bucket_id = 'logos');
CREATE POLICY "logos insert own folder" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "logos update own folder" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "logos delete own folder" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);
