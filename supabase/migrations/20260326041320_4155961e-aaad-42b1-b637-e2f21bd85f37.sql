ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS theme text DEFAULT 'light',
  ADD COLUMN IF NOT EXISTS chat_bg_url text,
  ADD COLUMN IF NOT EXISTS chat_bg_intensity integer DEFAULT 20;

INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-backgrounds', 'chat-backgrounds', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own chat backgrounds"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'chat-backgrounds' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view chat backgrounds"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'chat-backgrounds');

CREATE POLICY "Users can update own chat backgrounds"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'chat-backgrounds' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own chat backgrounds"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'chat-backgrounds' AND (storage.foldername(name))[1] = auth.uid()::text);