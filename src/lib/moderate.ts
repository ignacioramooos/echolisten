import { supabase } from "@/integrations/supabase/client";

export interface ModerationResult {
  flagged: boolean;
  context: "seeker" | "room";
  action: "crisis_alert" | "kick" | "none";
  triggeredCategories: string[];
}

// In-memory strike tracker (resets on page reload — acceptable for MVP)
const strikes: Map<string, number> = new Map();

/**
 * Call the moderation edge function.
 * Fails open: if the call fails, returns unflagged so messages are never blocked by an outage.
 */
export async function moderateContent(
  text: string,
  context: "seeker" | "room"
): Promise<ModerationResult> {
  try {
    const { data, error } = await supabase.functions.invoke("moderate", {
      body: { text, context },
    });

    if (error || !data) {
      console.error("Moderation call failed, failing open:", error);
      return { flagged: false, context, action: "none", triggeredCategories: [] };
    }

    return data as ModerationResult;
  } catch (err) {
    console.error("Moderation unexpected error, failing open:", err);
    return { flagged: false, context, action: "none", triggeredCategories: [] };
  }
}

/**
 * Strike system for room moderation.
 * Returns the action to take based on cumulative strikes.
 *
 * 1st flag → "warn_silent" (logged internally)
 * 2nd flag → "warn_visible" (shown to user)
 * 3rd flag → "kick"
 */
export function applyStrike(
  userId: string
): "warn_silent" | "warn_visible" | "kick" {
  const current = strikes.get(userId) ?? 0;
  const next = current + 1;
  strikes.set(userId, next);

  if (next >= 3) return "kick";
  if (next === 2) return "warn_visible";
  return "warn_silent";
}

export function getStrikes(userId: string): number {
  return strikes.get(userId) ?? 0;
}

export function resetStrikes(userId: string): void {
  strikes.delete(userId);
}
