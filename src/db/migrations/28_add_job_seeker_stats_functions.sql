-- Function to get the total number of applications sent by a job seeker
CREATE OR REPLACE FUNCTION get_job_seeker_applications_count(p_user_id UUID)
RETURNS INT AS $$
DECLARE
    total_applications INT;
BEGIN
    SELECT COUNT(*)
    INTO total_applications
    FROM applications
    WHERE user_id = p_user_id;

    RETURN COALESCE(total_applications, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_job_seeker_applications_count(UUID) TO authenticated;

-- Function to get the total number of invitations received by a job seeker
CREATE OR REPLACE FUNCTION get_job_seeker_invitations_count(p_user_id UUID)
RETURNS INT AS $$
DECLARE
    total_invitations INT;
BEGIN
    SELECT COUNT(*)
    INTO total_invitations
    FROM candidate_invitations
    WHERE user_id = p_user_id;

    RETURN COALESCE(total_invitations, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_job_seeker_invitations_count(UUID) TO authenticated;

-- Function to get the total number of offers received by a job seeker
CREATE OR REPLACE FUNCTION get_job_seeker_offers_count(p_user_id UUID)
RETURNS INT AS $$
DECLARE
    total_offers INT;
BEGIN
    SELECT COUNT(*)
    INTO total_offers
    FROM applications
    WHERE user_id = p_user_id AND stage = 'Offer';

    RETURN COALESCE(total_offers, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_job_seeker_offers_count(UUID) TO authenticated; 