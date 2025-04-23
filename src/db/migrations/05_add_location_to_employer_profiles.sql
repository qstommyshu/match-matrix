-- Add missing columns to employer_profiles table

-- Add location column if it doesn't exist
DO $$
BEGIN
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

-- Add benefits column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'employer_profiles' 
        AND column_name = 'benefits'
    ) THEN
        ALTER TABLE public.employer_profiles ADD COLUMN benefits TEXT[];
    END IF;
END
$$;

-- Add profile_completeness column if it doesn't exist
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