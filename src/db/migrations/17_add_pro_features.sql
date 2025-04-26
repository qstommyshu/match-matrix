-- Migration for Pro Job Seeker Features

BEGIN;

-- 1. Add columns to job_seeker_profiles table
ALTER TABLE public.job_seeker_profiles
ADD COLUMN is_pro BOOLEAN DEFAULT FALSE,
ADD COLUMN pro_active_status BOOLEAN DEFAULT FALSE,
ADD COLUMN last_active_check_in TIMESTAMPTZ;

COMMENT ON COLUMN public.job_seeker_profiles.is_pro IS 'Indicates if the job seeker has upgraded to a Pro account.';
COMMENT ON COLUMN public.job_seeker_profiles.pro_active_status IS 'Indicates if the Pro job seeker is currently marked as actively seeking (requires daily check-in).';
COMMENT ON COLUMN public.job_seeker_profiles.last_active_check_in IS 'Timestamp of the last time the Pro job seeker confirmed active status.';

-- 2. Create assessment_skills table
CREATE TABLE public.assessment_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    assessment_score NUMERIC(5, 2) NOT NULL CHECK (assessment_score >= 0 AND assessment_score <= 100),
    verified_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (user_id, skill_id)
);

COMMENT ON TABLE public.assessment_skills IS 'Stores verified skill assessments for Pro job seekers.';
COMMENT ON COLUMN public.assessment_skills.assessment_score IS 'Score received by the user on the skill assessment (e.g., percentage).';
COMMENT ON COLUMN public.assessment_skills.verified_at IS 'Timestamp when the skill assessment was successfully completed/verified.';

-- 3. Create power_matches table
CREATE TABLE public.power_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL, -- Link to the application if auto-applied
    match_score NUMERIC(5, 2) NOT NULL CHECK (match_score > 80 AND match_score <= 100), -- Store the high match score that triggered this
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL, -- When the power match was generated
    viewed_at TIMESTAMPTZ, -- When the job seeker viewed the job details for this match
    applied_at TIMESTAMPTZ, -- When the application was automatically submitted
    UNIQUE (user_id, job_id) -- Prevent duplicate power matches for the same user/job
);

COMMENT ON TABLE public.power_matches IS 'Tracks jobs automatically matched and potentially applied to for Pro users (Power Match feature).';
COMMENT ON COLUMN public.power_matches.application_id IS 'Reference to the application created by the Power Match auto-apply feature.';
COMMENT ON COLUMN public.power_matches.match_score IS 'The calculated match score that qualified this job as a Power Match (>80%).';
COMMENT ON COLUMN public.power_matches.viewed_at IS 'Timestamp when the Pro user viewed the details of the matched job.';
COMMENT ON COLUMN public.power_matches.applied_at IS 'Timestamp when the system automatically applied to the job on behalf of the user.';

-- 4. RLS Policies

-- Enable RLS for the new tables
ALTER TABLE public.assessment_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.power_matches ENABLE ROW LEVEL SECURITY;

-- Allow job seekers to manage their own new profile columns
-- (Assuming existing policy on job_seeker_profiles allows SELECT/UPDATE for owner)
-- We need to explicitly grant UPDATE permission for the new columns if the policy doesn't cover it broadly.
-- Let's assume the existing policy `job_seeker_profiles_policy` handles this. If issues arise, revisit.
-- Example (if needed):
-- DROP POLICY IF EXISTS update_own_job_seeker_profile ON public.job_seeker_profiles;
-- CREATE POLICY update_own_job_seeker_profile ON public.job_seeker_profiles
--   FOR UPDATE USING (auth.uid() = id)
--   WITH CHECK (auth.uid() = id);

-- Policy: Job seekers can view their own assessment skills
CREATE POLICY select_own_assessment_skills ON public.assessment_skills
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Job seekers can create their own assessment skills (or system creates them)
CREATE POLICY insert_own_assessment_skills ON public.assessment_skills
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Job seekers can update their own assessment scores (or system does)
-- Note: Be cautious with allowing direct user updates vs. system updates
CREATE POLICY update_own_assessment_skills ON public.assessment_skills
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Job seekers can delete their own assessment skills
CREATE POLICY delete_own_assessment_skills ON public.assessment_skills
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: Job seekers can view their own power matches
CREATE POLICY select_own_power_matches ON public.power_matches
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: System/backend can create power matches (users don't create these directly)
-- We'll rely on the service role or a specific role for inserts, so no user INSERT policy.

-- Policy: Job seekers can update viewed_at for their own power matches
CREATE POLICY update_own_power_matches_viewed ON public.power_matches
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id AND viewed_at IS NOT NULL);
    -- Only allow updating viewed_at, other fields (like applied_at) are system-managed.
    -- More specific column-level policies might be better if Supabase supports them easily,
    -- otherwise handle logic in backend functions.

-- Policy: Job seekers cannot delete power matches (system managed)


COMMIT; 