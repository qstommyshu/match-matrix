import "jsr:@supabase/functions-js/edge-runtime.d.ts"; // Add Supabase Edge Function types
import { serve } from "jsr:@std/http/server";
import { createClient } from "jsr:@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  // Consider throwing an error or exiting depending on deployment context
}

// Type definition for the result of the SQL function
interface EligibleJob {
  job_id: string;
  match_score: number;
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
    // Important: Use service role key for backend operations like this
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        // Required for service role key
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
    let powerMatchesCreated = 0;
    let usersProcessed = 0;

    // 2. Process each pro user
    for (const user of proUsers) {
      usersProcessed++;
      console.log(`Processing user: ${user.id}`);

      // 3. Find eligible jobs for the user
      const { data: eligibleJobs, error: rpcError } = await supabase.rpc(
        "find_eligible_power_match_jobs",
        { p_user_id: user.id, p_limit: 3 }
      );

      if (rpcError) {
        console.error(`Error finding jobs for user ${user.id}:`, rpcError);
        // Continue to next user, log error
        continue;
      }

      const jobs = eligibleJobs as EligibleJob[] | null;

      if (!jobs || jobs.length === 0) {
        console.log(`No eligible power match jobs found for user ${user.id}.`);
        continue;
      }

      console.log(`Found ${jobs.length} eligible jobs for user ${user.id}.`);

      // 4. Create power_match entries
      const powerMatchInserts = jobs.map((job) => ({
        user_id: user.id,
        job_id: job.job_id,
        match_score: job.match_score,
        // application_id, viewed_at, applied_at are null initially
      }));

      const { error: insertError } = await supabase
        .from("power_matches")
        .insert(powerMatchInserts);

      if (insertError) {
        console.error(
          `Error inserting power matches for user ${user.id}:`,
          insertError
        );
        // Log error, potentially retry or skip user
      } else {
        powerMatchesCreated += powerMatchInserts.length;
        console.log(
          `Successfully created ${powerMatchInserts.length} power matches for user ${user.id}.`
        );
      }
    }

    const result = {
      message: "Power match generation complete.",
      usersProcessed,
      powerMatchesCreated,
    };

    console.log("Function finished:", result);
    return new Response(JSON.stringify(result), {
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
