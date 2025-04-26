import { serve } from "http/server";
import { createClient } from "@supabase/supabase-js";

// Helper to set CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS", // Adjusted for typical function invocation
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  // Consider throwing an error or exiting depending on deployment context
}

// Type definition for the result of the trigger_user_power_match SQL function
interface TriggerResult {
  status: "success" | "error";
  message: string;
  new_matches_found: number;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // --- Authorization --- Check for function secret
  const authorization = req.headers.get("Authorization");
  const functionSecret = Deno.env.get("FUNCTION_SECRET"); // Use a secret for invocation
  if (
    !functionSecret ||
    !authorization ||
    authorization !== `Bearer ${functionSecret}`
  ) {
    console.error("Unauthorized function call");
    return new Response("Unauthorized", {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Fetch active Pro users
    const { data: proUsers, error: proUsersError } = await supabase
      .from("job_seeker_profiles")
      .select("id") // Select only the ID
      .eq("is_pro", true)
      .eq("pro_active_status", true); // Only active pro users

    if (proUsersError) {
      console.error("Error fetching pro users:", proUsersError);
      throw proUsersError;
    }

    if (!proUsers || proUsers.length === 0) {
      console.log("No active pro users found.");
      return new Response(
        JSON.stringify({ message: "No active pro users found." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${proUsers.length} active pro users.`);
    let totalMatchesCreated = 0;
    let usersProcessed = 0;
    let usersFailed = 0;

    // 2. Process each pro user by triggering the RPC function
    for (const user of proUsers) {
      usersProcessed++;
      console.log(`Triggering power match generation for user: ${user.id}`);

      const { data, error: rpcError } = await supabase.rpc(
        "trigger_user_power_match",
        { p_user_id: user.id }
      );

      if (rpcError) {
        console.error(
          `Error triggering power match for user ${user.id}:`,
          rpcError
        );
        usersFailed++;
        // Continue to next user, log error
        continue;
      }

      // Basic validation of the returned data structure
      const result = data as TriggerResult;
      if (
        !result ||
        typeof result !== "object" ||
        !result.status ||
        !result.message ||
        typeof result.new_matches_found !== "number"
      ) {
        console.error(
          `Invalid response structure from trigger_user_power_match for user ${user.id}:`,
          result
        );
        usersFailed++;
        continue;
      }

      if (result.status === "success") {
        totalMatchesCreated += result.new_matches_found;
        console.log(
          `User ${user.id}: Success - ${result.message} (${result.new_matches_found} new matches)`
        );
      } else {
        // Handle specific errors reported by the function (e.g., user became inactive)
        console.warn(`User ${user.id}: Failed - ${result.message}`);
        usersFailed++;
      }
    }

    const finalResult = {
      message: "Power match generation trigger process complete.",
      usersProcessed,
      usersFailed,
      totalNewMatchesCreated: totalMatchesCreated, // Renamed for clarity
    };

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in generate-power-matches function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
