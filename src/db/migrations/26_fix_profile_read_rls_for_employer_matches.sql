-- Drop the overly restrictive policy from migration 04
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Re-create policy allowing users to view their own profile (ensures basic functionality)
CREATE POLICY "Allow users to view their own profile" 
    ON public.profiles 
    FOR SELECT 
    USING (auth.uid() = id);

-- Create a new policy allowing employers to view profiles of their potential candidates
CREATE POLICY "Allow employers to view profiles of their power match candidates"
    ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.employer_power_matches epm
            WHERE epm.employer_id = auth.uid() AND epm.user_id = public.profiles.id
        )
    );

-- Optional but recommended: Re-apply the policy from migration 13 if it was intended
-- This policy allows any authenticated user to read any profile, which might be needed elsewhere.
-- If this broader access IS desired, uncomment the lines below.
-- If only the employer-match access is needed, keep these commented.
-- 
-- DROP POLICY IF EXISTS "Allow read access for all users" ON public.profiles; -- Drop if exists from migration 13 attempt
-- CREATE POLICY "Allow read access for authenticated users" 
--     ON public.profiles 
--     FOR SELECT 
--     USING (auth.role() = 'authenticated'); -- Or USING (true) if any visitor should read profiles

-- Note: If both the employer-specific and the general authenticated-read policies exist,
-- RLS combines them with OR. So an employer could read their own profile OR a matched candidate's profile OR any profile (if the last policy is active). 