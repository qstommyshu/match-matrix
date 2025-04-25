-- Add the ai_summary column to the applications table
ALTER TABLE public.applications
ADD COLUMN ai_summary TEXT NULL;

-- Add a comment explaining the column's purpose
COMMENT ON COLUMN public.applications.ai_summary IS 'Stores the AI-generated summary of the applicant''s profile for this specific application.';

-- RLS Policy Update:
-- We need to ensure the relevant employer can UPDATE this new column
-- and that appropriate roles can SELECT it.

-- 1. Drop the existing UPDATE policy (if any) or create a specific one.
--    Assuming a basic policy exists allowing users to update their own applications (which might not be right for status updates by employers)
--    Let's create a policy allowing the JOB OWNER (employer) to update specific fields like status and ai_summary.

-- Drop existing general update policy if it clashes (adjust name if different)
-- DROP POLICY IF EXISTS "Users can update their own applications" ON public.applications;

-- Policy allowing the employer who owns the job to update status and ai_summary
CREATE POLICY "Allow job owner to update application status and summary" ON public.applications
FOR UPDATE
USING (
  auth.uid() = (
    SELECT employer_id FROM public.jobs WHERE id = applications.job_id
  )
)
WITH CHECK (
  auth.uid() = (
    SELECT employer_id FROM public.jobs WHERE id = applications.job_id
  )
);

-- 2. Ensure the SELECT policy allows reading the ai_summary column.
--    The existing SELECT policy likely allows the applicant and the job owner to read.
--    If we need a specific policy or modification:

-- Example: Assuming a policy exists named "Allow relevant users to read applications"
-- If it needs modification to explicitly include ai_summary (usually not needed if SELECT * is used),
-- or if a new policy is needed:

-- CREATE POLICY "Allow relevant users to read applications with summary" ON public.applications
-- FOR SELECT
-- USING (
--   auth.uid() = user_id OR
--   auth.uid() = ( SELECT employer_id FROM public.jobs WHERE id = applications.job_id )
-- );

-- Note: Check existing RLS policies for 'applications' table and adjust/combine as needed.
-- The key is the employer of the associated job needs SELECT and UPDATE permissions for ai_summary. 