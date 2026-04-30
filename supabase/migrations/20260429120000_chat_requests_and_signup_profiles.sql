CREATE TABLE IF NOT EXISTS public.chat_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listener_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Seekers can create own chat requests" ON public.chat_requests;
CREATE POLICY "Seekers can create own chat requests"
  ON public.chat_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seeker_id);

DROP POLICY IF EXISTS "Seekers can view own chat requests" ON public.chat_requests;
CREATE POLICY "Seekers can view own chat requests"
  ON public.chat_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = seeker_id);

DROP POLICY IF EXISTS "Listeners can view pending and own chat requests" ON public.chat_requests;
CREATE POLICY "Listeners can view pending and own chat requests"
  ON public.chat_requests FOR SELECT
  TO authenticated
  USING (
    (
      status = 'pending'
      AND EXISTS (SELECT 1 FROM public.listener_profiles WHERE user_id = auth.uid())
    )
    OR auth.uid() = listener_id
  );

DROP POLICY IF EXISTS "Seekers can cancel own pending chat requests" ON public.chat_requests;
CREATE POLICY "Seekers can cancel own pending chat requests"
  ON public.chat_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = seeker_id AND status = 'pending')
  WITH CHECK (auth.uid() = seeker_id AND status = 'cancelled');

CREATE OR REPLACE TRIGGER update_chat_requests_updated_at
  BEFORE UPDATE ON public.chat_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.accept_chat_request(request_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  listener UUID := auth.uid();
  request_row public.chat_requests%ROWTYPE;
  new_session_id UUID;
BEGIN
  IF listener IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.listener_profiles WHERE user_id = listener) THEN
    RAISE EXCEPTION 'Only listeners can accept chat requests';
  END IF;

  SELECT *
    INTO request_row
    FROM public.chat_requests
   WHERE id = request_id
     AND status = 'pending'
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chat request is no longer available';
  END IF;

  INSERT INTO public.sessions (
    seeker_id,
    listener_id,
    status,
    topic_snippet,
    topics,
    created_at
  )
  VALUES (
    request_row.seeker_id,
    listener,
    'active',
    request_row.title,
    ARRAY[request_row.topic],
    now()
  )
  RETURNING id INTO new_session_id;

  UPDATE public.chat_requests
     SET status = 'active',
         listener_id = listener,
         session_id = new_session_id
   WHERE id = request_id;

  RETURN new_session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_chat_request(UUID) TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_requests;

CREATE OR REPLACE FUNCTION public.create_profile_from_signup_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role TEXT := NEW.raw_user_meta_data ->> 'role';
BEGIN
  IF requested_role = 'seeker' THEN
    INSERT INTO public.seeker_profiles (user_id, username, email)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username', NEW.email)
    ON CONFLICT DO NOTHING;
  ELSIF requested_role = 'listener' THEN
    INSERT INTO public.listener_profiles (
      user_id,
      role,
      first_name,
      last_name,
      country,
      gender,
      username,
      email,
      bio,
      topics_comfortable,
      topics_avoid,
      topics_lived_experience,
      languages,
      verified_agreements
    )
    VALUES (
      NEW.id,
      'listener',
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name',
      NEW.raw_user_meta_data ->> 'country',
      NEW.raw_user_meta_data ->> 'gender',
      NEW.raw_user_meta_data ->> 'username',
      NEW.email,
      NEW.raw_user_meta_data ->> 'bio',
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data -> 'topics_comfortable')), ARRAY[]::TEXT[]),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data -> 'topics_avoid')), ARRAY[]::TEXT[]),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data -> 'topics_lived_experience')), ARRAY[]::TEXT[]),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data -> 'languages')), ARRAY[]::TEXT[]),
      true
    )
    ON CONFLICT DO NOTHING;

    INSERT INTO public.formation_progress (user_id, steps_completed, bot_passed)
    VALUES (NEW.id, ARRAY[]::TEXT[], false)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_from_signup_metadata();

