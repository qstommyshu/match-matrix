-- Migration for Pro Job Seeker Automation Functions (SQL Part 1)

BEGIN;

-- Function to find eligible power match jobs for a given user
CREATE OR REPLACE FUNCTION find_eligible_power_match_jobs(p_user_id UUID, p_limit INT DEFAULT 3)
RETURNS TABLE (job_id UUID, match_score NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Ensure the user is a Pro user and active (optional check, can be done in calling function)
    -- PERFORM 1 FROM public.job_seeker_profiles jsp
    -- WHERE jsp.id = p_user_id AND jsp.is_pro = TRUE AND jsp.pro_active_status = TRUE;
    -- IF NOT FOUND THEN
    --     RETURN QUERY SELECT uuid_nil(), 0.0::NUMERIC WHERE FALSE; -- Return empty if not pro/active
    -- END IF;

    RETURN QUERY
    WITH potential_jobs AS (
        SELECT
            j.id AS job_id,
            public.calculate_match_score(p_user_id, j.id) AS calculated_score
        FROM public.jobs j
        WHERE j.status = 'open' -- Only consider open jobs
    )
    SELECT
        pj.job_id,
        pj.calculated_score
    FROM potential_jobs pj
    WHERE pj.calculated_score > 80.0 -- Match score threshold
      -- Exclude jobs the user has already applied to
      AND NOT EXISTS (
          SELECT 1
          FROM public.applications a
          WHERE a.user_id = p_user_id AND a.job_id = pj.job_id
      )
      -- Exclude jobs already in the user's power matches
      AND NOT EXISTS (
          SELECT 1
          FROM public.power_matches pm
          WHERE pm.user_id = p_user_id AND pm.job_id = pj.job_id
      )
    ORDER BY pj.calculated_score DESC
    LIMIT p_limit;

END;
$$;

COMMENT ON FUNCTION find_eligible_power_match_jobs(UUID, INT) IS 'Finds top N eligible jobs (>80% match score) for a Pro user, excluding already applied/matched jobs.';

-- Function to deactivate Pro users who haven't checked in recently
CREATE OR REPLACE FUNCTION deactivate_inactive_pro_users()
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  cutoff_time TIMESTAMPTZ := now() - interval '25 hours'; -- Allow a 25-hour window
BEGIN
  UPDATE public.job_seeker_profiles
  SET pro_active_status = FALSE
  WHERE is_pro = TRUE
    AND pro_active_status = TRUE
    AND (
      last_active_check_in IS NULL 
      OR last_active_check_in < cutoff_time
    );

  RAISE NOTICE 'Deactivated pro users who last checked in before %', cutoff_time;
END;
$$;

COMMENT ON FUNCTION deactivate_inactive_pro_users() IS 'Sets pro_active_status to FALSE for Pro users who haven''t checked in within the last 25 hours.';

COMMIT; 