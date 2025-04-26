CREATE OR REPLACE FUNCTION trigger_user_power_match(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _eligible_jobs RECORD;
  _inserted_count INT := 0;
  _job RECORD;
  _match_score NUMERIC;
  _result JSONB;
BEGIN
  -- Verify the calling user is the target user
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'User ID mismatch or not authenticated.';
  END IF;

  -- Verify the user is a pro user
  IF NOT EXISTS (SELECT 1 FROM job_seeker_profiles WHERE id = p_user_id AND is_pro = TRUE) THEN
    RAISE EXCEPTION 'User is not a pro member.';
  END IF;

  -- Find eligible jobs (using the existing function)
  -- Assuming find_eligible_power_match_jobs returns job_id and calculated_match_score
  -- Limit to 5 potential matches for a manual trigger
  FOR _job IN
    SELECT job_id, calculated_match_score
    FROM find_eligible_power_match_jobs(p_user_id, 5) -- Use limit 5 for manual trigger
  LOOP
    BEGIN
      -- Insert into power_matches, handle conflicts (job already matched)
      INSERT INTO power_matches (user_id, job_id, match_score, created_at)
      VALUES (p_user_id, _job.job_id, _job.calculated_match_score, timezone('utc', now()))
      ON CONFLICT (user_id, job_id) DO NOTHING;

      -- Check if insert happened
      IF FOUND THEN
        _inserted_count := _inserted_count + 1;
      END IF;

    EXCEPTION
      WHEN others THEN
        -- Log error or handle as needed, continue with next job
        RAISE WARNING 'Error inserting power match for job %: %', _job.job_id, SQLERRM;
    END;
  END LOOP;

  _result := jsonb_build_object(
    'status', 'success',
    'message', 'Power match generation triggered.',
    'new_matches_found', _inserted_count
  );

  RETURN _result;

EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in trigger_user_power_match for user %: %', p_user_id, SQLERRM;
    _result := jsonb_build_object(
      'status', 'error',
      'message', 'Failed to trigger power match generation: ' || SQLERRM,
      'new_matches_found', 0
    );
    RETURN _result;
END;
$$;

-- Grant execute permission to the authenticated role
GRANT EXECUTE ON FUNCTION trigger_user_power_match(UUID) TO authenticated; 