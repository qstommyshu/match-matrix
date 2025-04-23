-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    type TEXT NOT NULL CHECK (type IN ('job_seeker', 'employer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create job_seeker_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.job_seeker_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    headline TEXT,
    bio TEXT,
    location TEXT,
    years_of_experience INTEGER,
    education TEXT,
    resume_url TEXT,
    desired_role TEXT,
    open_to TEXT, -- e.g., "Remote, Hybrid, On-site"
    salary_expectation TEXT,
    profile_completeness INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create employer_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.employer_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    industry TEXT,
    company_size TEXT,
    website TEXT,
    logo_url TEXT,
    company_description TEXT,
    location TEXT,
    benefits TEXT[], -- Array of benefits
    profile_completeness INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create work_experiences table for job seekers
CREATE TABLE IF NOT EXISTS public.work_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current_role BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create education_history table for job seekers
CREATE TABLE IF NOT EXISTS public.education_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    degree TEXT NOT NULL,
    institution TEXT NOT NULL,
    location TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create skills table and user_skills relationship
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency_level INTEGER DEFAULT 3, -- 1-5 scale
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id, skill_id)
);

-- Create team_composition table for employers
CREATE TABLE IF NOT EXISTS public.team_composition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    percentage INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(employer_id, department)
);

-- Create RLS policies
-- Only allow authenticated users to access their own profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" 
    ON public.profiles 
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" 
    ON public.profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id);

-- Only allow authenticated users to access their own job_seeker_profiles
ALTER TABLE public.job_seeker_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own job seeker profile" 
    ON public.job_seeker_profiles 
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can create their own job seeker profile" 
    ON public.job_seeker_profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own job seeker profile" 
    ON public.job_seeker_profiles 
    FOR UPDATE 
    USING (auth.uid() = id);

-- Only allow authenticated users to access their own employer_profiles
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own employer profile" 
    ON public.employer_profiles 
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can create their own employer profile" 
    ON public.employer_profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own employer profile" 
    ON public.employer_profiles 
    FOR UPDATE 
    USING (auth.uid() = id);

-- Apply RLS to work_experiences table
ALTER TABLE public.work_experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own work experiences" 
    ON public.work_experiences 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own work experiences" 
    ON public.work_experiences 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work experiences" 
    ON public.work_experiences 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work experiences" 
    ON public.work_experiences 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Apply RLS to education_history table
ALTER TABLE public.education_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own education history" 
    ON public.education_history 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own education history" 
    ON public.education_history 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own education history" 
    ON public.education_history 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own education history" 
    ON public.education_history 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Apply RLS to user_skills table
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own skills" 
    ON public.user_skills 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own skills" 
    ON public.user_skills 
    FOR ALL 
    USING (auth.uid() = user_id);

-- Apply RLS to team_composition table
ALTER TABLE public.team_composition ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employers can view their own team composition" 
    ON public.team_composition 
    FOR SELECT 
    USING (auth.uid() = employer_id);

CREATE POLICY "Employers can manage their own team composition" 
    ON public.team_composition 
    FOR ALL 
    USING (auth.uid() = employer_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_seeker_profiles_updated_at
BEFORE UPDATE ON public.job_seeker_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employer_profiles_updated_at
BEFORE UPDATE ON public.employer_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_experiences_updated_at
BEFORE UPDATE ON public.work_experiences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_history_updated_at
BEFORE UPDATE ON public.education_history
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_composition_updated_at
BEFORE UPDATE ON public.team_composition
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 