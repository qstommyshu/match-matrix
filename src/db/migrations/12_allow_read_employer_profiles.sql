-- Enable RLS for employer_profiles if not already enabled (idempotent)
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts (optional, but good practice)
-- DROP POLICY IF EXISTS "Allow authenticated users to read employer profiles" ON public.employer_profiles;

-- Create policy to allow any authenticated user to read employer profiles
CREATE POLICY "Allow authenticated users to read employer profiles"
    ON public.employer_profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Ensure owners can still manage their own profiles (redundant if using the above broad policy, but explicit)
-- Re-create or ensure owner policies exist if needed, e.g.:
-- CREATE POLICY "Users can view their own employer profile" ON public.employer_profiles FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Users can update their own employer profile" ON public.employer_profiles FOR UPDATE USING (auth.uid() = id);

-- Note: The initial migration already created policies for owners to view, insert, and update their own profiles.
-- The new policy grants read access to all authenticated users, which includes owners.
-- We don't need to explicitly re-create owner policies unless we wanted finer-grained control
-- or if the existing policies were somehow dropped. 