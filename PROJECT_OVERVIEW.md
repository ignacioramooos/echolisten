# Echo Listen - Project Overview

## 🎯 Project Purpose

**Echo** is a mental health and emotional wellness platform that facilitates peer-to-peer listening and reflection. It's designed as a **safe, anonymous space** where people can:
- Write and process difficult moments through journaling in multiple modalities
- Connect with trained listeners for real-time emotional support (10-minute sessions)
- Practice conversations with an AI listener (Aura) before talking to real listeners
- Reflect on emotional patterns and growth over time
- Build agency through choosing topics, languages, and reflection methods
- Curate meaningful insights and lessons in a "Memory Shelf"
- Build a community around vulnerability and active listening

The platform operates on a **dual-role model**: users can be either **Seekers** (those seeking support) or **Listeners** (trained volunteers providing support), and many users fulfill both roles.

**Tagline:** "A space to write what you carry. Anonymous. Free. Human."

---

## ⚡ Why Echo Exists

Echo addresses a critical gap in mental health support:

1. **Accessibility**: Professional mental health care is expensive, inaccessible, or simply unavailable in many regions. Echo provides **free, anonymous peer support**.

2. **Humanity Over Automation**: While therapy bots exist, they lack the therapeutic power of genuine human connection. Echo pairs seekers with **real trained listeners**.

3. **Processing Through Writing**: Many people find writing therapeutic because it externalizes thoughts and creates distance for reflection. Echo provides **6 distinct journaling modes** to suit different needs.

4. **Building Listener Capacity**: The world needs more people trained in active listening and empathy. Echo's **structured Formation program** trains and certifies listeners.

5. **Crisis Safety**: The platform includes **automatic crisis detection** with resource overlays to keep users safe.

6. **Emotional Self-Knowledge**: Seekers often don't understand their patterns. Echo's **Patterns page** visualizes mood trends and emotional weather over time.

7. **Democratized Support**: By training peer listeners, Echo scales human support in a way that's economically sustainable and culturally appropriate.

---

## 🏗️ Architecture Overview

### Tech Stack

**Frontend:**
- **Framework:** React 18.3 with TypeScript
- **Build Tool:** Vite 5.4
- **Styling:** Tailwind CSS with custom components
- **Component Library:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **State Management:** TanStack React Query 5.62
- **Forms:** React Hook Form + Zod validation
- **Internationalization:** i18next (7 languages supported: EN, DE, AR, FR, ES, PT, ZH)
- **Authentication:** Lovable Cloud Auth
- **CAPTCHA:** hCaptcha for bot protection
- **Routing:** React Router v6

**Backend Services:**
- **Database & Auth:** Supabase (PostgreSQL)
- **Real-time Features:** Supabase Realtime
- **Testing:** Vitest + Playwright (E2E)
- **Linting:** ESLint with TypeScript support

**Development:**
- **Package Manager:** Bun (with npm fallback)
- **Dev Server:** Vite dev server (localhost:8080)

---

## 📁 Project Structure

