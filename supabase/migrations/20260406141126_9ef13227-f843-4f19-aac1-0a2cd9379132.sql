
-- Fix listener_profiles default role from 'seeker' to 'listener'
ALTER TABLE public.listener_profiles ALTER COLUMN role SET DEFAULT 'listener';

-- Create mutual exclusion trigger
CREATE OR REPLACE FUNCTION public.check_mutually_exclusive_profiles()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'listener_profiles' THEN
    IF EXISTS (SELECT 1 FROM public.seeker_profiles WHERE user_id = NEW.user_id) THEN
      RAISE EXCEPTION 'User already has a seeker profile. Cannot create listener profile.';
    END IF;
  ELSIF TG_TABLE_NAME = 'seeker_profiles' THEN
    IF EXISTS (SELECT 1 FROM public.listener_profiles WHERE user_id = NEW.user_id) THEN
      RAISE EXCEPTION 'User already has a listener profile. Cannot create seeker profile.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_check_listener_exclusive ON public.listener_profiles;
CREATE TRIGGER trg_check_listener_exclusive
BEFORE INSERT ON public.listener_profiles
FOR EACH ROW EXECUTE FUNCTION public.check_mutually_exclusive_profiles();

DROP TRIGGER IF EXISTS trg_check_seeker_exclusive ON public.seeker_profiles;
CREATE TRIGGER trg_check_seeker_exclusive
BEFORE INSERT ON public.seeker_profiles
FOR EACH ROW EXECUTE FUNCTION public.check_mutually_exclusive_profiles();
