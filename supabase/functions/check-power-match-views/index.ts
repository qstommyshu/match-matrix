import { serve } from "http/server";
import { createClient } from "@supabase/supabase-js";

// Helper to set CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS", // Adjusted for scheduled function
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

// Type definition for Power Match with application ID
interface PowerMatchToCheck {
  id: string;
  application_id: string;
  user_id: string; // For logging/context
  job_id: string; // For logging/context
}

serve(async (_req) => {
  // Note: While this function is likely triggered by a schedule (not HTTP),
  // we keep the basic server structure and CORS handling for consistency
  // and potential manual invocation/testing via HTTP.

  // Handle CORS preflight request (though less relevant for scheduled tasks)
  if (_req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Optional: Add Authorization check if you want to protect manual invocation
  // const authorization = _req.headers.get("Authorization");
  // const functionSecret = Deno.env.get("FUNCTION_SECRET");
  // if (!functionSecret || !authorization || authorization !== `Bearer ${functionSecret}`) {
  //   console.error("Unauthorized function call attempt");
  //   return new Response("Unauthorized", {
  //     status: 401,
  //     headers: { ...corsHeaders, "Content-Type": "application/json" },
  //   });
  // }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Calculate the timestamp for 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoISO = twoDaysAgo.toISOString();

    console.log(
      `Checking for unviewed power matches applied before: ${twoDaysAgoISO}`
    );

    // 1. Fetch power matches applied > 2 days ago and not viewed
    const { data: matchesToCheck, error: fetchError } = await supabase
      .from("power_matches")
      .select("id, application_id, user_id, job_id")
      .not("application_id", "is", null) // Must have an application
      .not("applied_at", "is", null) // Must have been applied
      .is("viewed_at", null) // Must NOT have been viewed
      .lt("applied_at", twoDaysAgoISO); // Applied more than 2 days ago

    if (fetchError) {
      console.error("Error fetching power matches to check:", fetchError);
      throw fetchError;
    }

    if (!matchesToCheck || matchesToCheck.length === 0) {
      console.log("No unviewed power matches found requiring withdrawal.");
      return new Response(
        JSON.stringify({
          message: "No unviewed power matches found requiring withdrawal.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${matchesToCheck.length} power matches to withdraw.`);
    let applicationsWithdrawn = 0;
    let withdrawalErrors = 0;

    // 2. Process each match
    for (const match of matchesToCheck as PowerMatchToCheck[]) {
      console.log(
        `Attempting to withdraw application ${match.application_id} for match ID: ${match.id}`
      );
      try {
        // 3. Update the corresponding application
        const { error: updateError } = await supabase
          .from("applications")
          .update({
            status: "inactive", // Or another appropriate status
            stage: "Withdrawn",
            updated_at: new Date().toISOString(), // Update timestamp
          })
          .eq("id", match.application_id);

        if (updateError) {
          console.error(
            `Error withdrawing application ${match.application_id} for match ID ${match.id}:`,
            updateError
          );
          withdrawalErrors++;
        } else {
          applicationsWithdrawn++;
          console.log(
            `Application ${match.application_id} withdrawn successfully.`
          );
          // Optional: Update power_matches table too? e.g., clear application_id or set withdrawn_at
          // const { error: pmUpdateError } = await supabase
          //   .from('power_matches')
          //   .update({ withdrawn_at: new Date().toISOString(), application_id: null })
          //   .eq('id', match.id)
        }
      } catch (innerError) {
        console.error(
          `Unexpected error processing withdrawal for match ID ${match.id}:`,
          innerError
        );
        withdrawalErrors++;
      }
    }

    const result = {
      message: "Power match view check complete.",
      matchesChecked: matchesToCheck.length,
      withdrawalsTriggered: applicationsWithdrawn,
      usersToNotify: 0, // Assuming usersToNotify is not available in the new result
    };

    console.log("Function finished:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in check-power-match-views function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
