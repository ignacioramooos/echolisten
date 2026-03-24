export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface FormationStep {
  id: string;
  title: string;
  reading: string[];
  quiz: QuizQuestion[];
  passThreshold: number;
}

export const formationSteps: FormationStep[] = [
  {
    id: "step-1",
    title: "Foundations of Active Listening",
    reading: [
      "Active listening is not about fixing. It is about creating a space where another person feels genuinely heard. When someone shares their pain, the instinct to solve or reassure is strong — but in peer support, the most powerful thing you can offer is your full, undivided presence.",
      "Reflective listening means mirroring back what the speaker has said, using their own language. This is not parroting. It is a deliberate act of validation. When you say 'It sounds like you feel unseen,' you are telling the other person: I heard you. I took your words seriously.",
      "Silence is a tool, not a failure. A pause after someone speaks gives them room to go deeper. Many listeners rush to fill silence with words. Resist that urge. Let the speaker sit with their own thoughts. Often, the most important thing they say comes after the pause.",
      "Your role as a Listener is not to interpret, diagnose, or advise. You are a witness. You hold space. You reflect. That is enough. In fact, that is everything.",
    ],
    quiz: [
      {
        question:
          "A seeker says 'I feel like nobody cares.' The best response is:",
        options: [
          "That must feel really isolating.",
          "Have you talked to your family?",
          "Things will get better, I promise.",
        ],
        correctIndex: 0,
      },
      {
        question: "What is the primary purpose of reflective listening?",
        options: [
          "To offer the speaker a new perspective.",
          "To validate the speaker by mirroring their words.",
          "To gather information for a diagnosis.",
        ],
        correctIndex: 1,
      },
      {
        question: "When there is silence during a session, a Listener should:",
        options: [
          "Ask a follow-up question immediately.",
          "Offer a reassuring statement.",
          "Allow the silence — it gives the speaker room to continue.",
        ],
        correctIndex: 2,
      },
    ],
    passThreshold: 2,
  },
  {
    id: "step-2",
    title: "Recognizing Crisis Signals",
    reading: [
      "Not every conversation will stay within the bounds of peer support. Some seekers may be in acute distress. Your job is not to manage a crisis — it is to recognize one and take the correct action: display the crisis resource banner and gently guide the seeker toward professional help.",
      "Watch for escalating language. Phrases like 'I can't do this anymore,' 'there's no point,' or 'nobody would notice if I was gone' are signals. They may not always indicate immediate danger, but they always warrant the crisis protocol.",
      "Changes in tone matter. If a seeker shifts from frustrated to flat — from emotional to eerily calm — pay attention. Sudden emotional detachment after intense distress can be a warning sign.",
      "You are not expected to be a clinician. You are expected to notice, to take these signals seriously, and to act within your training. Displaying the crisis banner is never an overreaction. It is always the right call when in doubt.",
    ],
    quiz: [
      {
        question:
          "A seeker says 'I just don't see the point of anything anymore.' What should you do?",
        options: [
          "Continue the conversation normally — they're just venting.",
          "Display the crisis resource banner and gently acknowledge their pain.",
          "Tell them to call a therapist.",
        ],
        correctIndex: 1,
      },
      {
        question:
          "A seeker has been very emotional but suddenly becomes calm and detached. This could indicate:",
        options: [
          "They're feeling better and the session is working.",
          "A potential escalation — sudden calm after distress is a warning sign.",
          "They're bored with the conversation.",
        ],
        correctIndex: 1,
      },
      {
        question:
          "When should you display the crisis resource banner?",
        options: [
          "Only when the seeker explicitly says they want to harm themselves.",
          "Whenever you are in doubt about the seeker's safety.",
          "Only after getting permission from the seeker.",
        ],
        correctIndex: 1,
      },
    ],
    passThreshold: 2,
  },
  {
    id: "step-3",
    title: "Boundaries & Tone",
    reading: [
      "A Listener is not a counselor, advisor, or friend. The relationship is specific and boundaried. You do not share personal stories. You do not offer opinions on what the seeker should do. You do not diagnose. These are not arbitrary rules — they protect both you and the seeker.",
      "Tone is clinical-warm. This means you are empathetic but not effusive. You do not use excessive exclamation marks or phrases like 'Oh no, that's terrible!' Your warmth comes through in the quality of your attention, not in emotional mirroring.",
      "If a seeker asks for your opinion — 'What do you think I should do?' — redirect gently. 'I'm not here to give advice, but I'd like to understand more about what you're feeling.' This is not evasion. It is the discipline of the role.",
      "Self-care matters. If a session leaves you drained, step away. Echo provides cooldown periods between sessions for a reason. You cannot pour from an empty vessel. Recognizing your own limits is part of being a good Listener.",
    ],
    quiz: [
      {
        question:
          "A seeker asks: 'Do you think I should break up with my partner?' Is the following response acceptable? 'Honestly, it sounds like they're not treating you well — I think you should.'",
        options: ["Yes, it's empathetic.", "No, it gives personal advice."],
        correctIndex: 1,
      },
      {
        question:
          "Is this response acceptable? 'I hear that you're struggling with this decision. What feels most true for you right now?'",
        options: [
          "Yes, it redirects without advising.",
          "No, it's too vague.",
        ],
        correctIndex: 0,
      },
      {
        question:
          "A seeker shares something that reminds you of your own experience. Is it acceptable to say: 'I went through the same thing — here's what I did.'",
        options: [
          "Yes, sharing builds connection.",
          "No, Listeners do not share personal stories.",
        ],
        correctIndex: 1,
      },
    ],
    passThreshold: 2,
  },
];
