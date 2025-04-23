-- Comprehensive fix for all missing columns in both profile tables

-- Fix for employer_profiles table
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

-- Fix for job_seeker_profiles table
DO $$
BEGIN
    -- Check for desired_role column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'job_seeker_profiles' 
        AND column_name = 'desired_role'
    ) THEN
        ALTER TABLE public.job_seeker_profiles ADD COLUMN desired_role TEXT;
        RAISE NOTICE 'Added desired_role column to job_seeker_profiles table';
    ELSE
        RAISE NOTICE 'desired_role column already exists in job_seeker_profiles table';
    END IF;
    
    -- Check for open_to column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'job_seeker_profiles' 
        AND column_name = 'open_to'
    ) THEN
        ALTER TABLE public.job_seeker_profiles ADD COLUMN open_to TEXT;
        RAISE NOTICE 'Added open_to column to job_seeker_profiles table';
    ELSE
        RAISE NOTICE 'open_to column already exists in job_seeker_profiles table';
    END IF;
    
    -- Check for salary_expectation column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'job_seeker_profiles' 
        AND column_name = 'salary_expectation'
    ) THEN
        ALTER TABLE public.job_seeker_profiles ADD COLUMN salary_expectation TEXT;
        RAISE NOTICE 'Added salary_expectation column to job_seeker_profiles table';
    ELSE
        RAISE NOTICE 'salary_expectation column already exists in job_seeker_profiles table';
    END IF;
    
    -- Check for profile_completeness column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'job_seeker_profiles' 
        AND column_name = 'profile_completeness'
    ) THEN
        ALTER TABLE public.job_seeker_profiles ADD COLUMN profile_completeness NUMERIC DEFAULT 0;
        RAISE NOTICE 'Added profile_completeness column to job_seeker_profiles table';
    ELSE
        RAISE NOTICE 'profile_completeness column already exists in job_seeker_profiles table';
    END IF;
END
$$; 