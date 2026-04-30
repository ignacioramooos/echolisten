import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "seeker" | "listener";

type ProfileMetadata = Record<string, unknown>;

const isDuplicateProfileError = (error: { code?: string; message?: string } | null) =>
  error?.code === "23505" || /duplicate key|already has/i.test(error?.message ?? "");

export const createProfileForRole = async (
  user: Pick<User, "id" | "email">,
  role: AppRole,
  metadata: ProfileMetadata = {}
) => {
  const text = (key: string) => {
    const value = metadata[key];
    return typeof value === "string" && value.trim() ? value : null;
  };
  const list = (key: string) => {
    const value = metadata[key];
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  };

  if (role === "seeker") {
    const { error } = await supabase.from("seeker_profiles").insert({
      user_id: user.id,
      username: text("username"),
      email: user.email,
    });

    if (error && !isDuplicateProfileError(error)) throw error;
    return;
  }

  const { error: profileError } = await supabase.from("listener_profiles").insert({
    user_id: user.id,
    role: "listener",
    first_name: text("first_name") || text("firstName"),
    last_name: text("last_name") || text("lastName"),
    country: text("country"),
    gender: text("gender"),
    username: text("username"),
    email: user.email,
    bio: text("bio"),
    topics_comfortable: list("topics_comfortable").length ? list("topics_comfortable") : list("comfortable"),
    topics_avoid: list("topics_avoid").length ? list("topics_avoid") : list("avoid"),
    topics_lived_experience: list("topics_lived_experience").length ? list("topics_lived_experience") : list("lived"),
    languages: list("languages"),
    verified_agreements: true,
  });

  if (profileError && !isDuplicateProfileError(profileError)) throw profileError;

  const { error: progressError } = await supabase.from("formation_progress").upsert(
    {
      user_id: user.id,
      steps_completed: [],
      bot_passed: false,
    },
    { onConflict: "user_id" }
  );

  if (progressError) throw progressError;
};
