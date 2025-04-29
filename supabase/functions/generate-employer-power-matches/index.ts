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

// Type definition for the job entry
interface Job {
  id: string;
  employer_id: string;
}

// Type definition for the match entry for insertion
interface EmployerPowerMatch {
  job_id: string;
  user_id: string;
  employer_id: string;
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
    !authorization.startsWith("Bearer ") ||
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

    // 1. Fetch active job postings
    const { data: activeJobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, employer_id")
      .eq("status", "open") // Only active job postings
      .eq("is_deleted", false); // Exclude deleted jobs

    if (jobsError) {
      console.error("Error fetching active jobs:", jobsError);
      throw jobsError;
    }

    if (!activeJobs || activeJobs.length === 0) {
      console.log("No active jobs found.");
      return new Response(
        JSON.stringify({ message: "No active jobs found." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${activeJobs.length} active jobs.`);
    let totalMatchesCreated = 0;
    let jobsProcessed = 0;
    let jobsFailed = 0;

    // 2. Fetch all active job seekers (we'll filter in-memory)
    const { data: jobSeekers, error: seekersError } = await supabase
      .from("job_seeker_profiles")
      .select("id");

    if (seekersError) {
      console.error("Error fetching job seekers:", seekersError);
      throw seekersError;
    }

    if (!jobSeekers || jobSeekers.length === 0) {
      console.log("No job seekers found.");
      return new Response(
        JSON.stringify({ message: "No job seekers found." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${jobSeekers.length} job seekers to evaluate.`);

    // Process each job to find potential candidates
    for (const job of activeJobs as Job[]) {
      jobsProcessed++;
      console.log(
        `Processing matches for job: ${job.id}, employer: ${job.employer_id}`
      );

      try {
        let matchesCreated = 0;
        const potentialMatches: EmployerPowerMatch[] = [];

        // 3. For each job seeker, calculate match score
        for (const seeker of jobSeekers) {
          // Using calculate_match_score function to get the match score
          const { data: score, error: scoreError } = await supabase.rpc(
            "calculate_match_score", // Use existing function
            { p_user_id: seeker.id, p_job_id: job.id }
          );

          if (scoreError) {
            console.error(
              `Error calculating match score for job ${job.id}, user ${seeker.id}:`,
              scoreError
            );
            continue;
          }

          // Only consider scores above 70% (this can be adjusted as needed)
          if (score >= 70) {
            // Check if user has already applied to this job
            const { data: existingApplication, error: appError } =
              await supabase
                .from("applications")
                .select("id")
                .eq("job_id", job.id)
                .eq("user_id", seeker.id)
                .maybeSingle();

            if (appError) {
              console.error(
                `Error checking existing application for job ${job.id}, user ${seeker.id}:`,
                appError
              );
              continue;
            }

            if (existingApplication) {
              console.log(
                `User ${seeker.id} has already applied to job ${job.id}, skipping.`
              );
              continue;
            }

            // Check if this match already exists
            const { data: existingMatch, error: checkError } = await supabase
              .from("employer_power_matches")
              .select("id")
              .eq("job_id", job.id)
              .eq("user_id", seeker.id)
              .maybeSingle();

            if (checkError) {
              console.error(
                `Error checking existing match for job ${job.id}, user ${seeker.id}:`,
                checkError
              );
              continue;
            }

            if (existingMatch) {
              console.log(
                `Match already exists for job ${job.id}, user ${seeker.id}`
              );
              continue;
            }

            // Avoid matching employer with themselves (if they have a job seeker profile)
            if (seeker.id === job.employer_id) {
              console.log(`Skipping employer self-match: ${job.employer_id}`);
              continue;
            }

            // Add to potential matches
            potentialMatches.push({
              job_id: job.id,
              user_id: seeker.id,
              employer_id: job.employer_id,
              match_score: score / 100, // Convert to decimal (0-1 range)
            });
          }
        }

        // Sort matches by score (highest first) and take top 20
        const topMatches = potentialMatches
          .sort((a, b) => b.match_score - a.match_score)
          .slice(0, 20);

        console.log(
          `Found ${topMatches.length} potential candidates for job ${job.id}.`
        );

        // Insert top matches into employer_power_matches table
        for (const match of topMatches) {
          const { data: insertedMatch, error: insertError } = await supabase
            .from("employer_power_matches")
            .insert({
              job_id: match.job_id,
              user_id: match.user_id,
              employer_id: match.employer_id,
              match_score: match.match_score,
            })
            .select()
            .single();

          if (insertError) {
            console.error(
              `Error creating match for job ${match.job_id}, user ${match.user_id}:`,
              insertError
            );
            continue;
          }

          console.log(
            `Created employer power match for job ${match.job_id}, user ${match.user_id} with score ${match.match_score}`
          );
          matchesCreated++;
        }

        totalMatchesCreated += matchesCreated;
        console.log(`Created ${matchesCreated} new matches for job ${job.id}`);
      } catch (jobProcessError) {
        console.error(`Error processing job ${job.id}:`, jobProcessError);
        jobsFailed++;
      }
    }

    const finalResult = {
      message: "Employer power match generation complete.",
      jobsProcessed,
      jobsFailed,
      totalMatchesCreated,
    };

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error in generate-employer-power-matches function:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
