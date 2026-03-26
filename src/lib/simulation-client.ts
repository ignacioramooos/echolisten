import { supabase } from "@/integrations/supabase/client";

export interface SimTurn {
  turn: number;
  seeker_message: string;
  response_type: "multiple_choice" | "free_text";
  options?: { text: string; correct: boolean; feedback: string }[];
  correct_feedback: string;
  evaluation_criteria?: string;
  topic_context: string;
}

export interface FreeTextEval {
  passed: boolean;
  feedback: string;
  score: number;
}

export interface FinalEvalResult {
  overall_passed: boolean;
  score: number;
  feedback: {
    active_listening: string;
    crisis_recognition: string;
    boundary_setting: string;
    tone: string;
    advice_avoidance: string;
  };
}

export async function generateSimulation(topics?: string[]): Promise<SimTurn[]> {
  const { data, error } = await supabase.functions.invoke("formation-simulation", {
    body: { action: "generate", topics },
  });
  if (error) throw new Error(error.message || "Failed to generate simulation");
  if (data?.error) throw new Error(data.error);
  return data.turns;
}

export async function evaluateFreeText(
  evaluationCriteria: string,
  candidateResponse: string
): Promise<FreeTextEval> {
  const { data, error } = await supabase.functions.invoke("formation-simulation", {
    body: {
      action: "evaluate",
      evaluation_criteria: evaluationCriteria,
      candidate_response: candidateResponse,
    },
  });
  if (error) throw new Error(error.message || "Failed to evaluate response");
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function finalEvaluation(conversation: string): Promise<FinalEvalResult> {
  const { data, error } = await supabase.functions.invoke("formation-simulation", {
    body: { action: "final", conversation },
  });
  if (error) throw new Error(error.message || "Failed to get final evaluation");
  if (data?.error) throw new Error(data.error);
  return data;
}
