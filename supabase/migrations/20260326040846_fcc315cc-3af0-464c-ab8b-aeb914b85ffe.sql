CREATE TABLE public.aura_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id uuid NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  flagged boolean NOT NULL DEFAULT false
);

ALTER TABLE public.aura_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own aura sessions"
  ON public.aura_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seeker_id);

CREATE POLICY "Users can view own aura sessions"
  ON public.aura_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = seeker_id);

CREATE POLICY "Users can update own aura sessions"
  ON public.aura_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = seeker_id);