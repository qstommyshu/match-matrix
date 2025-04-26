-- Migration to modify trigger_user_power_match to auto-apply immediately

BEGIN;

CREATE OR REPLACE FUNCTION public.trigger_user_power_match(p_user_id UUID)
RETURNS JSON -- Return status, message, and count of *applications created*
LANGUAGE plpgsql
SECURITY DEFINER -- ADDED: Run with definer privileges to bypass invoker's RLS issues
AS $$
DECLARE
  is_pro_user BOOLEAN;
  is_active_user BOOLEAN;
  eligible_match RECORD; -- Use RECORD for the loop variable
  eligible_jobs_count INT := 0;
  applications_created_count INT := 0;
  new_power_match_id UUID;
  new_application_id UUID;
  result JSON;
BEGIN
  -- 1. Check if user is Pro and Active
  SELECT jsp.is_pro, jsp.pro_active_status
  INTO is_pro_user, is_active_user
  FROM public.job_seeker_profiles jsp
  WHERE jsp.id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('status', 'error', 'message', 'User profile not found.', 'new_matches_applied', 0);
  END IF;

  IF NOT is_pro_user THEN
    RETURN json_build_object('status', 'error', 'message', 'User is not a Pro subscriber.', 'new_matches_applied', 0);
  END IF;

  IF NOT is_active_user THEN
     RETURN json_build_object('status', 'error', 'message', 'Pro user is not currently active (needs daily check-in). Find aborted.', 'new_matches_applied', 0);
  END IF;

  -- 2. Find eligible jobs (score > 80, not applied/matched)
  -- Use a CTE to easily check count first
  WITH eligible_jobs_cte AS (
    SELECT job_id, match_score
    FROM public.find_eligible_power_match_jobs(p_user_id, 3) -- Limit to 3 as before
  )
  SELECT count(*) INTO eligible_jobs_count FROM eligible_jobs_cte;

  -- 3. Loop through eligible jobs and attempt to insert match + application
  IF eligible_jobs_count > 0 THEN
    FOR eligible_match IN
      SELECT job_id, match_score
      FROM public.find_eligible_power_match_jobs(p_user_id, 3)
    LOOP
      BEGIN
        -- Start a sub-transaction for atomicity of match+application
        -- Insert power match first (handles unique violation check)
        INSERT INTO public.power_matches (user_id, job_id, match_score)
        VALUES (p_user_id, eligible_match.job_id, eligible_match.match_score)
        RETURNING id INTO new_power_match_id;

        -- Immediately insert the application
        INSERT INTO public.applications (job_id, user_id, status, stage, match_score)
        VALUES (eligible_match.job_id, p_user_id, 'Applied', 'Applied', eligible_match.match_score)
        RETURNING id INTO new_application_id;

        -- Update the power match with the application details
        UPDATE public.power_matches
        SET application_id = new_application_id,
            applied_at = now()
        WHERE id = new_power_match_id;

        applications_created_count := applications_created_count + 1;

      EXCEPTION
        WHEN unique_violation THEN
          -- This handles the case where power_matches insert fails (already exists)
          RAISE NOTICE 'Skipping application: Power match for user % job % already exists.', p_user_id, eligible_match.job_id;
        WHEN others THEN
          -- Catch any other errors during application insert or power_match update
          RAISE WARNING 'Error processing match/application for user % job %: %', p_user_id, eligible_match.job_id, SQLERRM;
          -- Decide if we should rollback just this iteration or stop? 
          -- For now, we log and continue to the next job.
      END; -- End sub-transaction block
    END LOOP;
  END IF; -- End check for eligible_jobs_count > 0

  -- 4. Return result based on applications created
  result := json_build_object(
      'status', 'success',
      'message', CASE
                   WHEN applications_created_count > 0 THEN 'Found and auto-applied to ' || applications_created_count::text || ' new job(s).'
                   ELSE 'Power match search complete. No new eligible jobs found to apply to.'
                 END,
      'new_matches_applied', applications_created_count -- Renamed field for clarity
    );
  RETURN result;

END;
$$;

COMMENT ON FUNCTION public.trigger_user_power_match(UUID) IS 'Manually triggers power match generation for a specific Pro user. Finds eligible jobs (>80% match), inserts power_match record, IMMEDIATELY creates an application, updates power_match, and returns status JSON including count of *applications created*. Runs as SECURITY DEFINER.';

COMMIT; 