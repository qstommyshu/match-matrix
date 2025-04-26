-- Migration to fix RLS policy for power_matches allowing user inserts via RPC

BEGIN;

-- Drop existing policies if they conflict (optional, but safer)
-- No conflicting INSERT policy exists based on migration 17.

-- Policy: Allow authenticated users (job seekers) to insert their OWN power matches.
-- This is required for the trigger_user_power_match function when called via RPC (Security Invoker).
CREATE POLICY insert_own_power_matches ON public.power_matches
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Re-state existing policies for clarity (optional, doesn't hurt)

-- Policy: Job seekers can view their own power matches (from migration 17)
-- CREATE POLICY select_own_power_matches ON public.power_matches FOR SELECT USING (auth.uid() = user_id);

-- Policy: Job seekers can update viewed_at for their own power matches (from migration 17)
-- CREATE POLICY update_own_power_matches_viewed ON public.power_matches FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND viewed_at IS NOT NULL);


COMMIT; 