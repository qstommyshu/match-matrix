-- Create experiences table
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('work', 'education')),
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add updated_at trigger
CREATE TRIGGER set_experiences_updated_at
BEFORE UPDATE ON public.experiences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS experiences_user_id_idx ON public.experiences(user_id);
CREATE INDEX IF NOT EXISTS experiences_type_idx ON public.experiences(type);

-- Enable RLS on experiences table
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own experiences
CREATE POLICY "Users can manage their own experiences"
ON public.experiences
FOR ALL USING (user_id = auth.uid());

-- Policy for public viewing of experiences
CREATE POLICY "Experiences are publicly viewable"
ON public.experiences
FOR SELECT USING (true);

-- Update types in job_seeker_profiles to reflect experience is now stored separately
COMMENT ON TABLE public.experiences IS 'Stores user experiences including both work and education history'; 