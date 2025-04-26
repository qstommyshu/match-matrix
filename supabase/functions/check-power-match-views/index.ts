import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "jsr:@std/http/server";
import { createClient } from "jsr:@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Authorization
  const authorization = req.headers.get("Authorization");
  const functionSecret = Deno.env.get("FUNCTION_SECRET");
  if (
    !functionSecret ||
    !authorization ||
    authorization !== `Bearer ${functionSecret}`
  ) {
    console.error("Unauthorized check-views call");
    return new Response("Unauthorized", {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

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
      message: "Check power match views process complete.",
      matchesChecked: matchesToCheck.length,
      applicationsWithdrawn,
      withdrawalErrors,
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
