-- Migration: Add calculate_pro_match_score function
BEGIN;

CREATE OR REPLACE FUNCTION calculate_pro_match_score(p_user_id uuid, p_job_id uuid)
RETURNS integer AS $$
DECLARE
    job_required_skills text[];
    user_assessment_skill_names text[];
    matching_skills_count integer := 0;
    total_required_skills integer := 0;
    score integer := 0;
BEGIN
    -- 1. Fetch required skills for the job
    SELECT required_skills
    INTO job_required_skills
    FROM jobs
    WHERE id = p_job_id;

    -- 2. Fetch user's verified assessment skill names
    SELECT array_agg(s.name)
    INTO user_assessment_skill_names
    FROM assessment_skills assess_s
    JOIN skills s ON assess_s.skill_id = s.id
    WHERE assess_s.user_id = p_user_id
      -- Assuming assessment_score > 0 means verified, adjust if needed
      AND assess_s.assessment_score > 0 
      AND assess_s.verified_at IS NOT NULL; -- Ensure it's actually verified

    -- 3. Normalize NULL arrays to empty arrays
    IF job_required_skills IS NULL THEN
        job_required_skills := '{}';
    END IF;
    IF user_assessment_skill_names IS NULL THEN
        user_assessment_skill_names := '{}';
    END IF;

    -- 4. Safely compute total_required_skills
    total_required_skills := COALESCE(array_length(job_required_skills, 1), 0);

    -- 5. If no required skills, treat as full match
    IF total_required_skills = 0 THEN
        RETURN 100;
    END IF;

    -- 6. Count matching skills
    FOR i IN 1..total_required_skills LOOP
        IF job_required_skills[i] = ANY(user_assessment_skill_names) THEN
            matching_skills_count := matching_skills_count + 1;
        END IF;
    END LOOP;

    -- 7. Compute percentage score
    score := floor((matching_skills_count::float / total_required_skills::float) * 100);

    RETURN score;
END;
$$ LANGUAGE plpgsql STABLE; -- Use STABLE as it only reads data

COMMENT ON FUNCTION calculate_pro_match_score(uuid, uuid) IS 
'Calculates job-to-user match percentage based *only* on verified assessment skills. Used for Pro users.';

COMMIT; 