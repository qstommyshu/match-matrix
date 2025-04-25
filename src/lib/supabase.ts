import { createClient, SupabaseClient } from "@supabase/supabase-js";

// These environment variables need to be defined in your .env.local file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Check .env.local for URL, ANON_KEY and FUNCTIONS_URL."
  );
}

// Create Supabase client with the correct TypeScript typing
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define a more specific type for the Supabase client with functions
type SupabaseClientWithFunctions = SupabaseClient & {
  functions: {
    url: string;
  };
};

// Log the functions URL for debugging
console.log(
  "supabase.functions.url =",
  (supabase as SupabaseClientWithFunctions).functions?.url
);

// Helper authentication functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
};

export const getSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  return { session, error };
};

// AI summary generation function for applications
export const generateAISummary = async (applicationId: string) => {
  try {
    // Get the current session to pass the auth token
    const { session } = await getSession();

    if (!session) {
      throw new Error("No active session. User must be logged in.");
    }

    const { data, error } = await supabase.functions.invoke(
      "summarize-applicant",
      {
        body: { applicationId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (error) throw error;
    return { summary: data.summary, error: null };
  } catch (err) {
    console.error("Error generating AI summary:", err);
    return { summary: null, error: err };
  }
};