```
echolisten/
├── src/
│   ├── pages/                    # Route pages
│   │   ├── Index.tsx            # Landing page
│   │   ├── Login.tsx            # Auth login
│   │   ├── SeekerSignup.tsx     # Seeker registration
│   │   ├── ListenerSignup.tsx   # Listener registration (with formation)
│   │   ├── SeekerDashboard.tsx  # Seeker main dashboard
│   │   ├── ListenerDashboard.tsx# Listener main dashboard
│   │   ├── ChatRoom.tsx         # 1-on-1 chat session
│   │   ├── ListenQueue.tsx      # Listener: waiting for seekers
│   │   ├── Journal.tsx          # Journaling interface
│   │   ├── MemoryShelf.tsx      # Saved journal entries & memories
│   │   ├── Patterns.tsx         # Emotional patterns & analytics
│   │   ├── Formation.tsx        # Listener training course
│   │   ├── AuraChat.tsx         # AI-powered chat companion
│   │   ├── DashboardRoom.tsx    # Personal dashboard customization
│   │   ├── Moderation.tsx       # Safety & content moderation
│   │   ├── Settings.tsx         # User settings
│   │   └── About.tsx            # About page
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (50+ reusable UI elements)
│   │   ├── echo/                # Echo-specific components
│   │   │   ├── signup/          # Signup flow components (5 steps)
│   │   │   ├── chat/            # Chat session UI
│   │   │   │   ├── ChatMessages.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   ├── ChatHeader.tsx
│   │   │   │   ├── ChatTimer.tsx
│   │   │   │   ├── CrisisBanner.tsx
│   │   │   │   ├── EchoAdvisor.tsx
│   │   │   │   └── SessionEndScreen.tsx
│   │   │   ├── journal/         # Journaling UI (6 modes)
│   │   │   │   ├── modes/       # Journal editing modes:
│   │   │   │   │   ├── FreeEditor.tsx
│   │   │   │   │   ├── BulletEditor.tsx
│   │   │   │   │   ├── PromptedEditor.tsx
│   │   │   │   │   ├── GuidedEditor.tsx
│   │   │   │   │   ├── OneSentenceEditor.tsx
│   │   │   │   │   └── UnspeakableEditor.tsx
│   │   │   │   └── JournalSidebar.tsx
│   │   │   ├── room/            # Dashboard customization widgets
│   │   │   │   ├── widgets/     # Widget components (8 interactive widgets)
│   │   │   │   │   ├── TodayIAmWidget.tsx
│   │   │   │   │   ├── StickyNoteWidget.tsx
│   │   │   │   │   ├── QuickJournalWidget.tsx
│   │   │   │   │   ├── MoodReflectionWidget.tsx
│   │   │   │   │   ├── EmotionalWeatherWidget.tsx
│   │   │   │   │   ├── CounterWidget.tsx
│   │   │   │   │   ├── MemoryShelfWidget.tsx
│   │   │   │   │   └── OneThingHelpedWidget.tsx
│   │   │   │   └── WidgetPalette.tsx
│   │   │   ├── formation/       # Listener training course
│   │   │   ├── EchoButton.tsx
│   │   │   ├── EchoInput.tsx
│   │   │   ├── EchoBadge.tsx
│   │   │   ├── AuthShell.tsx
│   │   │   ├── PageShell.tsx
│   │   │   ├── RoleRedirect.tsx
│   │   │   └── GoogleSignInButton.tsx
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-theme-init.ts   # Theme initialization
│   │   ├── use-realtime-chat.ts# Real-time chat subscription
│   │   ├── use-toast.ts        # Toast notifications
│   │   └── use-mobile.tsx      # Mobile detection
│   │
│   ├── lib/                     # Utility functions
│   │   ├── ai-client.ts        # AI integration (Aura Chat)
│   │   ├── simulation-client.ts# Formation practice simulator
│   │   ├── crisis-detector.ts  # Safety: detects crisis keywords
│   │   ├── moderate.ts         # Content moderation utilities
│   │   ├── resolve-role.ts     # Role determination logic
│   │   ├── i18n.ts            # i18next configuration
│   │   └── utils.ts            # General utilities
│   │
│   ├── integrations/
│   │   ├── supabase/           # Supabase client & types
│   │   │   ├── client.ts       # Initialized Supabase client
│   │   │   └── types.ts        # Generated DB types
│   │   └── lovable/            # Lovable Cloud integration
│   │
│   ├── types/
│   │   └── echo.ts             # TypeScript interfaces for core entities
│   │
│   ├── data/
│   │   ├── topics.ts           # Topic categories for signup
│   │   └── countries.ts        # Country list for profiles
│   │
│   ├── locales/                # i18n translation files
│   │   ├── en.json            # English
│   │   ├── de.json            # German
│   │   ├── ar.json            # Arabic
│   │   ├── fr.json            # French
│   │   ├── es.json            # Spanish
│   │   ├── pt.json            # Portuguese
│   │   └── zh.json            # Chinese
│   │
│   ├── test/                   # Test setup & utilities
│   │   ├── setup.ts           # Vitest setup
│   │   └── example.test.ts    # Example test
│   │
│   ├── App.tsx                 # Main app component with routing
│   ├── main.tsx               # React entry point
│   └── index.css              # Global styles
│
├── components.json             # shadcn/ui configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
├── vitest.config.ts           # Vitest test configuration
├── playwright.config.ts        # Playwright E2E test config
├── eslint.config.js           # ESLint configuration
├── postcss.config.js          # PostCSS configuration
└── package.json               # Project dependencies & scripts

```

---

## 🔑 Complete Feature Set

### 1. **User Authentication & Signup** 
**Why it exists:** Users need to choose their role and share relevant information before they can participate.

#### Seeker Signup (5-Step Flow)
- **Step 1: Basic Info** - Age range, location, preferred language, initial mood
  - *Why:* Establishes foundational context for match-making and personalization
- **Step 2: Profile** - Avatar selection, bio, pronouns
  - *Why:* Humanizes the seeker while maintaining anonymity
- **Step 3: Topics** - Select topics relevant to their situation (see topics list below)
  - *Why:* Helps match them with appropriately trained listeners
