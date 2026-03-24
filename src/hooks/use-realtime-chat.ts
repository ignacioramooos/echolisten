import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface Message {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
  flagged: boolean;
}

export function useRealtimeMessages(sessionId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Load existing messages
  useEffect(() => {
    if (!sessionId) return;

    const load = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("sent_at", { ascending: true });

      if (data) setMessages(data as Message[]);
      setLoading(false);
    };
    load();
  }, [sessionId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`messages:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { messages, loading };
}

interface Session {
  id: string;
  seeker_id: string;
  listener_id: string | null;
  status: string;
  topic_snippet: string | null;
  created_at: string;
}

export function useRealtimeSession(sessionId: string | undefined) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const load = async () => {
      const { data } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .maybeSingle();

      if (data) setSession(data as Session);
      setLoading(false);
    };
    load();
  }, [sessionId]);

  // Subscribe to session updates (status changes)
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload: RealtimePostgresChangesPayload<Session>) => {
          setSession(payload.new as Session);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { session, loading };
}
