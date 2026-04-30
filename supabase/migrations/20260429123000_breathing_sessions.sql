CREATE TABLE IF NOT EXISTS public.breathing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pattern TEXT NOT NULL CHECK (pattern IN ('calm', 'box', 'slow')),
  duration_seconds INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  mood_after TEXT CHECK (
    mood_after IS NULL OR mood_after IN ('clear', 'cloudy', 'stormy', 'heavy', 'warming_up', 'foggy')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.breathing_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_owns_breathing_sessions" ON public.breathing_sessions;
CREATE POLICY "user_owns_breathing_sessions"
  ON public.breathing_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.dashboard_widgets
  DROP CONSTRAINT IF EXISTS dashboard_widgets_type_check;

ALTER TABLE public.dashboard_widgets
  ADD CONSTRAINT dashboard_widgets_type_check
  CHECK (type IN (
    'sticky_note',
    'mood_reflection',
    'counter',
    'journal_quick',
    'emotional_weather',
    'today_i_am',
    'memory_shelf',
    'one_thing_helped',
    'breathe'
  ));

