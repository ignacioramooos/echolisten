export const JOURNAL_MODES = [
  { id: "free", label: "Free" },
  { id: "guided", label: "Guided" },
  { id: "bullet", label: "Bullet" },
  { id: "unspeakable", label: "Unspeakable" },
  { id: "one_sentence", label: "One Sentence" },
  { id: "prompted", label: "Prompted" },
] as const;

export type JournalMode = (typeof JOURNAL_MODES)[number]["id"];

export const MOOD_OPTIONS = [
  "calm", "happy", "anxious", "sad", "angry", "confused",
  "numb", "hopeful", "tired", "grateful", "overwhelmed", "okay",
] as const;

export const EMOTION_TAGS = [
  "confused", "numb", "heavy", "scared", "angry",
  "lost", "relieved", "empty", "okay",
] as const;

export const DAILY_PROMPTS = [
  "What made today hard?",
  "What did you avoid?",
  "What helped, even a little?",
  "What do you wish someone knew?",
  "What are you carrying right now?",
  "What would you say if no one could hear?",
  "What do you need but can't ask for?",
  "What surprised you about yourself today?",
  "What felt different today?",
  "What are you afraid will happen?",
  "What are you afraid won't happen?",
  "What did you pretend was fine?",
  "What do you keep going back to in your mind?",
  "What would make tomorrow easier?",
  "What part of today do you want to forget?",
  "What would you tell yesterday's version of you?",
  "What did someone say that stuck with you?",
  "What do you miss right now?",
  "What do you need to let go of?",
  "What small thing mattered today?",
  "What are you grateful for, even reluctantly?",
  "What boundary did you hold or break?",
  "What do you want to feel but can't?",
  "What made you feel seen today?",
  "What made you feel invisible?",
  "What question do you keep asking yourself?",
  "What does rest look like for you right now?",
  "What would you change if you could?",
  "What have you been putting off feeling?",
  "What would healing look like today?",
];

export const getTodaysPrompt = (): string => {
  const day = new Date().getDate(); // 1–31
  return DAILY_PROMPTS[(day - 1) % DAILY_PROMPTS.length];
};
