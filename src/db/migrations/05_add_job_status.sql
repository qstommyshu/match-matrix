-- Add status column to jobs table
ALTER TABLE jobs
ADD COLUMN status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed'));

-- Optional: Add an index if you frequently query by status
-- CREATE INDEX idx_jobs_status ON jobs(status); 