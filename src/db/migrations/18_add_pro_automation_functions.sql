-- Migration for Pro Job Seeker Automation Functions (SQL Part 1)

BEGIN;

-- Function to find eligible power match jobs for a given user
CREATE OR REPLACE FUNCTION find_eligible_power_match_jobs(p_user_id UUID, p_limit INT DEFAULT 3)
RETURNS TABLE (job_id UUID, match_score NUMERIC)
LANGUAGE plpgsql
AS $$
DECLARE
    is_pro_user BOOLEAN;
BEGIN
    -- Check if the user is a Pro user
    SELECT jsp.is_pro
    INTO is_pro_user
    FROM public.job_seeker_profiles jsp
    WHERE jsp.id = p_user_id;

    -- Default to false if not found, though this shouldn't happen if called correctly
    is_pro_user := COALESCE(is_pro_user, FALSE);

    RETURN QUERY
    WITH potential_jobs AS (
        SELECT
            j.id AS job_id,
            -- Use the appropriate score calculation based on Pro status
            (CASE
                WHEN is_pro_user THEN public.calculate_pro_match_score(p_user_id, j.id)
                ELSE public.calculate_match_score(p_user_id, j.id)
            END)::NUMERIC AS calculated_score
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

COMMENT ON FUNCTION find_eligible_power_match_jobs(UUID, INT) IS 'Finds top N eligible jobs (>80% match score) for a user. Uses assessment_skills ONLY for Pro users, otherwise uses user_skills. Excludes already applied/matched jobs.';

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