-- Add application stages as an enum type
CREATE TYPE application_stage AS ENUM (
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn'
);

-- Add the stage column to the applications table with 'Applied' as default
ALTER TABLE public.applications
ADD COLUMN stage application_stage NOT NULL DEFAULT 'Applied';

-- Add a comment explaining the column's purpose
COMMENT ON COLUMN public.applications.stage IS 'Tracks the current stage of the application in the hiring process.';

-- Update existing applications to set their stage based on status
-- If status is 'pending', set stage to 'Applied'
-- If status is 'rejected', set stage to 'Rejected'
-- All others stay as 'Applied' (default)
UPDATE public.applications
SET stage = CASE
  WHEN status = 'rejected' THEN 'Rejected'::application_stage
  ELSE 'Applied'::application_stage
END;

-- RLS Policy Updates for application stage

-- 1. Create a policy to allow employers to update the stage column for applications to their jobs
CREATE POLICY "Employers can update application stage" ON public.applications
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

-- 2. Ensure the employers can read the stage column for applications to their jobs
-- This is likely already covered by the existing policy:
-- "applications_employer_policy" created in the initial schema
-- That policy allows employers to SELECT applications for their jobs

-- Helpful function to batch update application stages (useful for the batch actions feature)
CREATE OR REPLACE FUNCTION batch_update_application_stage(
  p_application_ids uuid[],
  p_stage application_stage,
  p_user_id uuid
)
RETURNS TABLE(
  application_id uuid,
  success boolean,
  message text
) AS $$
DECLARE
  v_app_id uuid;
  v_employer_id uuid;
  v_job_id uuid;
BEGIN
  -- For each application ID in the array
  FOREACH v_app_id IN ARRAY p_application_ids
  LOOP
    -- Get the job_id for this application
    SELECT job_id INTO v_job_id
    FROM public.applications
    WHERE id = v_app_id;
    
    -- Get the employer_id for this job
    SELECT employer_id INTO v_employer_id
    FROM public.jobs
    WHERE id = v_job_id;
    
    -- Check if the user is the employer of this job
    IF v_employer_id = p_user_id THEN
      -- Update the application stage
      UPDATE public.applications
      SET 
        stage = p_stage,
        updated_at = NOW()
      WHERE id = v_app_id;
      
      application_id := v_app_id;
      success := TRUE;
      message := 'Stage updated successfully';
      RETURN NEXT;
    ELSE
      -- User is not authorized to update this application
      application_id := v_app_id;
      success := FALSE;
      message := 'Not authorized to update this application';
      RETURN NEXT;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql; 