-- MIGRATION: Create summarize-applicant Edge Function
--
-- NOTE: This migration file serves as documentation and contains the code
-- for the Edge Function. To actually deploy this function, you need to use
-- the Supabase CLI or dashboard to create and deploy the Edge Function.
--
-- STEP 1: Install Supabase CLI if not already installed
--   npm install -g supabase
--
-- STEP 2: Initialize Supabase functions in your project
--   supabase functions new summarize-applicant
--
-- STEP 3: Copy the code below into the Edge Function file
--   (Typically at /supabase/functions/summarize-applicant/index.ts)
--
-- STEP 4: Deploy the function
--   supabase functions deploy summarize-applicant
--
-- STEP 5: Set environment variables (OPENAI_API_KEY)
--   supabase secrets set OPENAI_API_KEY=sk-your-key-here

/*
// Edge Function Code: summarize-applicant/index.ts
// ------------------------------------------------

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { OpenAI } from 'https://esm.sh/openai@4.0.0'

const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
if (!openaiApiKey) {
  throw new Error('OPENAI_API_KEY environment variable is required')
}

const openai = new OpenAI({
  apiKey: openaiApiKey,
})

interface RequestBody {
  applicationId: string
}

serve(async (req: Request) => {
  try {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        status: 204,
      })
    }

    // Parse request body
    const requestData: RequestBody = await req.json()
    const { applicationId } = requestData
    
    if (!applicationId) {
      return new Response(
        JSON.stringify({ error: 'applicationId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get authorization token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    // Create Supabase client with user's JWT token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    )
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Get application details including job_id and user_id
    const { data: application, error: appError } = await supabaseClient
      .from('applications')
      .select('id, job_id, user_id, status')
      .eq('id', applicationId)
      .single()
      
    if (appError || !application) {
      return new Response(
        JSON.stringify({ error: 'Application not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Get job details including employer_id to verify authorization
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select('employer_id, title')
      .eq('id', application.job_id)
      .single()
      
    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Verify the current user is the employer who owns this job
    if (user.id !== job.employer_id) {
      return new Response(
        JSON.stringify({ error: 'Not authorized to access this application' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Get job seeker profile details
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select(`
        id, 
        full_name, 
        email,
        job_seeker_profile:job_seeker_profiles(
          headline, 
          bio, 
          location, 
          years_of_experience,
          desired_role
        )
      `)
      .eq('id', application.user_id)
      .single()
      
    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Get user skills
    const { data: skills, error: skillsError } = await supabaseClient
      .from('user_skills')
      .select(`
        proficiency_level,
        skill:skills(
          name
        )
      `)
      .eq('user_id', application.user_id)
    
    if (skillsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch skills' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Get experiences (work and education)
    const { data: experiences, error: expError } = await supabaseClient
      .from('experiences')
      .select(`
        type,
        title,
        organization,
        location,
        start_date,
        end_date,
        is_current,
        description
      `)
      .eq('user_id', application.user_id)
      .order('start_date', { ascending: false })
    
    if (expError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch experiences' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Format skills for the prompt
    const skillsList = skills
      ? skills.map((s) => s.skill?.name || 'Unknown').join(', ')
      : 'No skills listed'
    
    // Format work experience for the prompt
    const workExperience = experiences
      ? experiences
          .filter((e) => e.type === 'work')
          .map((e) => {
            const duration = e.is_current 
              ? `${new Date(e.start_date).getFullYear()} - Present` 
              : `${new Date(e.start_date).getFullYear()} - ${e.end_date ? new Date(e.end_date).getFullYear() : 'N/A'}`
            return `${e.title} at ${e.organization} (${duration})`
          })
          .join('; ')
      : 'No work experience listed'
    
    // Format education for the prompt
    const education = experiences
      ? experiences
          .filter((e) => e.type === 'education')
          .map((e) => {
            const duration = `${new Date(e.start_date).getFullYear()} - ${e.end_date ? new Date(e.end_date).getFullYear() : 'Present'}`
            return `${e.title} at ${e.organization} (${duration})`
          })
          .join('; ')
      : 'No education listed'
    
    // Construct the prompt for OpenAI
    const prompt = `
    You are an HR assistant summarizing a job applicant's profile for a hiring manager.
    
    Create a single, concise sentence that highlights the most relevant aspects of this candidate for the job "${job.title}".
    Focus on years of experience, skills, and education that are most relevant. Be factual and objective.
    
    CANDIDATE PROFILE:
    Name: ${profile.full_name || 'Not provided'}
    Headline: ${profile.job_seeker_profile?.headline || 'Not provided'}
    Years of Experience: ${profile.job_seeker_profile?.years_of_experience || 'Not specified'} years
    Desired Role: ${profile.job_seeker_profile?.desired_role || 'Not specified'}
    Location: ${profile.job_seeker_profile?.location || 'Not specified'}
    
    Skills: ${skillsList}
    
    Work Experience: ${workExperience}
    
    Education: ${education}
    
    Bio: ${profile.job_seeker_profile?.bio || 'Not provided'}
    
    FORMAT YOUR RESPONSE AS JSON:
    {
      "summary": "Your single-sentence summary here."
    }
    `
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an HR assistant that summarizes candidate profiles into a single sentence.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
    
    const responseContent = completion.choices[0]?.message?.content || '{}'
    const parsedResponse = JSON.parse(responseContent)
    const summary = parsedResponse.summary || 'Failed to generate summary'
    
    // Update the application with the AI summary
    const { error: updateError } = await supabaseClient
      .from('applications')
      .update({ ai_summary: summary })
      .eq('id', applicationId)
    
    if (updateError) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save summary',
          summary: summary // Still return the summary even if saving failed
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Return success response with summary
    return new Response(
      JSON.stringify({ summary }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    )
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
*/

-- STEP 6: Update the application to use the Edge Function
-- 
-- In your frontend code (e.g., src/pages/ViewApplicantsPage.tsx),
-- you'll need to add logic to call the Edge Function. Here's a helper
-- function example to add to a relevant utility file:

/*
// In a utility file or directly in your component
export const generateAISummary = async (applicationId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('summarize-applicant', {
      body: { applicationId },
    });
    
    if (error) throw error;
    return { summary: data.summary, error: null };
  } catch (err) {
    console.error('Error generating AI summary:', err);
    return { summary: null, error: err };
  }
};
*/

-- Note: The actual database migration part (adding the ai_summary column)
-- has already been handled in the previous migration.
-- This file serves as documentation and code reference only. 