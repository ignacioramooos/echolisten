-- Add UPDATE policy for chat_requests to allow service role to update
-- This is needed for the accept_chat_request RPC to work properly

DROP POLICY IF EXISTS "Service role can update chat requests" ON public.chat_requests;
CREATE POLICY "Service role can update chat requests"
  ON public.chat_requests FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
