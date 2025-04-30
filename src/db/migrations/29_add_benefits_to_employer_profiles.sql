-- Add benefits column to employer_profiles
ALTER TABLE public.employer_profiles
ADD COLUMN benefits TEXT[] NULL;

-- Optional: Add a comment describing the column
COMMENT ON COLUMN public.employer_profiles.benefits IS 'List of company benefits offered.';

-- Note: Existing RLS policies should allow owners to update this column. 