-- Migration for Manual Power Match Trigger

BEGIN;

-- Function to manually trigger power match generation for a single user
CREATE OR REPLACE FUNCTION trigger_user_power_match(p_user_id UUID)
RETURNS JSON -- Return status, message, and count
LANGUAGE plpgsql
AS $$
DECLARE
  is_pro_user BOOLEAN;
  is_active_user BOOLEAN;
  new_matches RECORD; -- Use RECORD for the loop variable
  match_count INT := 0;
  eligible_jobs_count INT := 0; -- Variable to check if jobs were found
  result JSON;
BEGIN
  -- 1. Check if user is Pro and Active
  SELECT jsp.is_pro, jsp.pro_active_status
  INTO is_pro_user, is_active_user
  FROM public.job_seeker_profiles jsp
  WHERE jsp.id = p_user_id;

  IF NOT FOUND THEN
    result := json_build_object(
      'status', 'error',
      'message', 'User profile not found.',
      'new_matches_found', 0
    );
    RETURN result;
  END IF;

  IF NOT is_pro_user THEN
    result := json_build_object(
      'status', 'error',
      'message', 'User is not a Pro subscriber.',
      'new_matches_found', 0
    );
    RETURN result;
  END IF;

  IF NOT is_active_user THEN
     result := json_build_object(
      'status', 'error',
      'message', 'Pro user is not currently active (needs daily check-in). Find aborted.',
      'new_matches_found', 0
    );
    RETURN result;
  END IF;

  -- 2. Use a CTE to get eligible jobs and check count first
  WITH eligible_jobs_cte AS (
    SELECT job_id, match_score
    FROM public.find_eligible_power_match_jobs(p_user_id, 3)
  )
  SELECT count(*) INTO eligible_jobs_count FROM eligible_jobs_cte;

  -- Only loop if eligible jobs were found
  IF eligible_jobs_count > 0 THEN
    FOR new_matches IN
      SELECT job_id, match_score
      FROM public.find_eligible_power_match_jobs(p_user_id, 3) -- Re-select for the loop (optimizer should handle this)
    LOOP
      -- 3. Insert into power_matches
      BEGIN
        INSERT INTO public.power_matches (user_id, job_id, match_score)
        VALUES (p_user_id, new_matches.job_id, new_matches.match_score);
        match_count := match_count + 1;
      EXCEPTION
        WHEN unique_violation THEN
          RAISE NOTICE 'Power match for user % job % already exists, skipping.', p_user_id, new_matches.job_id;
        WHEN others THEN
          RAISE WARNING 'Error inserting power match for user % job %: %', p_user_id, new_matches.job_id, SQLERRM;
      END;
    END LOOP;
  END IF; -- End check for eligible_jobs_count > 0

  -- 4. Return result
  result := json_build_object(
      'status', 'success',
      'message', CASE 
                   WHEN match_count > 0 THEN 'Power match generation triggered successfully.' 
                   ELSE 'Power match generation triggered. No new eligible jobs found.' 
                 END,
      'new_matches_found', match_count
    );
  RETURN result;

END;
$$;

COMMENT ON FUNCTION trigger_user_power_match(UUID) IS 'Manually triggers power match generation for a specific Pro user, finds eligible jobs, inserts them, and returns a status JSON.';

COMMIT; 