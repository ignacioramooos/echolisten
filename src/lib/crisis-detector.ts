// MODERATION HOOK: Replace or supplement keyword detection with OpenAI Moderation API here

const CRISIS_KEYWORDS: string[] = [
  // English
  "kill myself",
  "end my life",
  "want to die",
  "suicide",
  "self-harm",
  "hurt myself",
  "can't go on",
  "no reason to live",
  "better off dead",
  "i don't see the point",
  "no point in living",
  // Spanish
  "no vale la pena",
  "ya no quiero seguir",
  "me quiero morir",
  "suicidio",
  "hacerme daño",
  "quiero morirme",
  "no puedo más",
  // Portuguese
  "quero morrer",
  "me matar",
  "suicídio",
  "não aguento mais",
  // French
  "me suicider",
  "envie de mourir",
  "en finir",
  "je veux mourir",
];

export { CRISIS_KEYWORDS };

/**
 * Detects crisis-related keywords in text.
 * Case-insensitive match against the keywords list.
 */
export function detectCrisisKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword));
}
