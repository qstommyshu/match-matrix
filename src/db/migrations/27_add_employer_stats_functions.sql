-- Function to get the total number of unique applicants for all jobs posted by an employer
CREATE OR REPLACE FUNCTION get_employer_total_applicants(p_employer_id UUID)
RETURNS INT AS $$
DECLARE
    total_applicants INT;
BEGIN
    SELECT COUNT(DISTINCT a.user_id)
    INTO total_applicants
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE j.employer_id = p_employer_id;

    RETURN COALESCE(total_applicants, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_employer_total_applicants(UUID) TO authenticated;

-- Function to get the total number of active job postings (status='open') for an employer
CREATE OR REPLACE FUNCTION get_employer_active_jobs_count(p_employer_id UUID)
RETURNS INT AS $$
DECLARE
    active_jobs_count INT;
BEGIN
    SELECT COUNT(*)
    INTO active_jobs_count
    FROM jobs
    WHERE employer_id = p_employer_id AND status = 'open';

    RETURN COALESCE(active_jobs_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_employer_active_jobs_count(UUID) TO authenticated;

-- Function to get the total number of offers extended for all jobs posted by an employer
CREATE OR REPLACE FUNCTION get_employer_total_offers_extended(p_employer_id UUID)
RETURNS INT AS $$
DECLARE
    total_offers INT;
BEGIN
    SELECT COUNT(*)
    INTO total_offers
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE j.employer_id = p_employer_id AND a.stage = 'Offer';

    RETURN COALESCE(total_offers, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_employer_total_offers_extended(UUID) TO authenticated; 