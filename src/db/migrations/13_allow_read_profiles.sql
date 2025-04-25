-- Enable RLS for profiles if not already enabled (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts (optional, but good practice)
-- DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.profiles;

-- Create policy to allow any authenticated user to read any profile
-- This is needed so related data (like employer profiles in job listings) can be fetched.
CREATE POLICY "Allow authenticated users to read profiles"
    ON public.profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Note: The existing policies allowing users to manage their own profiles
-- ("Users can view their own profile", "Users can create their own profile", 
-- "Users can update their own profile") are still necessary for write operations
-- and potentially for more specific read scenarios if this broad read policy were removed.
-- This new policy provides the general read access needed for relationships. 