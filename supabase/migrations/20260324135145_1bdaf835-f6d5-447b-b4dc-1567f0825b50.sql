
-- Create session status enum
CREATE TYPE public.session_status AS ENUM ('waiting', 'active', 'ended');

-- Sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seeker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listener_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status session_status NOT NULL DEFAULT 'waiting',
  topic_snippet TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Seekers can see their own sessions
CREATE POLICY "Seekers can view own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = seeker_id);

-- Listeners can see waiting sessions and their own active sessions
CREATE POLICY "Listeners can view waiting and own sessions"
  ON public.sessions FOR SELECT
  USING (status = 'waiting' OR auth.uid() = listener_id);

-- Seekers can create sessions
CREATE POLICY "Seekers can create sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = seeker_id);

-- Participants can update their sessions
CREATE POLICY "Participants can update sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = seeker_id OR auth.uid() = listener_id);

-- Messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  flagged BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Session participants can view messages
CREATE POLICY "Session participants can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_id
      AND (s.seeker_id = auth.uid() OR s.listener_id = auth.uid())
    )
  );

-- Session participants can insert messages
CREATE POLICY "Session participants can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_id
      AND s.status = 'active'
      AND (s.seeker_id = auth.uid() OR s.listener_id = auth.uid())
    )
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;

-- Ratings table (for session end)
CREATE TABLE public.session_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

ALTER TABLE public.session_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own ratings"
  ON public.session_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own ratings"
  ON public.session_ratings FOR SELECT
  USING (auth.uid() = user_id);
