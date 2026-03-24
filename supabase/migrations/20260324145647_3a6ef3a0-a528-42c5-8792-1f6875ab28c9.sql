
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS timer_end_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS extensions_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS extend_votes text[] NOT NULL DEFAULT '{}';
