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
  required_skills: string[] | null;
  created_at: string;
  updated_at: string;
  employer?: Profile;
  employer_profile?: EmployerProfile;
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
  stage:
    | "Applied"
    | "Screening"
    | "Interview"
    | "Offer"
    | "Rejected"
    | "Withdrawn";
  match_score: number | null;
  created_at: string;
  updated_at: string;
  ai_summary?: string | null;
  job?: Job;
  user?: Profile & {
    job_seeker_profile?: JobSeekerProfile | null;
  };
}

// Experience types
export interface Experience {
  id: string;
  user_id: string;
  type: "work" | "education";
  title: string;
  organization: string;
  location: string | null;
  start_date: string; // ISO date string
  end_date: string | null; // ISO date string
  is_current: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Add type for Job with Applicant Count
export interface JobWithApplicantCount extends Job {
  applicant_count: number;
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
    employer:profiles(
      *,
      employer_profile:employer_profiles(*)
    ),
    skills:job_skills(*, skill:skills(*))
  `);

  if (filters?.search) {
    query = query.textSearch("fts", filters.search);
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

  const { data, error } = await query.order("created_at", { ascending: false });

  type JobWithNestedEmployerProfile = Omit<Job, "employer"> & {
    employer?: Profile & {
      employer_profile?: EmployerProfile | null;
    };
  };

  let filteredJobs = data as JobWithNestedEmployerProfile[] | null;

  if (filteredJobs && filters?.skills && filters.skills.length > 0) {
    filteredJobs = filteredJobs.filter((job) => {
      if (!job.skills) return false;
      return filters.skills.some((skillId) =>
        job.skills!.some((jobSkill) => jobSkill.skill_id === skillId)
      );
    });
  }

  return { jobs: filteredJobs as Job[] | null, error };
};

export const getJob = async (jobId: string) => {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      employer:profiles(*),
      skills:job_skills(*, skill:skills(*))
    `
    )
    .eq("id", jobId)
    .single();

  return { job: data as Job | null, error };
};

export const createJob = async (
  job: Omit<
    Job,
    "id" | "created_at" | "updated_at" | "employer" | "skills" | "status"
  > & { status?: string; required_skills?: string[] }
) => {
  const jobDataToInsert = {
    ...job,
    status: job.status || "open",
    required_skills: job.required_skills || [],
  };

  const { data, error } = await supabase
    .from("jobs")
    .insert(jobDataToInsert)
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
      user:profiles(
        *,
        job_seeker_profile:job_seeker_profiles(*),
        user_skills:user_skills(*, skill:skills(name)) 
      ),
      job:jobs(*)
    `
    )
    .eq("job_id", jobId)
    .order("match_score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  // Update the Application type to reflect the nested user_skills
  // We need to redefine the user part of the type
  type ApplicationWithUserSkills = Omit<Application, "user"> & {
    user?: Profile & {
      job_seeker_profile?: JobSeekerProfile | null;
      user_skills?: { skill: { name: string } }[]; // Define the nested structure
    };
  };

  if (error) {
    console.error("Error fetching job applications:", error);
    return { applications: null, error };
  }

  return {
    applications: data as ApplicationWithUserSkills[] | null,
    error: null,
  };
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
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { applications: data as Application[] | null, error };
};

export const getEmployerReceivedApplications = async (
  employerId: string,
  limit: number = 5
) => {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      created_at,
      status,
      user_id,
      match_score,
      job:jobs!inner(
        id,
        title,
        employer_id
      ),
      user:profiles( 
        id,
        full_name,
        email,
        job_seeker_profile:job_seeker_profiles(
          id,
          headline,
          years_of_experience
        )
      )
    `
    )
    .eq("job.employer_id", employerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  type ReceivedApplicationData = {
    id: string;
    created_at: string;
    status: string;
    user_id: string;
    match_score: number | null;
    job: {
      id: string;
      title: string;
      employer_id: string;
    } | null;
    user: {
      id: string;
      full_name: string | null;
      email: string;
      job_seeker_profile: {
        id: string;
        headline: string | null;
        years_of_experience: number | null;
      } | null;
    } | null;
  };

  const applicationsData = data as unknown as ReceivedApplicationData[] | null;

  return { applications: applicationsData, error };
};

