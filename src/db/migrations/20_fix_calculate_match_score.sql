-- Migration: Fix calculate_match_score to handle empty skill arrays
BEGIN;

-- Replace the calculate_match_score function with NULL-safe bounds
CREATE OR REPLACE FUNCTION calculate_match_score(p_user_id uuid, p_job_id uuid)
RETURNS integer AS $$
DECLARE
    job_required_skills text[];
    user_skill_names text[];
    matching_skills_count integer := 0;
    total_required_skills integer := 0;
    score integer := 0;
BEGIN
    -- 1. Fetch required skills for the job
    SELECT required_skills
    INTO job_required_skills
    FROM jobs
    WHERE id = p_job_id;

    -- 2. Fetch user’s skill names
    SELECT array_agg(s.name)
    INTO user_skill_names
    FROM user_skills us
    JOIN skills s ON us.skill_id = s.id
    WHERE us.user_id = p_user_id;

    -- 3. Normalize NULL arrays to empty arrays
    IF job_required_skills IS NULL THEN
        job_required_skills := '{}';
    END IF;
    IF user_skill_names IS NULL THEN
        user_skill_names := '{}';
    END IF;

    -- 4. Safely compute total_required_skills (never NULL)
    total_required_skills := COALESCE(array_length(job_required_skills, 1), 0);

    -- 5. If no required skills, treat as full match
    IF total_required_skills = 0 THEN
        RETURN 100;
    END IF;

    -- 6. Count matching skills
    FOR i IN 1..total_required_skills LOOP
        IF job_required_skills[i] = ANY(user_skill_names) THEN
            matching_skills_count := matching_skills_count + 1;
        END IF;
    END LOOP;

    -- 7. Compute percentage score
    score := floor((matching_skills_count::float / total_required_skills::float) * 100);

    RETURN score;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_match_score(uuid, uuid) IS
'Calculates job-to-user match percentage. Handles NULL or empty skill arrays to avoid NULL loop bounds.';

COMMIT;
