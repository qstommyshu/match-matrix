-- Migration for Manual Employer Power Match Trigger

BEGIN;

-- Function to manually trigger employer power match generation for a single job
CREATE OR REPLACE FUNCTION trigger_employer_power_match(p_job_id UUID)
RETURNS JSON -- Return status, message, and count
LANGUAGE plpgsql
AS $$
DECLARE
  job_info RECORD;
  job_seeker RECORD;
  match_count INT := 0;
  existing_match BOOLEAN;
  existing_application BOOLEAN;
  match_score NUMERIC;
  potential_match_count INT := 0;
  result JSON;
BEGIN
  -- 1. Check if job exists and is open
  SELECT id, employer_id, title, status
  INTO job_info
  FROM public.jobs
  WHERE id = p_job_id;

  IF NOT FOUND OR job_info.status != 'open' THEN
    result := json_build_object(
      'status', 'error',
      'message', 'Job not found or not currently active.',
      'new_matches_found', 0
    );
    RETURN result;
  END IF;

  -- 2. Fetch all active job seekers and calculate matches
  FOR job_seeker IN
    SELECT id 
    FROM public.job_seeker_profiles
  LOOP
    -- Avoid matching employer with themselves (if they have a job seeker profile)
    IF job_seeker.id = job_info.employer_id THEN
      CONTINUE;
    END IF;
    
    -- Check if user has already applied to this job
    SELECT EXISTS(
      SELECT 1 
      FROM public.applications 
      WHERE job_id = p_job_id AND user_id = job_seeker.id
    ) INTO existing_application;
    
    IF existing_application THEN
      CONTINUE;
    END IF;
    
    -- Check if this match already exists
    SELECT EXISTS(
      SELECT 1 
      FROM public.employer_power_matches 
      WHERE job_id = p_job_id AND user_id = job_seeker.id
    ) INTO existing_match;
    
    IF existing_match THEN
      CONTINUE;
    END IF;
    
    -- Calculate match score using existing function
    SELECT public.calculate_match_score(job_seeker.id, p_job_id) INTO match_score;
    
    -- Only consider scores above 70%
    IF match_score >= 70 THEN
      potential_match_count := potential_match_count + 1;
      
      -- Insert into employer_power_matches
      BEGIN
        INSERT INTO public.employer_power_matches (
          employer_id, 
          job_id, 
          user_id, 
          match_score
        )
        VALUES (
          job_info.employer_id, 
          p_job_id, 
          job_seeker.id, 
          match_score / 100  -- Convert to decimal (0-1 range)
        );
        match_count := match_count + 1;
      EXCEPTION
        WHEN unique_violation THEN
          RAISE NOTICE 'Employer power match for job % user % already exists, skipping.', p_job_id, job_seeker.id;
        WHEN others THEN
          RAISE WARNING 'Error inserting employer power match for job % user %: %', p_job_id, job_seeker.id, SQLERRM;
      END;
    END IF;
  END LOOP;

  -- 3. Return result
  result := json_build_object(
    'status', 'success',
    'message', CASE 
                WHEN match_count > 0 THEN 'Employer power match generation successful.' 
                ELSE 'No new matches found that meet criteria.'
              END,
    'job_title', job_info.title,
    'potential_matches_evaluated', potential_match_count,
    'new_matches_found', match_count
  );
  RETURN result;

END;
$$;

COMMENT ON FUNCTION trigger_employer_power_match(UUID) IS 'Manually triggers employer power match generation for a specific job, finds eligible candidates, and returns a status JSON.';

COMMIT; 