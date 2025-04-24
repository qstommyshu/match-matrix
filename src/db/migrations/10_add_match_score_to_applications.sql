-- Function to calculate match score based on job requirements and user skills
CREATE OR REPLACE FUNCTION calculate_match_score(p_user_id uuid, p_job_id uuid)
RETURNS integer AS $$
DECLARE
    job_required_skills text[];
    user_skill_names text[];
    matching_skills_count integer := 0;
    total_required_skills integer := 0;
    score integer := 0;
BEGIN
    -- Get required skills for the job
    SELECT required_skills INTO job_required_skills
    FROM jobs
    WHERE id = p_job_id;

    -- Get the names of skills the user possesses
    SELECT array_agg(s.name) INTO user_skill_names
    FROM user_skills us
    JOIN skills s ON us.skill_id = s.id
    WHERE us.user_id = p_user_id;

    -- Handle cases where required skills or user skills might be null/empty
    IF job_required_skills IS NULL OR array_length(job_required_skills, 1) IS NULL THEN
        job_required_skills := '{}'; -- Treat as empty array
    END IF;

    IF user_skill_names IS NULL THEN
        user_skill_names := '{}'; -- Treat as empty array
    END IF;

    total_required_skills := array_length(job_required_skills, 1);

    -- If no required skills are specified for the job, consider it a 100% match.
    IF total_required_skills = 0 THEN
        RETURN 100;
    END IF;

    -- Count matching skills
    FOR i IN 1..total_required_skills LOOP
        IF job_required_skills[i] = ANY(user_skill_names) THEN
            matching_skills_count := matching_skills_count + 1;
        END IF;
    END LOOP;

    -- Calculate score as percentage
    score := floor((matching_skills_count::float / total_required_skills::float) * 100);

    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Add the match_score column to the applications table
ALTER TABLE applications
ADD COLUMN match_score integer DEFAULT 0;

-- Add RLS policy check comment
-- Note: Ensure existing RLS policies on 'applications' allow reading the new 'match_score' column.
-- Policies might need updates, e.g., for employers viewing applications. 