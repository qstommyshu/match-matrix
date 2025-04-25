// supabase/functions/summarize-applicant/index.ts

import { serve } from "http/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

interface RequestBody {
  applicationId: string;
}

// Helper to set CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Check for authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("→ Missing Authorization header");
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Parse request body
    const body: RequestBody = await req.json();
    const { applicationId } = body;

    if (!applicationId) {
      return new Response(JSON.stringify({ error: "Missing applicationId" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Get SUPABASE_URL and SUPABASE_ANON_KEY from environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    // Create Supabase client with the JWT from the Authorization header
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("auth.getUser result:", { user, userError });
    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          details: userError,
          authHeader: authHeader ? "Present" : "Missing",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Get the application by ID
    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .select("*, job:job_id(*)")
      .eq("id", applicationId)
      .single();
    console.log("application query result:", { application, applicationError });
    if (applicationError || !application) {
      return new Response(
        JSON.stringify({
          error: "Application not found",
          details: applicationError,
          applicationId: applicationId,
          userId: user.id,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Get user profile to check if they're an employer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, type, full_name")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({
          error: "User profile not found",
          details: profileError,
          userId: user.id,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Check if user is an employer
    if (profile.type !== "employer") {
      return new Response(
        JSON.stringify({
          error: "User is not an employer",
          profileType: profile.type,
          userId: user.id,
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Check if the employer owns this job
    if (application.job.employer_id !== user.id) {
      return new Response(
        JSON.stringify({
          error: "User is not authorized to access this application",
          userId: user.id,
          jobEmployerId: application.job.employer_id,
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Get the applicant profile
    const { data: applicantProfile, error: applicantProfileError } =
      await supabase
        .from("profiles")
        .select(
          `
          id, 
          full_name
        `
        )
        .eq("id", application.user_id)
        .single();

    if (applicantProfileError || !applicantProfile) {
      return new Response(
        JSON.stringify({
          error: "Applicant profile not found",
          details: applicantProfileError,
          applicantId: application.user_id,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Get job seeker profile details
    const { data: jobSeekerProfile, error: jobSeekerProfileError } =
      await supabase
        .from("job_seeker_profiles")
        .select(
          `
          bio,
          headline,
          years_of_experience,
          desired_role,
          location,
          education
        `
        )
        .eq("id", application.user_id)
        .single();

    console.log("job_seeker_profile query result:", {
      jobSeekerProfile,
      jobSeekerProfileError,
    });

    // Get user skills
    const { data: skills, error: skillsError } = await supabase
      .from("user_skills")
      .select(
        `
        skill_id,
        skills:skill_id(name)
      `
      )
      .eq("user_id", application.user_id);

    console.log("skills query result:", { skills, skillsError });

    if (skillsError) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch skills",
          details: skillsError,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Format skills list
    const skillsList =
      skills && skills.length > 0
        ? skills
            .map((item) => {
              // Access the skill name from the joined skills table
              const skill = item.skills as { name?: string };
              return skill?.name || "Unknown";
            })
            .join(", ")
        : "No skills listed";

    // Get the job details
    const job = application.job;

    // Initialize OpenAI client
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          error: "OpenAI API key not configured",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Get experience and education from job seeker profile
    const education = jobSeekerProfile?.education || "Not provided";
    const headline = jobSeekerProfile?.headline || "Not provided";
    const yearsOfExperience =
      jobSeekerProfile?.years_of_experience || "Not specified";

    console.log("Calling OpenAI with prompt:");
    // Generate a summary using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant for a job matching platform. Your task is to analyze an applicant's profile and determine how well they match with a job posting. Focus on skills, experience, and qualifications.",
        },
        {
          role: "user",
          content: `
Analyze this applicant for job fit:

Job Title: ${job.title}
Job Description: ${job.description}
Required Skills: ${job.required_skills || "Not specified"}
Experience Level: ${job.experience_level || "Not specified"}
Location: ${job.location || "Not specified"}

Applicant Profile:
Name: ${applicantProfile.full_name}
Headline: ${headline}
Years of Experience: ${yearsOfExperience}
Bio: ${jobSeekerProfile?.bio || "Not provided"}
Skills: ${skillsList}
Education: ${education}

Provide a concise summary (max 200 words) of how well this applicant matches the job requirements. Highlight strengths and potential gaps.
          `,
        },
      ],
      temperature: 0.7,
      max_tokens: 350,
    });
    console.log("OpenAI response:", completion);

    const summary =
      completion.choices[0]?.message?.content || "Unable to generate summary";

    // Update the application with the AI summary
    const { error: updateError } = await supabase
      .from("applications")
      .update({ ai_summary: summary })
      .eq("id", applicationId);

    if (updateError) {
      return new Response(
        JSON.stringify({
          error: "Failed to update application with summary",
          details: updateError,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Return the summary
    return new Response(
      JSON.stringify({
        success: true,
        summary,
        application: {
          id: application.id,
          status: application.status,
          job: {
            id: job.id,
            title: job.title,
          },
          applicant: {
            id: applicantProfile.id,
            name: applicantProfile.full_name,
          },
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: unknown) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
