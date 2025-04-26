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

// Types from database.ts (simplified for relevance)
interface PowerMatchToApply {
  id: string;
  user_id: string;
  job_id: string;
}

interface ApplicationInput {
  user_id: string;
  job_id: string;
  status: string;
  stage:
    | "Applied"
    | "Screening"
    | "Interview"
    | "Offer"
    | "Rejected"
    | "Withdrawn";
  cover_letter?: string | null;
}

interface ApplicationResult {
  id: string;
  // ... other fields
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
    console.error("Unauthorized auto-apply call");
    return new Response("Unauthorized", {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Fetch power matches needing application
    const { data: matchesToApply, error: fetchError } = await supabase
      .from("power_matches")
      .select("id, user_id, job_id")
      .is("applied_at", null) // Only those not yet applied
      .is("viewed_at", null); // Optional: Maybe only apply if not viewed yet?
    // Decision: Let's apply even if viewed, unless explicitly opted out later.
    // .is("opted_out", false); // If an opt-out flag is added

    if (fetchError) {
      console.error("Error fetching power matches:", fetchError);
      throw fetchError;
    }

    if (!matchesToApply || matchesToApply.length === 0) {
      console.log("No power matches found requiring application.");
      return new Response(
        JSON.stringify({
          message: "No power matches found requiring application.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${matchesToApply.length} power matches to apply for.`);
    let applicationsCreated = 0;
    let applicationErrors = 0;
    let updateErrors = 0;

    // 2. Process each match
    for (const match of matchesToApply as PowerMatchToApply[]) {
      console.log(`Attempting application for match ID: ${match.id}`);
      try {
        // 3. Create application
        // Note: Using service role. Ensure RLS allows this or adjust.
        // The createApplication function calculates match score internally.
        const applicationInput: ApplicationInput = {
          user_id: match.user_id,
          job_id: match.job_id,
          status: "active", // Default status
          stage: "Applied", // Default stage
          cover_letter: "Automatically applied via Power Match feature.", // Add a note
        };

        // Call the existing createApplication logic (potentially via RPC if it's a function,
        // or direct insert if the database.ts function isn't directly callable here).
        // Assuming direct insert + score calculation for simplicity here.
        // Ideally, reuse database.ts createApplication logic if possible (e.g., via RPC call)

        // Simplified direct insert + RPC call for score (Mimicking createApplication)
        const { data: scoreData, error: scoreError } = await supabase.rpc(
          "calculate_match_score",
          { p_user_id: match.user_id, p_job_id: match.job_id }
        );

        if (scoreError) {
          console.warn(
            `Could not calculate match score for application (Match ID: ${match.id}):`,
            scoreError.message
          );
          // Proceed without score or skip? Let's proceed with null score.
        }
        const calculatedMatchScore =
          typeof scoreData === "number" ? scoreData : null;

        const { data: newApplication, error: appError } = await supabase
          .from("applications")
          .insert({
            ...applicationInput,
            match_score: calculatedMatchScore,
          })
          .select("id")
          .single();

        if (appError || !newApplication) {
          console.error(
            `Error creating application for match ID ${match.id}:`,
            appError
          );
          applicationErrors++;
          continue; // Skip to next match
        }

        console.log(
          `Application ${newApplication.id} created for match ID ${match.id}.`
        );

        // 4. Update power_match record
        const { error: updateError } = await supabase
          .from("power_matches")
          .update({
            application_id: newApplication.id,
            applied_at: new Date().toISOString(),
          })
          .eq("id", match.id);

        if (updateError) {
          console.error(
            `Error updating power match ${match.id} after application ${newApplication.id}:`,
            updateError
          );
          // Critical error: Application created but match not updated. Requires monitoring/manual fix.
          updateErrors++;
        } else {
          applicationsCreated++;
          console.log(`Power match ${match.id} updated successfully.`);
        }
      } catch (innerError) {
        console.error(
          `Unexpected error processing match ID ${match.id}:`,
          innerError
        );
        applicationErrors++; // Count as an application error
      }
    }

    const result = {
      message: "Auto-apply process complete.",
      matchesProcessed: matchesToApply.length,
      applicationsCreated,
      applicationErrors,
      updateErrors,
    };
    console.log("Function finished:", result);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in auto-apply-power-matches function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
