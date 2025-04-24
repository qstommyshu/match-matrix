-- Add required_skills column to the jobs table
ALTER TABLE jobs
ADD COLUMN required_skills text[] DEFAULT '{}';

-- Update RLS policies if necessary (assuming existing policies are sufficient for now)
-- Example: Allow authenticated users to read jobs including the new column
-- DROP POLICY IF EXISTS "Allow authenticated users read access" ON jobs;
-- CREATE POLICY "Allow authenticated users read access" ON jobs
-- FOR SELECT USING (auth.role() = 'authenticated');

-- Note: Review existing RLS policies on the 'jobs' table to ensure they correctly
-- handle the new 'required_skills' column based on your application's access control needs.
-- The default '{}' ensures existing rows have a valid value. 