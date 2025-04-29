-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum type for invitation status
CREATE TYPE public.invitation_status AS ENUM (
    'pending',
    'accepted',
    'declined'
);

-- 1. Employer Power Matches Table
-- Stores potential matches identified by the system for employers.
CREATE TABLE public.employer_power_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- The job seeker being matched
    match_score NUMERIC NOT NULL CHECK (match_score >= 0 AND match_score <= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    viewed_at TIMESTAMPTZ,
    sent_invitation_at TIMESTAMPTZ,
    invitation_status public.invitation_status,
    invitation_response_at TIMESTAMPTZ,
    UNIQUE(job_id, user_id) -- Ensure only one match record per job/candidate pair
);

-- RLS for employer_power_matches
ALTER TABLE public.employer_power_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_employer_power_matches ON public.employer_power_matches
    FOR SELECT
    USING (auth.uid() = employer_id);

CREATE POLICY insert_own_employer_power_matches ON public.employer_power_matches
    FOR INSERT
    WITH CHECK (auth.uid() = employer_id);

CREATE POLICY update_own_employer_power_matches ON public.employer_power_matches
    FOR UPDATE
    USING (auth.uid() = employer_id)
    WITH CHECK (auth.uid() = employer_id);

-- Indexes for employer_power_matches
CREATE INDEX idx_employer_power_matches_employer_id ON public.employer_power_matches(employer_id);
CREATE INDEX idx_employer_power_matches_job_id ON public.employer_power_matches(job_id);
CREATE INDEX idx_employer_power_matches_user_id ON public.employer_power_matches(user_id);

-- 2. Candidate Invitations Table
-- Stores invitations sent from employers to candidates based on power matches.
CREATE TABLE public.candidate_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- The invited candidate
    employer_power_match_id UUID REFERENCES public.employer_power_matches(id) ON DELETE SET NULL, -- Link to the match that triggered the invitation
    message TEXT, -- Optional custom message from employer
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    viewed_at TIMESTAMPTZ,
    status public.invitation_status NOT NULL DEFAULT 'pending',
    responded_at TIMESTAMPTZ,
    UNIQUE(employer_power_match_id) -- Ensure one invitation per power match
);

-- RLS for candidate_invitations
ALTER TABLE public.candidate_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_candidate_invitations ON public.candidate_invitations
    FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = employer_id);

CREATE POLICY insert_employer_candidate_invitations ON public.candidate_invitations
    FOR INSERT
    WITH CHECK (auth.uid() = employer_id);

CREATE POLICY update_candidate_invitation_status ON public.candidate_invitations
    FOR UPDATE
    USING (auth.uid() = user_id) -- Only candidate can update (respond)
    WITH CHECK (auth.uid() = user_id AND status != 'pending'); -- Check they are the candidate and are changing status

-- Indexes for candidate_invitations
CREATE INDEX idx_candidate_invitations_user_id ON public.candidate_invitations(user_id);
CREATE INDEX idx_candidate_invitations_employer_id ON public.candidate_invitations(employer_id);
CREATE INDEX idx_candidate_invitations_job_id ON public.candidate_invitations(job_id);

-- 3. Notifications Table (Create if not exists)
-- Generic table for various notifications, including invitations.
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- e.g., 'invitation', 'application_update', etc.
    content JSONB NOT NULL, -- Flexible content based on notification type
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Ensure RLS is enabled if the table was just created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications'
    ) THEN
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- RLS for notifications (basic policy: user can access own notifications)
CREATE POLICY select_own_notifications ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY insert_own_notifications ON public.notifications
    FOR INSERT
    WITH CHECK (auth.uid() = user_id); -- Or modify based on how notifications are created (triggers?)

CREATE POLICY update_own_notifications ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY delete_own_notifications ON public.notifications
    FOR DELETE
    USING (auth.uid() = user_id);

-- Index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id); 