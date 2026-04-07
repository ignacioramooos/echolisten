
-- Bug 1: Allow listeners to claim waiting sessions
CREATE POLICY "Listeners can claim waiting sessions"
  ON public.sessions
  FOR UPDATE
  USING (
    status = 'waiting'
    AND EXISTS (
      SELECT 1 FROM public.listener_profiles
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    listener_id = auth.uid()
    AND status = 'active'
  );

-- Bug 2: Move misplaced seeker rows from listener_profiles to seeker_profiles
INSERT INTO public.seeker_profiles (user_id, email, created_at)
SELECT lp.user_id, lp.email, lp.created_at
FROM public.listener_profiles lp
WHERE lp.role = 'seeker'
ON CONFLICT DO NOTHING;

DELETE FROM public.listener_profiles WHERE role = 'seeker';
