
-- Create evaluations table
CREATE TABLE public.evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id),
  moderator_id uuid NOT NULL,
  flags_checked text[] NOT NULL DEFAULT '{}',
  notes text,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check moderator/admin role
CREATE OR REPLACE FUNCTION public.is_moderator(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id
      AND role IN ('moderator', 'admin')
  )
$$;

-- Moderators can SELECT all sessions (read-only for review)
CREATE POLICY "Moderators can view all sessions"
ON public.sessions
FOR SELECT
TO authenticated
USING (public.is_moderator(auth.uid()));

-- Moderators can SELECT all messages (for transcript review)
CREATE POLICY "Moderators can view all messages"
ON public.messages
FOR SELECT
TO authenticated
USING (public.is_moderator(auth.uid()));

-- Moderators can INSERT evaluations
CREATE POLICY "Moderators can insert evaluations"
ON public.evaluations
FOR INSERT
TO authenticated
WITH CHECK (public.is_moderator(auth.uid()) AND auth.uid() = moderator_id);

-- Moderators can view evaluations
CREATE POLICY "Moderators can view evaluations"
ON public.evaluations
FOR SELECT
TO authenticated
USING (public.is_moderator(auth.uid()));

-- Moderators can view all profiles (for listener overview)
CREATE POLICY "Moderators can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_moderator(auth.uid()));

-- Moderators can view all formation progress
CREATE POLICY "Moderators can view all formation progress"
ON public.formation_progress
FOR SELECT
TO authenticated
USING (public.is_moderator(auth.uid()));
