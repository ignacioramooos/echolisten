-- Add appearance customization columns to seeker_profiles
-- so seekers can set theme, background image, intensity, and language just like listeners.
ALTER TABLE public.seeker_profiles
  ADD COLUMN IF NOT EXISTS theme text DEFAULT 'light',
  ADD COLUMN IF NOT EXISTS chat_bg_url text,
  ADD COLUMN IF NOT EXISTS chat_bg_intensity integer DEFAULT 20,
  ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en';
