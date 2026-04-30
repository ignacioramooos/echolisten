import { supabase } from "@/integrations/supabase/client";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface EvalResult {
  score: number;
  passed: boolean;
  feedback: {
    active_listening: string;
    crisis_recognition: string;
    boundary_setting: string;
    tone: string;
    advice_avoidance?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Send messages to the Formation bot simulation.
 * Model/provider details live inside the Supabase edge function.
 */
export async function sendToFormationBot(messages: Message[]): Promise<string> {
  const { data, error } = await supabase.functions.invoke("formation-chat", {
    body: { messages },
  });

  if (error) {
    throw new Error(error.message || "Failed to reach Formation bot");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data.content;
}

/**
 * Parse evaluation block from bot message if present.
 * Format: [EVAL: { ... }]
 */
export function parseEvaluation(message: string): EvalResult | null {
  const match = message.match(/\[EVAL:\s*(\{[\s\S]*?\})\s*\]/);
  if (!match) return null;

  try {
    return JSON.parse(match[1]) as EvalResult;
  } catch {
    return null;
  }
}

/**
 * Strip the evaluation block from a message for display.
 */
export function stripEvaluation(message: string): string {
  return message.replace(/\[EVAL:\s*\{[\s\S]*?\}\s*\]/, "").trim();
}
