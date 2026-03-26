import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GENERATE_PROMPT = `You are running a peer support listener training simulation for Echo, a platform similar to 7 Cups.

Generate a realistic peer support practice session.

STRUCTURE: You will produce a JSON array of 10-14 'turns'. Each turn has this shape:

{
  "turn": number,
  "seeker_message": string,  // what the distressed person says (1-4 sentences max)
  "response_type": "multiple_choice" | "free_text",  // alternate between these
  "options": [  // only if multiple_choice
    { "text": string, "correct": boolean, "feedback": string }
  ],
  "correct_feedback": string,  // shown when they get it right (warm, specific)
  "evaluation_criteria": string,  // for free_text turns, what to evaluate
  "topic_context": string  // brief note for internal logic
}

RULES:
- The Seeker's name is Alex.
- Turns 1-3: Warm-up — basic reflection and empathy
- Turns 4-7: Deeper emotional content — test emotion labeling and open questions
- Turn 8 or 9: Alex asks for advice directly — test the 'no advice' rule
- Turn 10-11: Introduce a mild crisis signal (not explicit self-harm — something like 'I don't see the point anymore') — test crisis recognition
- Turn 12-13: Boundary test — Alex becomes slightly inappropriate or asks personal info
- Turn 14: Closing — test graceful ending
- For multiple_choice turns: provide 3-4 options with exactly ONE correct
- For free_text turns: provide evaluation_criteria describing what a good response looks like
- Alternate between multiple_choice and free_text roughly every 2-3 turns
- Each option's feedback should be 1-2 sentences explaining why it's right or wrong
- Produce ONLY valid JSON array. No preamble, no markdown, no explanation, no code fences.`;

const EVALUATE_PROMPT = `You are evaluating a peer support listener training response.

Evaluate the candidate's response against the criteria provided.

IMPORTANT RULES:
- Be fair but strict. This is training, not a real session.
- A "passed" response demonstrates the core skill being tested.
- A response doesn't need to be perfect to pass — it needs to show understanding of the principle.
- Common failures: giving advice, being dismissive, making it about themselves, ignoring emotional content.

Respond with ONLY valid JSON, no markdown, no code fences:
{ "passed": boolean, "feedback": "string (max 2 sentences)", "score": 0-2 }`;

const FINAL_EVAL_PROMPT = `Based on this complete peer support training simulation, evaluate the candidate's overall performance.

Score each category honestly. A passing score is 60/100.

Respond with ONLY valid JSON, no markdown, no code fences:
{
  "overall_passed": boolean,
  "score": 0-100,
  "feedback": {
    "active_listening": "string",
    "crisis_recognition": "string",
    "boundary_setting": "string",
    "tone": "string",
    "advice_avoidance": "string"
  }
}`;

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  // Remove markdown code fences
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return cleaned.trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, topics, evaluation_criteria, candidate_response, conversation } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const callAI = async (systemPrompt: string, userMessage: string) => {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return { error: "Rate limit exceeded. Please wait and try again.", status: 429 };
        }
        if (response.status === 402) {
          return { error: "AI credits exhausted. Please add funds.", status: 402 };
        }
        const t = await response.text();
        console.error("AI gateway error:", response.status, t);
        return { error: `AI gateway error: ${response.status}`, status: 500 };
      }

      const data = await response.json();
      return { content: data.choices?.[0]?.message?.content || "" };
    };

    // ─── ACTION: GENERATE ───
    if (action === "generate") {
      const topicText = topics?.length > 0
        ? `Alex is struggling with: ${topics.join(", ")}`
        : "Alex is struggling with work stress and feeling disconnected from friends.";

      const result = await callAI(GENERATE_PROMPT, topicText);
      if (result.error) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const turns = JSON.parse(cleanJsonResponse(result.content!));
        return new Response(JSON.stringify({ turns }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        console.error("Failed to parse turns JSON:", result.content);
        return new Response(JSON.stringify({ error: "Failed to generate simulation. Please try again." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ─── ACTION: EVALUATE ───
    if (action === "evaluate") {
      const userMsg = `Criteria: ${evaluation_criteria}\n\nCandidate's response: ${candidate_response}`;
      const result = await callAI(EVALUATE_PROMPT, userMsg);
      if (result.error) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const evaluation = JSON.parse(cleanJsonResponse(result.content!));
        return new Response(JSON.stringify(evaluation), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        console.error("Failed to parse evaluation JSON:", result.content);
        // Default to passed to avoid blocking on parse failures
        return new Response(JSON.stringify({ passed: true, feedback: "Response accepted.", score: 1 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ─── ACTION: FINAL ───
    if (action === "final") {
      const result = await callAI(FINAL_EVAL_PROMPT, `Full conversation:\n${conversation}`);
      if (result.error) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const evaluation = JSON.parse(cleanJsonResponse(result.content!));
        return new Response(JSON.stringify(evaluation), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        console.error("Failed to parse final eval JSON:", result.content);
        return new Response(JSON.stringify({
          overall_passed: false,
          score: 50,
          feedback: {
            active_listening: "Could not evaluate — please retry.",
            crisis_recognition: "Could not evaluate — please retry.",
            boundary_setting: "Could not evaluate — please retry.",
            tone: "Could not evaluate — please retry.",
            advice_avoidance: "Could not evaluate — please retry.",
          },
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("formation-simulation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
