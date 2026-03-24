// Supabase client placeholder — connect when env vars are available
// import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

// Export placeholders for now
export { SUPABASE_URL, SUPABASE_ANON_KEY };

// When ready:
// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
