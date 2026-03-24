import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ModerationRequest {
  text: string;
  context: "seeker" | "room";
}

interface ModerationResponse {
  flagged: boolean;
  context: "seeker" | "room";
  action: "crisis_alert" | "kick" | "none";
  triggeredCategories: string[];
}

const SEEKER_CATEGORIES = [
  "self-harm",
  "self-harm/intent",
  "self-harm/instructions",
];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, context } = (await req.json()) as ModerationRequest;

    if (!text || !context) {
      return new Response(
        JSON.stringify({ error: "Missing text or context" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      // Fail open — allow message through if key missing
      console.error("OPENAI_API_KEY not set, failing open");
      return new Response(
        JSON.stringify({
          flagged: false,
          context,
          action: "none",
          triggeredCategories: [],
        } as ModerationResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const modRes = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ input: text }),
    });

    if (!modRes.ok) {
      // Fail open on API error
      console.error("OpenAI Moderation API error:", modRes.status, await modRes.text());
      return new Response(
        JSON.stringify({
          flagged: false,
          context,
          action: "none",
          triggeredCategories: [],
        } as ModerationResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const modData = await modRes.json();
    const result = modData.results[0];
    const categories: Record<string, boolean> = result.categories;
    const scores: Record<string, number> = result.category_scores;

    let flagged = false;
    let action: ModerationResponse["action"] = "none";
    const triggeredCategories: string[] = [];

    if (context === "seeker") {
      // Flag on any self-harm category
      for (const cat of SEEKER_CATEGORIES) {
        if (categories[cat]) {
          flagged = true;
          triggeredCategories.push(cat);
        }
      }
      if (flagged) action = "crisis_alert";
    } else {
      // Room mode — require high scores to avoid false positives from venting
      const harassmentHigh = scores["harassment"] > 0.85;
      const violenceHigh = scores["violence"] > 0.75;
      const hateHigh = scores["hate"] > 0.80;

      if (harassmentHigh && (violenceHigh || hateHigh)) {
        flagged = true;
        action = "kick";
        if (harassmentHigh) triggeredCategories.push("harassment");
        if (violenceHigh) triggeredCategories.push("violence");
        if (hateHigh) triggeredCategories.push("hate");
      }
    }

    return new Response(
      JSON.stringify({ flagged, context, action, triggeredCategories } as ModerationResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    // Fail open on any unexpected error
    console.error("Moderation function error:", err);
    return new Response(
      JSON.stringify({
        flagged: false,
        context: "room",
        action: "none",
        triggeredCategories: [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
