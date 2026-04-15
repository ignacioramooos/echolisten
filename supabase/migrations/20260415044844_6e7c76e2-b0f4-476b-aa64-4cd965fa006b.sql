
-- Journal entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN (
    'free', 'guided', 'bullet', 'unspeakable', 'one_sentence', 'prompted'
  )),
  content TEXT,
  mood_before TEXT,
  mood_after TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN (
    'private', 'shared_full', 'shared_summary', 'shared_sentence'
  )),
  shared_fragment TEXT,
  listener_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dashboard widget layout
CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'sticky_note', 'mood_reflection', 'counter',
    'journal_quick', 'emotional_weather',
    'today_i_am', 'memory_shelf', 'one_thing_helped'
  )),
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 1,
  height INTEGER NOT NULL DEFAULT 1,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mood logs
CREATE TABLE mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  primary_feeling TEXT,
  reason TEXT,
  need_now TEXT,
  emotional_weather TEXT CHECK (emotional_weather IN (
    'clear', 'cloudy', 'stormy', 'heavy', 'warming_up', 'foggy'
  )),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Counters
CREATE TABLE counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  counter_type TEXT NOT NULL CHECK (counter_type IN ('since', 'times')),
  start_date TIMESTAMPTZ DEFAULT now(),
  count INTEGER DEFAULT 0,
  last_reset TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Memory shelf
CREATE TABLE memory_shelf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_shelf ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_owns_entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_owns_widgets" ON dashboard_widgets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_owns_moods" ON mood_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_owns_counters" ON counters
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_owns_shelf" ON memory_shelf
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
