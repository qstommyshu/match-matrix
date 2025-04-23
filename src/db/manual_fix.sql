-- Fix for employer_profiles table to add profile_completeness
DO $$
BEGIN
    -- Check for profile_completeness column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'employer_profiles' 
        AND column_name = 'profile_completeness'
    ) THEN
        ALTER TABLE public.employer_profiles ADD COLUMN profile_completeness NUMERIC DEFAULT 0;
        RAISE NOTICE 'Added profile_completeness column to employer_profiles table';
    ELSE
        RAISE NOTICE 'profile_completeness column already exists in employer_profiles table';
    END IF;
    
    -- Check for benefits column 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'employer_profiles' 
        AND column_name = 'benefits'
    ) THEN
        ALTER TABLE public.employer_profiles ADD COLUMN benefits TEXT[];
        RAISE NOTICE 'Added benefits column to employer_profiles table';
    ELSE
        RAISE NOTICE 'benefits column already exists in employer_profiles table';
    END IF;
    
    -- Check for location column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'employer_profiles' 
        AND column_name = 'location'
    ) THEN
        ALTER TABLE public.employer_profiles ADD COLUMN location TEXT;
        RAISE NOTICE 'Added location column to employer_profiles table';
    ELSE
        RAISE NOTICE 'location column already exists in employer_profiles table';
    END IF;
END
$$; 