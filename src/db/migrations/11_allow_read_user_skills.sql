-- Grant read access to user skills for any authenticated user.
-- This allows viewing skills on other users' profiles.
-- The existing 'user_skills_policy' continues to restrict INSERT/UPDATE/DELETE to the owner.

CREATE POLICY "Allow authenticated read access on user_skills"
ON public.user_skills
FOR SELECT
TO authenticated
USING (true); 