import { supabase } from "./supabase";

// Types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  type: "job_seeker" | "employer";
  created_at: string;
  updated_at: string;
}

export interface JobSeekerProfile {
  id: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  years_of_experience: number | null;
  education: string | null;
  resume_url: string | null;
  desired_role: string | null;
  open_to: string | null;
  salary_expectation: string | null;
  profile_completeness: number | null;
  created_at: string;
  updated_at: string;
}

export interface EmployerProfile {
  id: string;
  company_name: string;
  industry: string | null;
  company_size: string | null;
  website: string | null;
  logo_url: string | null;
  company_description: string | null;
  location: string | null;
  benefits: string[] | null;
  profile_completeness: number | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string | null;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency_level: number;
  created_at: string;
  skill?: Skill;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  location: string | null;
  remote: boolean;
  job_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  experience_level: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  employer?: Profile;
  skills?: JobSkill[];
}

export interface JobSkill {
  id: string;
  job_id: string;
  skill_id: string;
  importance_level: number;
  created_at: string;
  skill?: Skill;
}

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  cover_letter: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  job?: Job;
  user?: Profile;
}

// Profile functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return { profile: data as Profile | null, error };
};

export const createProfile = async (profile: Partial<Profile>) => {
  const { data, error } = await supabase
    .from("profiles")
    .insert(profile)
    .select()
    .single();

  return { profile: data as Profile | null, error };
};

export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>
) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  return { profile: data as Profile | null, error };
};

// Job seeker profile functions
export const getJobSeekerProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("job_seeker_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return { profile: data as JobSeekerProfile | null, error };
};

export const createJobSeekerProfile = async (
  profile: Partial<JobSeekerProfile>
) => {
  const { data, error } = await supabase
    .from("job_seeker_profiles")
    .insert(profile)
    .select()
    .single();

  return { profile: data as JobSeekerProfile | null, error };
};

export const updateJobSeekerProfile = async (
  userId: string,
  updates: Partial<JobSeekerProfile>
) => {
  const { data, error } = await supabase
    .from("job_seeker_profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  return { profile: data as JobSeekerProfile | null, error };
};

// Employer profile functions
export const getEmployerProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("employer_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return { profile: data as EmployerProfile | null, error };
};

export const createEmployerProfile = async (
  profile: Partial<EmployerProfile>
) => {
  const { data, error } = await supabase
    .from("employer_profiles")
    .insert(profile)
    .select()
    .single();

  return { profile: data as EmployerProfile | null, error };
};

export const updateEmployerProfile = async (
  userId: string,
  updates: Partial<EmployerProfile>
) => {
  const { data, error } = await supabase
    .from("employer_profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  return { profile: data as EmployerProfile | null, error };
};

// Skills functions
export const getSkills = async (search?: string, category?: string) => {
  let query = supabase.from("skills").select("*");

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query.order("name");

  return { skills: data as Skill[] | null, error };
};

export const getUserSkills = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_skills")
    .select(
      `
      *,
      skill:skills(*)
    `
    )
    .eq("user_id", userId);

  return { userSkills: data as UserSkill[] | null, error };
};

export const addUserSkill = async (
  userSkill: Omit<UserSkill, "id" | "created_at" | "skill">
) => {
  const { data, error } = await supabase
    .from("user_skills")
    .insert(userSkill)
    .select()
    .single();

  return { userSkill: data as UserSkill | null, error };
};

export const updateUserSkill = async (
  id: string,
  updates: Pick<UserSkill, "proficiency_level">
) => {
  const { data, error } = await supabase
    .from("user_skills")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  return { userSkill: data as UserSkill | null, error };
};

export const removeUserSkill = async (id: string) => {
  const { error } = await supabase.from("user_skills").delete().eq("id", id);

  return { error };
};

// Jobs functions
export const getJobs = async (filters?: {
  search?: string;
  location?: string;
  remote?: boolean;
  skills?: string[];
  employerId?: string;
}) => {
  let query = supabase.from("jobs").select(`
      *,
      employer:profiles(*),
      skills:job_skills(
        *,
        skill:skills(*)
      )
    `);

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  if (filters?.location) {
    query = query.ilike("location", `%${filters.location}%`);
  }

  if (filters?.remote !== undefined) {
    query = query.eq("remote", filters.remote);
  }

  if (filters?.employerId) {
    query = query.eq("employer_id", filters.employerId);
  }

  const { data, error } = await query
    .eq("status", "open")
    .order("created_at", { ascending: false });

  let filteredJobs = data as Job[] | null;

  // Filter by skills (client-side filtering since it's a more complex query)
  if (filteredJobs && filters?.skills && filters.skills.length > 0) {
    filteredJobs = filteredJobs.filter((job) => {
      if (!job.skills) return false;
      return filters.skills.some((skillId) =>
        job.skills!.some((jobSkill) => jobSkill.skill_id === skillId)
      );
    });
  }

  return { jobs: filteredJobs, error };
};

export const getJob = async (jobId: string) => {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      employer:profiles(*),
      skills:job_skills(
        *,
        skill:skills(*)
      )
    `
    )
    .eq("id", jobId)
    .single();

  return { job: data as Job | null, error };
};

export const createJob = async (
  job: Omit<Job, "id" | "created_at" | "updated_at" | "employer" | "skills">
) => {
  const { data, error } = await supabase
    .from("jobs")
    .insert(job)
    .select()
    .single();

  return { job: data as Job | null, error };
};

export const updateJob = async (
  jobId: string,
  updates: Partial<
    Omit<
      Job,
      "id" | "employer_id" | "created_at" | "updated_at" | "employer" | "skills"
    >
  >
) => {
  const { data, error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", jobId)
    .select()
    .single();

  return { job: data as Job | null, error };
};

export const addJobSkill = async (
  jobSkill: Omit<JobSkill, "id" | "created_at" | "skill">
) => {
  const { data, error } = await supabase
    .from("job_skills")
    .insert(jobSkill)
    .select()
    .single();

  return { jobSkill: data as JobSkill | null, error };
};

export const removeJobSkill = async (id: string) => {
  const { error } = await supabase.from("job_skills").delete().eq("id", id);

  return { error };
};

// Applications functions
export const getJobApplications = async (jobId: string) => {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      user:profiles(*),
      job:jobs(*)
    `
    )
    .eq("job_id", jobId);

  return { applications: data as Application[] | null, error };
};

export const getUserApplications = async (userId: string) => {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      job:jobs(
        *,
        employer:profiles(*)
      )
    `
    )
    .eq("user_id", userId);

  return { applications: data as Application[] | null, error };
};

export const createApplication = async (
  application: Omit<
    Application,
    "id" | "created_at" | "updated_at" | "job" | "user"
  >
) => {
  const { data, error } = await supabase
    .from("applications")
    .insert(application)
    .select()
    .single();

  return { application: data as Application | null, error };
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: string
) => {
  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .select()
    .single();

  return { application: data as Application | null, error };
};
