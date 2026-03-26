
-- 1. Rename profiles → listener_profiles
ALTER TABLE public.profiles RENAME TO listener_profiles;

-- 2. Create seeker_profiles table
CREATE TABLE public.seeker_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  username text UNIQUE,
  email text,
  created_at timestamptz DEFAULT now()
);

-- 3. Enable RLS on seeker_profiles
ALTER TABLE public.seeker_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers can view own profile" ON public.seeker_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Seekers can insert own profile" ON public.seeker_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Seekers can update own profile" ON public.seeker_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Add topics and requested_language columns to sessions
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS topics text[] DEFAULT '{}';
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS requested_language text;

-- 5. Update is_moderator function to reference listener_profiles
CREATE OR REPLACE FUNCTION public.is_moderator(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.listener_profiles
    WHERE user_id = _user_id
      AND role IN ('moderator', 'admin')
  )
$$;

-- 6. Update check_username_available to check both tables
CREATE OR REPLACE FUNCTION public.check_username_available(desired_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.listener_profiles WHERE username = desired_username
    UNION ALL
    SELECT 1 FROM public.seeker_profiles WHERE username = desired_username
  )
$$;

-- 7. Enable realtime for sessions (for queue updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.seeker_profiles;
