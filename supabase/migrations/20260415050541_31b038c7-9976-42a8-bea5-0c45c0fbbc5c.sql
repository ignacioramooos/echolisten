ALTER TABLE public.journal_entries ADD COLUMN read_at TIMESTAMPTZ DEFAULT NULL;

-- Allow listeners to read entries shared with them
CREATE POLICY "Listeners can view entries shared with them"
ON public.journal_entries
FOR SELECT
TO authenticated
USING (auth.uid() = listener_id AND visibility != 'private');

-- Allow listeners to update read_at on entries shared with them
CREATE POLICY "Listeners can mark shared entries as read"
ON public.journal_entries
FOR UPDATE
TO authenticated
USING (auth.uid() = listener_id AND visibility != 'private')
WITH CHECK (auth.uid() = listener_id AND visibility != 'private');

-- Enable realtime for journal_entries so listeners get notified
ALTER PUBLICATION supabase_realtime ADD TABLE public.journal_entries;