
ALTER TABLE public.formation_progress 
  ADD COLUMN IF NOT EXISTS score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quiz_answers jsonb DEFAULT '{}';
