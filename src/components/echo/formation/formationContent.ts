export interface ChatMessage {
  role: "seeker" | "listener";
  text: string;
}

export interface ContentBlock {
  type: "paragraph" | "heading" | "subheading" | "list" | "chat" | "youtube" | "divider";
  text?: string;
  items?: string[];
  messages?: ChatMessage[];
  url?: string;
  caption?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  feedback: string;
  points: number; // 0 for intro, 2 for scored
}

export interface FormationStepData {
  id: string;
  title: string;
  content: ContentBlock[];
  quiz: QuizQuestion[];
}

export const formationSteps: FormationStepData[] = [
  // ─── STEP 1 — Introduction to Active Listening ───
  {
    id: "step-1",
    title: "Introduction to Active Listening",
    content: [
      { type: "heading", text: "What Active Listening Is" },
      { type: "subheading", text: "Active listening IS:" },
      { type: "list", items: [
        "Giving the person space to speak",
        "Doing your best to understand",
        "Showing kindness and empathy",
        "Being present and attentive",
      ]},
      { type: "divider" },
      { type: "subheading", text: "Active listening is NOT:" },
      { type: "list", items: [
        "Trying to solve the person's problems",
        "Giving solutions or advice",
        "Changing the subject",
        "Sharing your own opinions",
      ]},
    ],
    quiz: [
      {
        id: "q_1_1",
        question: "A Seeker tells you they've been struggling at work and feeling overwhelmed. The best first response is:",
        options: [
          "Have you tried talking to your manager about it?",
          "That sounds really hard. Can you tell me more?",
          "Things will get better, I promise.",
        ],
        correctIndex: 1,
        feedback: "Active listening means creating space, not solving. Avoid advice and platitudes.",
        points: 0,
      },
    ],
  },

  // ─── STEP 2 — Skill 1: Reflection ───
  {
    id: "step-2",
    title: "Skill 1: Reflection",
    content: [
      { type: "heading", text: "Skill 1: Reflection" },
      { type: "paragraph", text: "Reflecting what someone says shows you're paying attention. Simply restate in your own words what they shared. You know you've done a good job when the person gives you MORE information." },
      { type: "chat", messages: [
        { role: "seeker", text: "I have so much work. I have a huge project due tomorrow and my in-laws are visiting this weekend." },
        { role: "listener", text: "You have a big project to work on and your in-laws are coming." },
        { role: "seeker", text: "Yes, the project wouldn't be so bad if my in-laws weren't coming. Now I have to clean the house and entertain them while stressing about the deadline." },
      ]},
    ],
    quiz: [
      {
        id: "q_2_1",
        question: "A Seeker says: 'I've been trying so hard at the gym but I'm not seeing any results. I feel like giving up.' Which response best demonstrates reflection?",
        options: [
          "Don't give up! You're doing great.",
          "You've been putting in effort at the gym but aren't seeing results, and you're considering stopping.",
          "Maybe you need to change your workout routine.",
        ],
        correctIndex: 1,
        feedback: "Reflection means mirroring their words — not encouraging, judging, or advising.",
        points: 2,
      },
      {
        id: "q_2_2",
        question: "What indicates that your reflection was effective?",
        options: [
          "The person changes the topic",
          "The person gives you MORE information",
          "The person stops talking",
        ],
        correctIndex: 1,
        feedback: "A good reflection opens the door for the person to share more.",
        points: 2,
      },
      {
        id: "q_2_3",
        question: "A Seeker says: 'My partner never listens to me. I try to talk but they just walk away.' Which is the best reflection?",
        options: [
          "Your partner is being unfair to you.",
          "You're trying to communicate with your partner but feel unheard when they walk away.",
          "Have you tried couples therapy?",
        ],
        correctIndex: 1,
        feedback: "Reflect what they said without judgment or advice.",
        points: 2,
      },
    ],
  },

  // ─── STEP 3 — Skill 2: Labeling Emotions ───
  {
    id: "step-3",
    title: "Skill 2: Labeling Emotions",
    content: [
      { type: "heading", text: "Skill 2: Labeling Emotions" },
      { type: "paragraph", text: "Identifying the emotion behind what someone says shows you care about how they feel — not just what happened. Look for whether they sound angry, worried, overwhelmed, sad, or excited. Suggest a word. It's okay to be wrong — they'll correct you, and that correction is itself useful." },
      { type: "chat", messages: [
        { role: "seeker", text: "My mom calls me constantly to help her. Almost every day. I have my own life to live!" },
        { role: "listener", text: "It sounds like you're feeling frustrated with your mom." },
        { role: "seeker", text: "I wouldn't say frustrated. More angry — she's so demanding." },
      ]},
    ],
    quiz: [
      {
        id: "q_3_1",
        question: "A Seeker says: 'My boss criticized my work in front of the whole team. I wanted to disappear.' The best response labels their emotion by saying:",
        options: [
          "Your boss shouldn't have done that in public.",
          "It sounds like that was really humiliating for you.",
          "Maybe your boss was just having a bad day.",
        ],
        correctIndex: 1,
        feedback: "Label the emotion the person is experiencing, not your judgment of the situation.",
        points: 2,
      },
      {
        id: "q_3_2",
        question: "When labeling emotions, if the person corrects you, you should:",
        options: [
          "Apologize and stop labeling emotions",
          "Accept their correction — it helps deepen the conversation",
          "Insist on your initial label",
        ],
        correctIndex: 1,
        feedback: "Being wrong is fine — the correction itself is valuable and deepens understanding.",
        points: 2,
      },
    ],
  },

  // ─── STEP 4 — Skill 3: Asking Questions ───
  {
    id: "step-4",
    title: "Skill 3: Asking Questions",
    content: [
      { type: "heading", text: "Skill 3: Asking Questions" },
      { type: "paragraph", text: "Questions show interest and keep the conversation moving. Ask open questions — ones that can't be answered with just 'yes' or 'no'. But don't ask too many. Give the person space to lead." },
      { type: "subheading", text: "Useful open questions:" },
      { type: "list", items: [
        "How would you like them to respond?",
        "What's the most important thing you want them to understand?",
        "What needs to change?",
        "What's the worst case scenario?",
      ]},
      { type: "paragraph", text: "If you don't understand something: ask for clarification." },
      { type: "chat", messages: [
        { role: "seeker", text: "I think I'm going to talk to my son about his girlfriend. I've been too scared to confront him for years." },
        { role: "listener", text: "What's the best case scenario when you imagine how your son might react?" },
        { role: "seeker", text: "Maybe he'd actually listen and understand my perspective." },
      ]},
    ],
    quiz: [
      {
        id: "q_4_1",
        question: "Which of the following is an open question?",
        options: [
          "Are you still feeling sad?",
          "How are you feeling about it?",
          "Do you feel better now?",
        ],
        correctIndex: 1,
        feedback: "Open questions invite reflection. Closed questions get yes/no.",
        points: 2,
      },
      {
        id: "q_4_2",
        question: "A Seeker's message is confusing and unclear. What should you do?",
        options: [
          "Ask a clarifying question",
          "Tell them they're not being clear",
          "Keep going and hope you understand later",
        ],
        correctIndex: 0,
        feedback: "Clarifying questions show respect and prevent misunderstanding.",
        points: 2,
      },
      {
        id: "q_4_3",
        question: "How many questions should you ask in a row?",
        options: [
          "As many as needed to understand",
          "One at a time, giving space for answers",
          "At least three to show interest",
        ],
        correctIndex: 1,
        feedback: "Too many questions feel like an interrogation. Give space between questions.",
        points: 2,
      },
    ],
  },

  // ─── STEP 5 — Skill 4: Empathy ───
  {
    id: "step-5",
    title: "Skill 4: Empathy",
    content: [
      { type: "heading", text: "Skill 4: Empathy" },
      { type: "paragraph", text: "Every person is doing the best they can with what they have. We can't solve everyone's problems — but showing empathy makes them feel less alone." },
      { type: "subheading", text: "Empathy sounds like:" },
      { type: "list", items: [
        "I'd feel the same way in your position.",
        "I'd be asking the same questions.",
        "That would bother me too.",
        "No wonder you're frustrated.",
      ]},
      { type: "paragraph", text: "Never judge or critique the person or their decisions — even if you disagree." },
      { type: "youtube", url: "https://www.youtube.com/watch?v=1Evwgu369Jw", caption: "Watch: Empathy vs. Sympathy (3 min)" },
    ],
    quiz: [
      {
        id: "q_5_1",
        question: "Which of these is something a Listener should NEVER do during a chat?",
        options: [
          "Try to understand how the person feels",
          "Share personal opinions about the person's decisions",
          "Be warm and kind at all times",
        ],
        correctIndex: 1,
        feedback: "Your opinions about their choices are irrelevant. Your job is to understand, not evaluate.",
        points: 2,
      },
      {
        id: "q_5_2",
        question: "Which statement demonstrates empathy?",
        options: [
          "I know exactly how you feel.",
          "I can imagine how difficult that must be for you.",
          "At least it's not as bad as what happened to me.",
        ],
        correctIndex: 1,
        feedback: "Empathy acknowledges their experience without claiming to fully understand or comparing.",
        points: 2,
      },
      {
        id: "q_5_3",
        question: "What is the difference between empathy and sympathy?",
        options: [
          "Empathy connects; sympathy creates distance",
          "They are the same thing",
          "Sympathy is more powerful than empathy",
        ],
        correctIndex: 0,
        feedback: "Empathy means feeling WITH someone. Sympathy means feeling FOR someone — it creates distance.",
        points: 2,
      },
    ],
  },

  // ─── STEP 6 — Skill 5: Lived Experience ───
  {
    id: "step-6",
    title: "Skill 5: Lived Experience",
    content: [
      { type: "heading", text: "Skill 5: Lived Experience" },
      { type: "paragraph", text: "If someone seems stuck and you've been through something similar, briefly sharing your story can help them feel less alone. But the focus must always remain on them — never try to 'top' their experience." },
      { type: "subheading", text: "When it IS useful:" },
      { type: "list", items: [
        "When someone feels hopeless and your recovery can offer hope",
        "When it reduces shame or isolation",
      ]},
      { type: "subheading", text: "When it is NOT useful:" },
      { type: "list", items: [
        "If it would minimize their experience ('my situation was much worse')",
        "If you're sharing pain, not recovery",
        "If you find yourself getting emotional — that's your signal to step back and pass the session to someone else",
      ]},
    ],
    quiz: [
      {
        id: "q_6_1",
        question: "Which is a good reason to briefly share your own story as a Listener?",
        options: [
          "To impress the Seeker with what you've been through",
          "To offer hope that things can improve",
          "To show them that their situation could be worse",
        ],
        correctIndex: 1,
        feedback: "Sharing should only serve the Seeker — to reduce shame or offer hope.",
        points: 2,
      },
      {
        id: "q_6_2",
        question: "If sharing your own story starts making you emotional, you should:",
        options: [
          "Push through — the Seeker needs to hear it",
          "Step back and refocus on the Seeker",
          "End the session immediately",
        ],
        correctIndex: 1,
        feedback: "Getting emotional is your signal to refocus. The conversation is about them, not you.",
        points: 2,
      },
    ],
  },

  // ─── STEP 7 — Skill 6: Identifying Strengths ───
  {
    id: "step-7",
    title: "Skill 6: Identifying Strengths",
    content: [
      { type: "heading", text: "Skill 6: Identifying Strengths" },
      { type: "paragraph", text: "Everyone has strengths. Noticing them — even small ones — builds confidence and self-esteem." },
      { type: "subheading", text: "Useful affirmations:" },
      { type: "list", items: [
        "I appreciate you reaching out.",
        "You handled that really well.",
        "That took a lot of courage.",
        "Even the act of talking about this is a strength.",
      ]},
    ],
    quiz: [
      {
        id: "q_7_1",
        question: "Why is recognizing strengths important?",
        options: [
          "It builds self-esteem and confidence",
          "It helps them feel empowered",
          "Both of these",
        ],
        correctIndex: 2,
        feedback: "Recognizing strengths serves both purposes — building confidence and empowerment.",
        points: 2,
      },
      {
        id: "q_7_2",
        question: "When is the best time to identify a Seeker's strengths?",
        options: [
          "Only at the end of the conversation",
          "Whenever you genuinely notice one throughout the conversation",
          "Only when they ask for feedback",
        ],
        correctIndex: 1,
        feedback: "Strengths can be acknowledged anytime you genuinely notice them — don't wait.",
        points: 2,
      },
    ],
  },

  // ─── STEP 8 — Skills 7–12: Chat Protocol ───
  {
    id: "step-8",
    title: "Chat Protocol",
    content: [
      // Section A
      { type: "heading", text: "When Someone Asks for Advice" },
      { type: "paragraph", text: "Never give advice. Instead:" },
      { type: "list", items: [
        "\"You're the expert on your own life. I can't advise you, but I can help you find your own path.\"",
        "\"What would you say to a friend in your situation?\"",
        "\"What do you feel you should do?\"",
      ]},
      { type: "paragraph", text: "A chat doesn't need to end with a solution. Being heard is valuable in itself." },
      { type: "divider" },

      // Section B
      { type: "heading", text: "Chat Etiquette" },
      { type: "paragraph", text: "You can't see facial expressions or hear tone. Be careful." },
      { type: "list", items: [
        "Be as clear as possible",
        "Don't assume someone is irritated just because their reply is brief",
        "Use correct spelling and grammar — this is not texting",
      ]},
      { type: "paragraph", text: "Opening line example: \"Hi, I'm glad you're here. I'm [name] and I'm here to listen and support you. What would you like to talk about?\"" },
      { type: "paragraph", text: "If a chat isn't going well: \"How can I support you better right now?\"" },
      { type: "divider" },

      // Section C
      { type: "heading", text: "Ending a Chat" },
      { type: "paragraph", text: "Never disappear without notice." },
      { type: "list", items: [
        "\"I wanted to let you know I need to go in 15 minutes. What would you like to talk about in our remaining time?\"",
        "\"We've been talking for a while and covered a lot. How are you feeling now?\"",
        "\"You can message me here and let me know how things go.\"",
      ]},
      { type: "divider" },

      // Section D
      { type: "heading", text: "Serious Issues & Referrals" },
      { type: "paragraph", text: "When to escalate:" },
      { type: "list", items: [
        "The person needs specialized help beyond peer support",
        "They're in significant emotional distress",
        "No progress after multiple sessions",
      ]},
      { type: "paragraph", text: "When someone expresses intent to harm themselves or others:" },
      { type: "list", items: [
        "Display the crisis banner immediately",
        "Refer to local crisis lines (auto-detected by user's country)",
        "End the session: \"I care about you and want you to be safe. Please contact [crisis line]. I need to end our session now, but you can call them right now.\"",
        "Never try to talk them out of it yourself. Never ask \"why.\"",
      ]},
    ],
    quiz: [
      {
        id: "q_8_1",
        question: "When should you give advice?",
        options: [
          "Only when directly asked",
          "Whenever you have useful advice",
          "Never",
        ],
        correctIndex: 2,
        feedback: "Listeners never give advice. Help the Seeker find their own path.",
        points: 2,
      },
      {
        id: "q_8_2",
        question: "A chat isn't going well and the Seeker seems frustrated. You should:",
        options: [
          "Ask how you can support them better",
          "Show empathy no matter what",
          "Both",
        ],
        correctIndex: 2,
        feedback: "Both empathy and asking how to help better are appropriate responses.",
        points: 2,
      },
      {
        id: "q_8_3",
        question: "What should you do if someone tells you they plan to hurt themselves?",
        options: [
          "Try to convince them not to",
          "Refer to crisis line and end the chat",
          "Ask why and listen to their reasons",
        ],
        correctIndex: 1,
        feedback: "Never try to manage a crisis yourself. Refer to professional crisis services immediately.",
        points: 2,
      },
      {
        id: "q_8_4",
        question: "What personal information should you NEVER ask a Seeker?",
        options: [
          "Their real name",
          "Their address or workplace",
          "Phone or social media",
          "All of these",
        ],
        correctIndex: 3,
        feedback: "Never ask for any personally identifying information. Privacy is paramount.",
        points: 2,
      },
      {
        id: "q_8_5",
        question: "What's the best way to open a chat session?",
        options: [
          "What's wrong?",
          "Hi, I'm here to listen. What would you like to talk about?",
          "Tell me everything.",
        ],
        correctIndex: 1,
        feedback: "A warm, open greeting invites the Seeker to share at their own pace.",
        points: 2,
      },
      {
        id: "q_8_6",
        question: "If you're running out of time in a chat, you should:",
        options: [
          "End abruptly — your time is your time",
          "Let the Seeker know in advance and ask what's most important to discuss",
          "Stay longer even if exhausted",
        ],
        correctIndex: 1,
        feedback: "Always give advance notice. Never disappear without warning.",
        points: 2,
      },
      {
        id: "q_8_7",
        question: "When should you refer someone to professional help?",
        options: [
          "Only when they explicitly ask",
          "When their needs go beyond peer support or they're in significant distress",
          "Never — Echo handles everything",
        ],
        correctIndex: 1,
        feedback: "Knowing your limits and referring appropriately is a sign of a good Listener.",
        points: 2,
      },
      {
        id: "q_8_8",
        question: "A Seeker asks: 'Do you think I should quit my job?' The best response is:",
        options: [
          "Yes, it sounds like a toxic environment.",
          "What feels right to you? What would change if you did?",
          "No, you should stick it out.",
        ],
        correctIndex: 1,
        feedback: "Redirect to their own wisdom. Never make decisions for them.",
        points: 2,
      },
    ],
  },
];

// Total scored questions: 3+2+3+3+2+2+8 = 23 (Step 1 has 1 intro question worth 0 pts)
// Max points: 23 × 2 = 46
// Pass threshold: 33 / 46
export const TOTAL_QUIZ_QUESTIONS = 23;
export const MAX_POINTS = 46;
export const PASS_THRESHOLD = 33;
