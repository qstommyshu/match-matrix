-- Add the missing columns to job_seeker_profiles table that are marked as TODOs in database.ts

-- Add desired_role column if it doesn't exist
DO $$
BEGIN
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
END
$$;

-- Add open_to column if it doesn't exist
DO $$
BEGIN
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
END
$$;

-- Add salary_expectation column if it doesn't exist
DO $$
BEGIN
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
END
$$; 