- **Step 4: Languages** - Select languages they're comfortable with
  - *Why:* Ensures connection with listeners who share their language(s)
- **Step 5: Verification** - Email verification for security
  - *Why:* Prevents spam and ensures account security

#### Listener Signup (5-Step Flow)
- **Step 1-5:** Similar to seeker, but with additional commitment acknowledgment
- **hCaptcha Protection:** Bot protection on all signup forms
  - *Why:* Prevents automated abuse and spam registration
- **Google OAuth Integration:** Social login option
  - *Why:* Reduces friction for new users
- **Email-based Password Reset:** Self-service account recovery
  - *Why:* Users can regain access if passwords are forgotten

---

### 2. **Journaling System** (Seeker Feature)
**Why it exists:** Writing is therapeutic. Different people need different structures to express themselves.

#### Six Journaling Modes
Each mode serves a distinct emotional/cognitive need:

1. **Free Mode**
   - Unlimited, unstructured writing
   - *Why:* Stream-of-consciousness for those who need to dump thoughts without constraint
   - Captures: content, emotions (emotion tags)

2. **Bullet Mode**
   - Bulleted list format
   - *Why:* For people who think in fragments or lists, who feel overwhelmed by prose
   - Ideal for: Quick thoughts, symptom logging, to-do style processing

3. **Guided Mode**
   - Structured prompts with question framework (e.g., "What happened? How did it make you feel? What do you need?")
   - *Why:* Helps seekers who are lost or stuck move through their experience methodically
   - Captures: Response structure that maps thought progression

4. **Prompted Mode**
   - Daily rotating prompts (30 unique, changes daily)
   - Examples: "What would you say if no one could hear?", "What are you carrying right now?"
   - *Why:* Reduces decision fatigue and provides targeted reflection
   - Captures: Response to specific introspective question

5. **One-Sentence Mode**
   - Exactly one sentence summary
   - *Why:* For overwhelmed seekers who can only manage micro-expressions, or those practicing brevity
   - Captures: Essence of emotional state

6. **Unspeakable Mode**
   - Time-limited stream (e.g., 5 minutes), fast freewriting, feelings without judgment
   - *Why:* Accesses thoughts deemed "unspeakable"—shame, rage, forbidden desires
   - Captures: Raw, unfiltered content that's hard to articulate normally
   - Privacy: Auto-deleted after reading or marked private

#### Journal Features
- **Mood Check-in (Before/After)**
  - *Why:* Measures impact of journaling on emotional state
  - Choices: calm, happy, anxious, sad, angry, confused, numb, hopeful, tired, grateful, overwhelmed, okay
  - Used for: Patterns page analytics

- **Emotion Tags**
  - Options: confused, numb, heavy, scared, angry, lost, relieved, empty, okay
  - *Why:* Allows semantic tagging for later pattern recognition
  - Used for: Memory shelf labeling and search

- **Auto-Save & Draft Recovery**
  - *Why:* Users don't lose work due to network issues or accidents

- **Post-Save Actions**
  - Share to Memory Shelf (save for later)
  - Share with Listener (attach to chat session)
  - Share publicly (optional, with privacy controls)
  - *Why:* Extends utility of journal entries beyond personal reflection

- **Sidebar History**
  - Shows past 100 journal entries
  - Read-only re-viewing of past entries
  - *Why:* Allows seekers to revisit their journey and see growth

---

### 3. **Real-Time Chat Sessions with Listeners** (Core Feature)
**Why it exists:** Direct human connection is the primary therapeutic mechanism.

#### Session Lifecycle
1. **Session Creation (Seeker-initiated)**
   - Select topics (what they need to talk about)
   - Select language preference
   - Write opening message (shown in topic_snippet)
   - System assigns a waiting "slot" in the queue

2. **Queue Management (Listener-initiated)**
   - Listener sees queue of waiting seekers with topic snippets
   - Shows language preference and wait time
   - Listener accepts specific seeker
   - Connection established