export const createApplication = async (
  applicationInput: Omit<
    Application,
    "id" | "created_at" | "updated_at" | "job" | "user" | "match_score"
  >
) => {
  try {
    // 1. Calculate the match score using the DB function
    const { data: scoreData, error: scoreError } = await supabase.rpc(
      "calculate_match_score",
      {
        p_user_id: applicationInput.user_id,
        p_job_id: applicationInput.job_id,
      }
    );

    if (scoreError) {
      console.error("Error calculating match score:", scoreError);
      // Decide if we should proceed without a score or return error
      // Let's proceed but log the error, defaulting score to 0
      // throw new Error("Failed to calculate match score");
    }

    const calculatedMatchScore = typeof scoreData === "number" ? scoreData : 0;

    // 2. Prepare the application data with the calculated score
    const applicationData = {
      ...applicationInput,
      match_score: calculatedMatchScore,
    };

    // 3. Insert the application
    const { data, error } = await supabase
      .from("applications")
      .insert(applicationData)
      .select()
      .single();

    if (error) {
      console.error("Error creating application:", error);
      throw error; // Re-throw the error after logging
    }

    return { application: data as Application | null, error: null };
  } catch (err) {
    console.error("Exception in createApplication:", err);
    return {
      application: null,
      error:
        err instanceof Error
          ? err
          : new Error("Unknown error creating application"),
    };
  }
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

/**
 * Get a user profile by ID
 */
export const getUserProfileById = async (
  userId: string
): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        *,
        job_seeker_profile:job_seeker_profiles(*),
        employer_profile:employer_profiles(*)
      `
      )
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserProfileById:", error);
    return null;
  }
};

// Experience functions
export const getUserExperiences = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("user_id", userId)
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Supabase error fetching experiences:", error);
      return { experiences: null, error };
    }

    return { experiences: data as Experience[] | null, error: null };
  } catch (err) {
    console.error("Exception in getUserExperiences:", err);
    return {
      experiences: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
};

export const getUserExperiencesByType = async (
  userId: string,
  type: "work" | "education"
) => {
  try {
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("user_id", userId)
      .eq("type", type)
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Supabase error fetching experiences by type:", error);
      return { experiences: null, error };
    }

    return { experiences: data as Experience[] | null, error: null };
  } catch (err) {
    console.error("Exception in getUserExperiencesByType:", err);
    return {
      experiences: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
};

export const addExperience = async (
  experience: Omit<Experience, "id" | "created_at" | "updated_at">
) => {
  try {
    console.log(
      "database.addExperience called with:",
      JSON.stringify(experience, null, 2)
    );

    // Validate required fields before sending to database
    if (!experience.user_id) {
      console.error("Missing user_id in experience data");
      return {
        experience: null,
        error: new Error("Missing user_id in experience data"),
      };
    }

    if (!experience.title) {
      console.error("Missing title in experience data");
      return {
        experience: null,
        error: new Error("Missing title in experience data"),
      };
    }

    if (!experience.organization) {
      console.error("Missing organization in experience data");
      return {
        experience: null,
        error: new Error("Missing organization in experience data"),
      };
    }

    if (!experience.start_date) {
      console.error("Missing start_date in experience data");
      return {
        experience: null,
        error: new Error("Missing start_date in experience data"),
      };
    }

    const { data, error } = await supabase
      .from("experiences")
      .insert(experience)
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding experience:", error);
      return { experience: null, error };
    }

    console.log("Experience successfully added with ID:", data?.id);
    return { experience: data as Experience | null, error: null };
  } catch (err) {
    console.error("Exception in addExperience:", err);
    return {
      experience: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
};

export const updateExperience = async (
  id: string,
  updates: Partial<
    Omit<Experience, "id" | "user_id" | "created_at" | "updated_at">
  >
) => {
  try {
    const { data, error } = await supabase
      .from("experiences")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error updating experience:", error);
      return { experience: null, error };
    }

    return { experience: data as Experience | null, error: null };
  } catch (err) {
    console.error("Exception in updateExperience:", err);
    return {
      experience: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
};

export const deleteExperience = async (id: string) => {
  try {
    const { error } = await supabase.from("experiences").delete().eq("id", id);

    if (error) {
      console.error("Supabase error deleting experience:", error);
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error("Exception in deleteExperience:", err);
    return { error: err instanceof Error ? err : new Error("Unknown error") };
  }
};

// Function to get employer jobs with applicant count
export const getEmployerJobsWithApplicantCount = async (
  employerId: string,
  limit: number = 5 // Optional limit, defaults to 5
) => {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      applications (count)
    `
    )
    .eq("employer_id", employerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching employer jobs with applicant count:", error);
    return { jobs: null, error };
  }

  // Map the data to include applicant_count directly
  // Define an intermediate type for the raw Supabase response
  type JobWithNestedCount = Job & { applications: { count: number }[] };

  const jobsWithCount = data?.map((job: JobWithNestedCount) => ({
    ...job,
    applicant_count: job.applications[0]?.count || 0,
    applications: undefined, // Remove the nested count array
  })) as JobWithApplicantCount[] | null;

  return { jobs: jobsWithCount, error };
};

// Function to update application stage
export const updateApplicationStage = async (
  applicationId: string,
  stage: Application["stage"]
) => {
  const { data, error } = await supabase
    .from("applications")
    .update({ stage })
    .eq("id", applicationId)
    .select()
    .single();

  return { application: data as Application | null, error };
};

// Function to batch update application stages
export const batchUpdateApplicationStage = async (
  applicationIds: string[],
  stage: Application["stage"]
) => {
  const { data, error } = await supabase.rpc("batch_update_application_stage", {
    p_application_ids: applicationIds,
    p_stage: stage,
    p_user_id: (await supabase.auth.getUser()).data.user?.id,
  });

  return { results: data, error };
};
