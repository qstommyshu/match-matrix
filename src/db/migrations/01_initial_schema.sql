-- Create schema for profiles
CREATE SCHEMA IF NOT EXISTS public;

-- Create user types enum
CREATE TYPE user_type AS ENUM ('job_seeker', 'employer');

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  type user_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Job seeker profiles
CREATE TABLE job_seeker_profiles (
  id UUID REFERENCES profiles(id) PRIMARY KEY,
  headline TEXT,
  bio TEXT,
  location TEXT,
  years_of_experience INTEGER,
  education TEXT,
  resume_url TEXT,
  desired_role TEXT,
  open_to TEXT,
  salary_expectation TEXT,
  profile_completeness NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Employer profiles
CREATE TABLE employer_profiles (
  id UUID REFERENCES profiles(id) PRIMARY KEY,
  company_name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  website TEXT,
  logo_url TEXT,
  company_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location TEXT,
  benefits TEXT[],
  profile_completeness NUMERIC DEFAULT 0
);

-- Skills table
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User skills
CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  remote BOOLEAN DEFAULT FALSE,
  job_type TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  experience_level TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Job skills
CREATE TABLE job_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  importance_level INTEGER CHECK (importance_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, skill_id)
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- Create RLS policies
-- Profiles: Allow users to see their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_policy ON profiles 
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow users to insert their own profile
CREATE POLICY profiles_insert_policy ON profiles 
  FOR INSERT WITH CHECK (id = auth.uid());

-- Job seeker profiles: Allow users to see their own profile
ALTER TABLE job_seeker_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY job_seeker_profiles_policy ON job_seeker_profiles 
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Employer profiles: Allow users to see their own profile
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY employer_profiles_policy ON employer_profiles 
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Skills: Allow everyone to view skills
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY skills_read_policy ON skills 
  FOR SELECT USING (true);

-- User skills: Allow users to manage their own skills
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_skills_policy ON user_skills
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Jobs: Allow everyone to view jobs, but only employers can create and manage them
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY jobs_read_policy ON jobs
  FOR SELECT USING (true);
CREATE POLICY jobs_write_policy ON jobs
  USING (employer_id = auth.uid())
  WITH CHECK (employer_id = auth.uid());

-- Job skills: Allow everyone to view job skills, but only job owners can manage them
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY job_skills_read_policy ON job_skills
  FOR SELECT USING (true);
CREATE POLICY job_skills_write_policy ON job_skills
  USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_skills.job_id AND jobs.employer_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_skills.job_id AND jobs.employer_id = auth.uid()));

-- Applications: Allow job seekers to create applications and view their own
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY applications_user_policy ON applications
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow employers to view applications for their jobs
CREATE POLICY applications_employer_policy ON applications
  FOR SELECT USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid()));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE
ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_seeker_profiles_updated_at BEFORE UPDATE
ON job_seeker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employer_profiles_updated_at BEFORE UPDATE
ON employer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE
ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE
ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 