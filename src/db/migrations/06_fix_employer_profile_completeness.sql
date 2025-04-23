-- Ensure profile_completeness column exists in employer_profiles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'employer_profiles' 
        AND column_name = 'profile_completeness'
    ) THEN
        ALTER TABLE public.employer_profiles ADD COLUMN profile_completeness NUMERIC DEFAULT 0;
    END IF;
END
$$;

-- Verify that all required columns exist
DO $$
BEGIN
    -- Check for benefits column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'employer_profiles' 
        AND column_name = 'benefits'
    ) THEN
        ALTER TABLE public.employer_profiles ADD COLUMN benefits TEXT[];
    END IF;

    -- Check for location column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'employer_profiles' 
        AND column_name = 'location'
    ) THEN
        ALTER TABLE public.employer_profiles ADD COLUMN location TEXT;
    END IF;
END
$$; 