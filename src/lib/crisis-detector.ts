// MODERATION HOOK: Replace or supplement keyword detection with OpenAI Moderation API here

const CRISIS_KEYWORDS: string[] = [
  "kill myself",
  "end my life",
  "want to die",
  "suicide",
  "self-harm",
  "hurt myself",
  "can't go on",
  "no reason to live",
  "better off dead",
];

export { CRISIS_KEYWORDS };

/**
 * Detects crisis-related keywords in text.
 * Case-insensitive match against the keywords list.
 *
 * FUTURE: Replace or augment with OpenAI Moderation API or
 * other safety classification services.
 */
export function detectCrisisKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword));
}