3. **Active Chat (10-minute sessions)**
   - **Timer:** Automatically starts when session moves to "active" status
   - *Why:* Enforces boundary (peer support isn't a substitute for therapy) and manages listener availability
   - **Real-time Messaging:** Supabase Realtime subscriptions
     - *Why:* Instant message delivery creates conversational feel
   - **Message Moderation:** Content checked via moderation edge function
     - *Why:* Prevents harassment, hate speech, spam
   - **Crisis Detection:** Real-time keyword detection in both directions
     - *Why:* Protects seekers and alerts listeners to escalation
   - **Focus Mode:** Chat can hide non-essential UI
     - *Why:* Reduces distractions during vulnerable conversation

4. **Session End**
   - Timer automatically ends session at 10 minutes
   - Display "SessionEndScreen" with reflection prompt
   - Option for seeker to leave a rating (1-5 stars)
   - Optional follow-up action (journal about session, etc.)

#### Chat Features
- **Crisis Banner (When Keywords Detected)**
  - Shows resources: hotline numbers, crisis text line, emergency contacts
  - *Why:* Immediate access to help when escalation is detected
  - Supports: Multi-language crisis resources

- **Crisis Info Overlay**
  - Deeper information about resources and how to use them
  - *Why:* Educates seekers in crisis moments

- **Shared Journal Card**
  - If seeker shared a journal entry to the session, it displays in chat
  - *Why:* Listener gets context; seeker doesn't have to re-type their struggle

- **Echo Advisor Hints** (for Listeners)
  - Real-time suggestions for reflective responses
  - *Why:* Helps newer listeners stay on-model (validation, reflection vs. advice)

- **Session Ratings**
  - Seeker rates listener quality after session ends
  - *Why:* Quality feedback, reputation system, listener accountability

- **Session History**
  - Both roles can see past session summaries (topic, duration, rating)
  - *Why:* Accountability, progress tracking, learning from interactions

---

### 4. **Aura Chat: AI Practice Sessions** (Seeker Feature)
**Why it exists:** Some seekers are anxious about talking to real listeners. Practicing with AI lowers barriers.

#### Aura Features
- **Opening Line:** "Hi. I'm Aura, Echo's AI listener. I'm here for you right now. What's on your mind?"
  - *Why:* Sets expectation that this is for practice, not professional care

- **30-Minute Sessions with Auto-Timeout**
  - *Why:* Enough time for meaningful conversation, prevents endless sessions

- **Max 40 Exchanges** (seeker + Aura = 1 exchange)
  - *Why:* Prevents token spending + reinforces this is practice, not replacement

- **1000 Character Input Limit per Message**
  - *Why:* Keeps exchanges focused, prevents dumping

- **Crisis Detection**
  - Aura detects crisis keywords and offers to connect to real listener
  - *Why:* Ensures real emergencies aren't handled by AI

- **Session Logging**
  - Stored in `aura_sessions` table
  - *Why:* Allows seeking pattern analysis, improves AI prompts

- **Auto-Connect Prompt**
  - After 30 minutes or 40 exchanges, offers: "Ready to talk to a real listener?"
  - *Why:* Guides seekers to the real support when appropriate

---

### 5. **Memory Shelf: Personal Wisdom Curation** (Seeker Feature)
**Why it exists:** Healing isn't linear. Seekers need to revisit wisdom they've discovered.

#### Shelf Features
- **Saving from Journal**
  - Post-journal: "Save to shelf" option
  - *Why:* Captures moments of clarity for future reference

- **Manual Entries**
  - Widget or direct entry to Memory Shelf
  - *Why:* Can save insights from therapy, books, conversations—not just Echo journal

- **Four Shelf Categories**
  1. **Lessons** - Learning about yourself or life
  2. **Truths** - Core beliefs you've reaffirmed
  3. **Things That Helped** - Specific practices, people, insights that helped
  4. **All** - View everything

- **Labels & Custom Organization**
  - Users can label entries with custom tags beyond categories
  - *Why:* Personalized organizational structure

- **Timestamp & Full Entry View**
  - Each shelf entry shows when it was saved
  - Can view full original content
  - *Why:* Contextualization and historical perspective

- **Share Shelf Entries**
  - Can share specific shelf entry during a chat session
  - *Why:* Listener gets deeper context; seeker shares wisdom they've already articulated

- **Deletion & Management**
  - Users can remove entries they no longer need
  - *Why:* Active curation (shelf isn't a cemetery)

---

### 6. **Formation Program: Listener Training** (Listener Feature)
**Why it exists:** Peer support requires training. Untrained listeners can do harm. Formation ensures quality.

#### Structure: 9 Steps + Final Assessment
1. **Step 1: Active Listening Foundations**
   - Content: Definition, non-judgment, reflective listening, silence
   - Quiz: 3 questions (must pass 2/3)
   - *Why:* Foundation of all other skills
   - Points: 10 per correct answer

2. **Step 2: Recognizing Crisis Signals**
   - Content: Escalation signs, emotional shifts, warning phrases
   - Quiz: When to display crisis banner, what constitutes danger
   - *Why:* Safety-critical skill
   - Points: 10 per correct

3. **Step 3: Labeling Emotions (Emotional Granularity)**
   - Content: Moving beyond "sad/happy" to nuanced feeling names
   - Quiz: "When someone says X, what might they mean?"
   - *Why:* Validation requires understanding what someone actually feels

4. **Step 4: Asking Questions (Deepening)**
   - Content: Open vs. closed questions, when to ask vs. when to sit
   - Quiz: Scenario-based question crafting
   - *Why:* Listeners can't fix, but good questions help seekers find their own answers

5. **Step 5: Empathy & Lived Experience**
   - Content: Distinction between empathy and toxic positivity, "I've been there" traps
   - Quiz: Identifying good empathetic responses
   - *Why:* Prevents unhelpful advice or one-upsmanship

6. **Step 6: Lived Experience Boundaries**
   - Content: When to share, when to stay focused on seeker
   - Quiz: Scenarios where sharing helps vs. hurts
   - *Why:* Seeker comes first; listener's story is secondary

7. **Step 7: Identifying Strengths**
   - Content: Reframing resilience, noticing what seekers *are* doing
   - Quiz: Strength-spotting in difficult situations
   - *Why:* Counteracts despair, builds agency

8. **Step 8: Chat Protocol & Echo Guidelines**
   - Content: Platform mechanics, what counts as inappropriate, handling conflict
   - Quiz: Policy-based scenarios
   - *Why:* Ensures consistent, safe experience

9. **Step 9: The Simulation**
   - AI-driven practice chat with a "seeker"
   - AI evaluates listener responses in real-time
   - Scoring: Listens without fixing, reflects accurately, escalates to crisis protocols, stays present
   - *Why:* Practical proof that listener can apply learning
   - Minimum Score: 70/100 to pass

#### Progress Tracking
- **Completion Tracking:** Each step marked "completed" when quiz passed
- **Score Aggregation:** Points from each step add toward final badge
- **Pass Threshold:** 70% overall (PASS_THRESHOLD = 0.7)
- **Max Points:** 100 total (MAX_POINTS = 100)
- **Badge Earned:** "Listener Certified" upon completion, with earned_at timestamp
- *Why:* Transparent tracking motivates completion

#### Formation Result Screen
- Shows final score, quiz breakdown, certification status
- Congratulations or "try again" messaging
- Can retake entire program
- *Why:* Clear outcome, encouragement to retry if unsuccessful

---

### 7. **Dashboard Room: Personal Widget Space** (All Users)
**Why it exists:** Generic dashboards don't reflect who we are. Customization creates ownership.

#### 8 Widget Types

1. **Today I Am**
   - Text input: "Today I am..."
   - Saves to journal with mood check-in
   - *Why:* Quick identity/state reflection without full journaling

2. **Mood Reflection**
   - Dial/selector for current mood
   - Emoji representation
   - Timestamped mood logging
   - *Why:* Visual mood tracking, beautiful representation

3. **Emotional Weather**
   - Metaphor-based mood: "Stormy," "Heavy," "Foggy," "Cloudy," "Warming Up," "Clear"
   - *Why:* More poetic than numeric scale; matches Echo's language

4. **Quick Journal**
   - Mini text input for ultra-short freewriting
   - Auto-saves to journal entries
   - *Why:* Journal access without leaving dashboard

5. **Sticky Note**
   - Persistent text widget for reminders, affirmations, or notes
   - *Why:* Customizable inspiration; personal dashboard space

6. **Memory Shelf Widget**
   - Shows recent shelf entries
   - Links to full Memory Shelf page
   - *Why:* Easy access to wisdom

7. **Counter**
   - Manual counter (increment/decrement)
   - Customizable label
   - *Why:* Track habits, sobriety, days of practice, etc.

8. **One Thing Helped**
   - Single input: "One thing that helped today..."
   - Connects to "things that helped" shelf category
   - *Why:* Gratitude practice, resilience building

#### Layout System
- **Drag-and-drop Positioning:** React Grid Layout integration
  - *Why:* Users arrange widgets to suit their workflow
- **Resizable Widgets:** Each widget has min/max dimensions
  - *Why:* Flexibility while maintaining grid integrity
- **Preset Layouts**
  1. **Calm Layout** - Mood reflection, emotional weather, sticky notes
     - *Why:* For seekers in distress who need soothing
  2. **Focused Layout** - Counter, quick journal, one thing helped
     - *Why:* For goal-oriented or recovery-focused users
  3. **Expressive Layout** - Today I am, mood, memory shelf, quick journal
     - *Why:* For creative/reflective users
- **State Persistence:** Layout saved to database
  - *Why:* Users return to their customized space

---

### 8. **Patterns Page: Emotional Analytics** (All Users)
**Why it exists:** Awareness of patterns enables change. Visualization makes patterns visible.

#### Four Pattern Views

1. **Mood Trend Chart (30 days)**
   - Line chart showing mood progression
   - Mood scale: angry (1) → happy (8)
   - Moving average calculation
   - *Why:* Identifies upward/downward trajectories, seasonal patterns
   - Data source: journal "mood_before" and "mood_after" entries

2. **Emotional Weather (90 days)**
   - Weather metaphor mapped to numeric scale
   - stormy (1) → clear (6)
   - Shows which weather states are most common
   - *Why:* Poetic, intuitive visualization
   - Data source: custom "emotional_weather" entries

3. **Before/After Mood Impact**
   - Shows mood change from start of journal session to end
   - Average improvement, frequency of improvement
   - *Why:* Measures journaling's therapeutic effect
   - Data source: mood_before vs. mood_after on journal entries

4. **Things That Helped (90 days)**
   - Shows all "things that helped" entries from past quarter
   - *Why:* Reinforces what works; patterns of what's resilience-building
   - Data source: "one_thing_helped" and "things that helped" shelf entries

#### Insights Extracted
- Journals written (frequency)
- Days journaled in past 30/90 days
- Most common moods
- Trend direction (improving vs. declining)
- *Why:* Aggregate self-knowledge

---

### 9. **Safety & Crisis Management System**
**Why it exists:** Mental health platform must prioritize user safety above all.

#### Crisis Detection
- **Multi-language Keywords** - Tracks phrases like "suicide," "self-harm," "want to die," etc.
  - Spanish: "me quiero morir," "quiero morirme"
  - Portuguese: "quero morrer," "suicídio"
  - French: "me suicider," "envie de mourir"
  - *Why:* Meets users where they communicate
- **Real-time Detection** - In chat, journal, and Aura Chat
  - *Why:* Catches escalation as it happens
- **Both Directions** - Seeker *and* listener messages are monitored
  - *Why:* Protects both parties

#### Crisis Responses
1. **Crisis Banner**
   - Displays when crisis keywords detected
   - Shows crisis resources: hotlines, text lines, emergency contacts
   - *Why:* Immediate access to help

2. **Crisis Info Overlay**
   - Detailed information about resources
   - How to use each resource
   - *Why:* Education in moment of crisis

3. **Automatic Escalation to Real Listener** (Aura → Human)
   - When AI detects crisis in Aura Chat
   - *Why:* Safety boundary; AI shouldn't handle real crises

#### Content Moderation
- **Edge Function Moderation** - Uses moderation API (OpenAI or custom)
  - Flags: harassment, hate speech, spam, violence apology
  - *Why:* Prevents abuse while preserving vulnerability-sharing space
- **Context-Aware** - Different thresholds for "seeker" (private) vs "room" (public) contexts
  - *Why:* Private crying is different from public harassment

#### Strike System (Moderation)
- **1st Strike:** Silent warning (logged internally)
- **2nd Strike:** Visible warning to user
- **3rd Strike:** User kicked from current session
- *Why:* Escalating consequences prevent abuse while allowing mistakes

#### Moderation Dashboard
- Admin access to flagged content
- Manual review and actions
- User account flags
- *Why:* Human oversight of algorithmic decisions

---

### 10. **Topic Taxonomy**
**Why it exists:** Helps seekers and listeners find matches, structures the platform.

#### 46 Supported Topics
- Addiction
- ADHD, Autism Spectrum, Borderline Personality Disorder, Bipolar Disorder, OCD, PTSD, Schizophrenia
- Anxiety, Social Anxiety, Panic Attacks
- Depression
- Chronic Pain, Cancer, Diabetes, Disabilities, Dissociative Disorders, Perinatal Mood Disorder
- Breakups, Relationship Issues, Domestic Violence
- Family Issues, Parenting, Motherhood, Adoption/Foster Care
- Bullying, Loneliness
- Alcoholism/Drug Abuse, Addiction, Recovery
- Eating Disorders
- Financial Problems, Work Stress, Student Life
- Forgiveness, Grief & Loss, Letting Go
- LGBTQ+ Issues, Racial & Cultural Identity, Women's Issues, Men's Issues
- Sexual Health, Sleep Quality
- Weight Management, Exercise Motivation
- Spirituality
- Self-Esteem, Self-Harm, Managing Emotions, General Mental Health

*Why:* Specificity helps match seekers with appropriately trained listeners

---

### 11. **Multi-Language Support**
**Why it exists:** Mental health doesn't have borders; neither should Echo.

#### Primary Languages (Full UI + Content)
- English, Spanish (Español), Portuguese (Português), French (Français), German (Deutsch), Chinese (中文), Arabic (العربية)

#### Additional Languages (Partial Support)
- Japanese, Hindi, Russian, Italian, Dutch, Korean, Turkish, Polish, Swedish

- **i18next Integration:** Full internationalization framework
- **Language Selection:** User choice during signup and in settings
- **Translation Files:** JSON locale files for all UI strings
- **Crisis Resources:** Multi-language crisis hotlines
- **Formation Content:** Trainings available in key languages
- *Why:* Removes language barrier to peer support

---

### 12. **User Settings & Preferences**
**Why it exists:** Users need control over their experience.

#### Settings Options
- **Theme Selection:** Dark/light mode toggle (via next-themes)
- **Language Selection:** Change UI language
- **Account Management:** Email, password change, account deletion
- **Privacy Settings:** (Future) Control who can contact, visibility preferences
- **Notification Preferences:** (Future) Email alerts, push notifications
- **Role-Specific Settings:**
  - Listeners: Topic specializations, availability
  - Seekers: Topics of interest, preferred listener characteristics

---

### 13. **Session & Rating System**
**Why it exists:** Feedback drives quality and accountability.

#### Session Tracking
- **Status Flow:** waiting → active → ended
- **Metadata:**
  - Seeker ID, Listener ID, Topics, Language
  - Creation timestamp, Timer end time
  - Topic snippet (opening message preview)

#### Rating System
- **1-5 Star Ratings** from seeker to listener
  - *Why:* Quality signal, builds listener reputation
- **Ratings Visible to Listeners**
  - Average rating displayed on listener profile
  - *Why:* Social proof, accountability

#### Session History
- Both roles see past sessions with metadata
- Session summaries (date, duration, topic, rating)
- *Why:* Progress tracking, learning

---

### 14. **Authentication & Authorization**
**Why it exists:** Platform data is sensitive; access must be controlled.

#### Authentication Methods
- **Supabase Auth** - PostgreSQL-backed, JWT tokens
- **Google OAuth** - Social login option
- **Email/Password** - Traditional auth
- **Email Verification** - For security
- **Password Reset** - Self-service recovery

#### Role-Based Access Control
- **Public Pages:** Landing, about, signup, login
- **Seeker-Only Pages:** SeekerDashboard, Journal, Memory Shelf, Patterns, ChatNew
- **Listener-Only Pages:** Formation, ListenQueue, ListenerDashboard
- **Shared Pages:** ChatRoom (context-aware), Settings, AuraChat, DashboardRoom
- **Admin Pages:** Moderation dashboard

#### Guard Rails
- Listen Queue requires: listener profile + formation completion (bot_passed = true)
- Chat access requires: participant in session (seeker_id or listener_id)
- *Why:* Prevents unauthorized access

---

### 15. **Real-Time Features** (Supabase Realtime)
**Why it exists:** Conversations require instant feedback.

#### Real-Time Subscriptions
- **Messages:** Both seeker and listener see new messages instantly
- **Session Updates:** Status changes (waiting → active → ended) propagate in real-time
- **Queue Updates:** Listener sees new waiting sessions appear as they arrive
- **Widget Updates:** Dashboard widgets update in real-time (e.g., mood logged by partner)

#### Implementation
- `supabase.channel()` subscriptions
- PostgreSQL_CHANGES event type
- *Why:* Feels like real conversation, not polling

---

### 16. **About & Help Pages**
**Why it exists:** Users need to understand Echo's mission and how it works.

#### About Page
- Project mission and values
- How it works (seeker → listener → chat flow)
- FAQ (frequently asked questions)
- *Why:* Transparency, education

#### Login/Signup Pages
- Clear role explanation
- Seeker vs. Listener decision tree
- Terms of service / privacy policy links
- *Why:* Informed consent, accessibility

---

### 17. **Advanced Features**

#### Graceful Exit (Listener Option)
- Pre-written closing message: "I've valued our 10 minutes, but I need to step away to recharge now. You did great sharing today."
- *Why:* Lets listeners exit with dignity; normalizes listener boundaries

#### Focus Mode
- Chat interface hides non-essential UI
- Dedicated text input, minimal chrome
- *Why:* Reduces distraction in vulnerable conversation

#### Journal Entry Sharing
- Share journal to Memory Shelf during editing
- Attach journal to chat session (seeker shows listener their entry)
- *Why:* Extends journal utility, provides listener context

#### Emotion Tags System
- Semantic tagging of journal entries
- Searchable via sidebar
- *Why:* Helps identify patterns (e.g., "every entry tagged 'scared'")

#### Auto-Save & Draft Recovery
- Journal auto-saves as user types
- Recovery if browser crashes
- *Why:* Never lose work

---

## 🚀 Key Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Index | Landing page |
| `/about` | About | Project information |
| `/signup/seeker` | SeekerSignup | Register as seeker |
| `/signup/listener` | ListenerSignup | Register as listener |
| `/login` | Login | Sign in |
| `/dashboard/seeker` | SeekerDashboard | Seeker main view |
| `/dashboard/listener` | ListenerDashboard | Listener main view |
| `/dashboard/room` | DashboardRoom | Customizable dashboard |
| `/dashboard/journal` | Journal | Journaling interface |
| `/dashboard/shelf` | MemoryShelf | Saved entries |
| `/dashboard/patterns` | Patterns | Emotional analytics |
| `/chat/new` | ChatNew | Start new chat |
| `/chat/:sessionId` | ChatRoom | Active chat session |
| `/listen` | ListenQueue | Listener queue |
| `/formation` | Formation | Listener training |
| `/aura` | AuraChat | AI practice chat |
| `/settings` | Settings | User settings |
| `/mod` | Moderation | Admin moderation |

---

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server (localhost:8080)
npm run build           # Production build
npm run build:dev       # Dev mode build

# Testing
npm run test            # Run tests once
npm run test:watch      # Watch mode testing

# Linting
npm run lint            # Run ESLint

# Preview
npm run preview         # Preview production build
```

---

## 🎨 Design System

### Colors & Typography
- **Design System:** Tailwind CSS with custom theme
- **Component Library:** shadcn/ui (Radix UI primitives)
- **Custom Echo Components:** `EchoButton`, `EchoInput`, `EchoBadge`
- **Theme Support:** Dark/light mode (via next-themes)
- **Animation:** Tailwind CSS animations

### UI Philosophy
- Minimalist, calming interface
- Focus on words and expression
- Accessible (WCAG compliant)
- Mobile-responsive

---

## 🗄️ Database Schema (Supabase/PostgreSQL)

Core entities (inferred from types):
- **User** - User profiles with role
- **Session** - Chat sessions between listener and seeker
- **Journal Entry** - User's journaling entries
- **Badge** - Achievement/earned badges
- Additional tables for topics, countries, moderation logs

---

## 🔐 Security & Privacy

- **Anonymous:** No real names displayed
- **Real Human Connection:** All listeners are real people (trained volunteers)
- **Crisis Detection:** Automatic safety alerts
- **Content Moderation:** Admin review of flagged content
- **hCaptcha:** Bot protection
- **Secure Auth:** Supabase authentication with JWT

---

## 🌍 Internationalization

Supported languages:
- English (EN)
- German (DE)
- Arabic (AR)
- French (FR)
- Spanish (ES)
- Portuguese (PT)
- Chinese (ZH)

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `react` | UI framework |
| `react-router-dom` | Client routing |
| `@supabase/supabase-js` | Backend DB & auth |
| `@tanstack/react-query` | Data fetching & caching |
| `react-hook-form` | Form management |
| `zod` | Schema validation |
| `tailwindcss` | Styling |
| `@radix-ui/*` | Accessible UI primitives |
| `lucide-react` | Icons |
| `i18next` | Internationalization |
| `recharts` | Analytics charts |
| `sonner` | Toast notifications |
| `@hcaptcha/react-hcaptcha` | Bot protection |

---

## 🧪 Testing

- **Unit Tests:** Vitest
- **E2E Tests:** Playwright
- **Test Setup:** `src/test/setup.ts`
- **Example:** `src/test/example.test.ts`

---

## 🎯 Development Workflow

1. **Local Development:** `npm run dev`
2. **Component Development:** Use Lovable tagger for component tracking
3. **Testing:** Run tests with `npm run test` or `npm run test:watch`
4. **Linting:** Check code quality with `npm run lint`
5. **Building:** Create production bundle with `npm run build`

---

## 🔗 Integration Points

- **Supabase:** Database, authentication, real-time subscriptions
- **Google OAuth:** Social login
- **AI Integration:** (Aura Chat) - External AI API
- **Lovable Cloud:** Component tagging and management
- **hCaptcha:** Bot protection

---

## 📝 Notes

- The project is **built with Lovable** (Lovable.dev platform)
- Uses **Vite** for fast development and optimized builds
- Component library provides 50+ pre-built UI components
- Real-time features powered by **Supabase Realtime**
- Strong focus on **accessibility** and **user experience**

---

## 🚦 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables** (`.env` file)
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   VITE_LOVABLE_...=...
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```

4. **Open browser:** `http://localhost:8080`

---

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Supabase Documentation](https://supabase.com/docs)
- [i18next](https://www.i18next.com)
