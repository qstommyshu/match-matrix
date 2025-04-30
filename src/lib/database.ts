import { supabase } from "./supabase";
import { useProfile } from "@/lib/ProfileContext";
import { toast } from "@/components/ui/use-toast";

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
  // Pro features
  is_pro?: boolean; // Optional because it might not be selected everywhere
  pro_active_status?: boolean; // Optional
  last_active_check_in?: string | null; // Optional
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

// Pro Feature Types
export interface AssessmentSkill {
  id: string;
  user_id: string;
  skill_id: string;
  assessment_score: number;
  verified_at: string;
  created_at: string;
  skill?: Skill; // Optional join
}

export interface PowerMatch {
  id: string;
  user_id: string;
  job_id: string;
  application_id: string | null;
  match_score: number;
  created_at: string;
  viewed_at: string | null;
  applied_at: string | null;
  job?: Job; // Optional join
  application?: Application; // Optional join
}

// New types for Employer Power Match
export type InvitationStatus = "pending" | "accepted" | "declined";

export interface EmployerPowerMatch {
  id: string;
  employer_id: string;
  job_id: string;
  user_id: string; // The job seeker being matched
  match_score: number;
  created_at: string;
  viewed_at: string | null;
  sent_invitation_at: string | null;
  invitation_status: InvitationStatus | null;
  invitation_response_at: string | null;
  // Optional joins for displaying info
  job?: Pick<Job, "id" | "title">;
  job_seeker?: {
    id: string;
    full_name: string | null;
    email?: string;
    user_skills?: string[];
    job_seeker_profile?: {
      headline: string | null;
      location: string | null;
      years_of_experience: number | null;
      bio?: string | null;
      education?: string | null;
      desired_role?: string | null;
    } | null;
  };
}

export interface CandidateInvitation {
  id: string;
  employer_id: string;
  job_id: string;
  user_id: string; // The invited candidate
  employer_power_match_id: string | null; // Link to the match
  message: string | null; // Optional custom message from employer
  created_at: string;
  viewed_at: string | null;
  status: InvitationStatus;
  responded_at: string | null;
  // Optional joins for displaying info
  job?: Pick<Job, "id" | "title" | "location" | "remote">;
  employer?: Pick<Profile, "id" | "full_name"> & {
    employer_profiles?: Pick<
      EmployerProfile,
      "company_name" | "logo_url"
    > | null;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  type: string; // e.g., 'invitation', 'application_update', etc.
  content: NotificationContent; // More specific content type
  created_at: string;
  read_at: string | null;
}

// Define specific content types for notifications
export type NotificationContent =
  | InvitationNotificationContent
  | ApplicationUpdateNotificationContent // Example for future
  | { type: string; data: unknown }; // Fallback for other types

export interface InvitationNotificationContent {
  type: "invitation";
  invitationId: string;
  jobId: string;
  jobTitle: string;
  employerId: string;
  companyName: string;
}

// Example structure for another notification type
export interface ApplicationUpdateNotificationContent {
  type: "application_update";
  applicationId: string;
  jobTitle: string;
  newStatus: string;
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
  page?: number;
  pageSize?: number;
}) => {
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 10; // Default page size
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("jobs").select(
    `
      *,
      employer:profiles(
        *,
        employer_profile:employer_profiles(*)
      ),
      skills:job_skills(*, skill:skills(*))
    `,
    { count: "exact" } // Request total count
  );

  // Apply filters
  if (filters?.search) {
    query = query.textSearch("fts", filters.search, { type: "websearch" });
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
  if (filters?.skills && filters.skills.length > 0) {
    // This filter needs to be applied *after* the main query because it depends on joined data
    // We will filter in JS below for simplicity, but a DB function would be more efficient for large datasets
  }

  // Apply status filter (always fetch open jobs unless employerId is specified)
  if (!filters?.employerId) {
    query = query.eq("status", "open");
  }

  // Apply ordering and pagination
  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching jobs:", error);
    return { jobs: null, error, count: 0 };
  }

  type JobWithNestedEmployerProfile = Omit<Job, "employer"> & {
    employer?: Profile & {
      employer_profile?: EmployerProfile | null;
    };
  };

  let filteredJobs = data as JobWithNestedEmployerProfile[] | null;

  // Apply skills filter in JS (if needed)
  if (filteredJobs && filters?.skills && filters.skills.length > 0) {
    filteredJobs = filteredJobs.filter((job) => {
      if (!job.skills) return false;
      // Check if at least one of the filter skills matches a job skill
      return filters.skills.some(
        (filterSkillId) =>
          job.skills!.some(
            (jobSkill) =>
              jobSkill.skill?.name.toLowerCase() ===
                filterSkillId.toLowerCase() ||
              jobSkill.skill_id === filterSkillId
          ) // Match by name or ID for flexibility
      );
    });
  }

  return { jobs: filteredJobs as Job[] | null, error: null, count: count || 0 };
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

// Function to update application status (used for withdrawing)
export const updateApplicationStatus = async (
  applicationId: string,
  status: string, // Could also update stage here if needed
  stage: Application["stage"]
) => {
  const { data, error } = await supabase
    .from("applications")
    .update({ status, stage, updated_at: new Date().toISOString() })
    .eq("id", applicationId)
    .select()
    .single();

  return { application: data as Application | null, error };
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

// --- Pro Job Seeker Functions ---

// Function to upgrade a job seeker account to Pro
export const upgradeToProAccount = async (userId: string) => {
  const { data, error } = await supabase
    .from("job_seeker_profiles")
    .update({ is_pro: true })
    .eq("id", userId)
    .select("id, is_pro")
    .single();

  return { profile: data, error };
};

// Function for a Pro job seeker to check in their active status
export const checkInActiveStatus = async (userId: string) => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("job_seeker_profiles")
    .update({ pro_active_status: true, last_active_check_in: now })
    .eq("id", userId)
    .select("id, pro_active_status, last_active_check_in")
    .single();

  return { profile: data, error };
};

// Function to get assessment skills for a user
export const getAssessmentSkills = async (userId: string) => {
  const { data, error } = await supabase
    .from("assessment_skills")
    .select(
      `
      *,
      skill:skills(*)
    `
    )
    .eq("user_id", userId);

  return { assessmentSkills: data as AssessmentSkill[] | null, error };
};

// Function to add a new assessment skill
export const addAssessmentSkill = async (
  assessmentSkill: Omit<
    AssessmentSkill,
    "id" | "created_at" | "verified_at" | "skill"
  > & { verified_at?: string } // Allow optional verified_at override
) => {
  const skillData = {
    ...assessmentSkill,
    verified_at: assessmentSkill.verified_at || new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("assessment_skills")
    .insert(skillData)
    .select("* , skill:skills(*)") // Select joined skill
    .single();

  return { assessmentSkill: data as AssessmentSkill | null, error };
};

// Function to update an assessment skill (e.g., after reassessment)
// Note: Use cautiously. Usually, new assessments might create new records or require specific logic.
export const updateAssessmentSkill = async (
  id: string,
  updates: Partial<Pick<AssessmentSkill, "assessment_score">> & {
    verified_at?: string;
  } // Allow updating score and verified timestamp
) => {
  const updateData = {
    ...updates,
    verified_at: updates.verified_at || new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("assessment_skills")
    .update(updateData)
    .eq("id", id)
    .select("* , skill:skills(*)") // Select joined skill
    .single();

  return { assessmentSkill: data as AssessmentSkill | null, error };
};

// Function to delete an assessment skill
export const deleteAssessmentSkill = async (assessmentSkillId: string) => {
  // We might want to add an extra check here to ensure the user owns this skill,
  // but RLS policy should prevent unauthorized deletion.
  const { error } = await supabase
    .from("assessment_skills")
    .delete()
    .eq("id", assessmentSkillId);

  return { error };
};

// Function to get power matches for a user
export const getPowerMatches = async (userId: string) => {
  const { data, error } = await supabase
    .from("power_matches")
    .select(
      `
      *,
      job:jobs(*, 
        employer:profiles(*, 
          employer_profile:employer_profiles(company_name)
        )
      ),
      application:applications(*)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // Adjust type to reflect nested company_name
  type PowerMatchWithJob = Omit<PowerMatch, "job"> & {
    job?: Job & {
      employer?: Profile & {
        employer_profile?: { company_name: string } | null;
      };
    };
  };

  return {
    powerMatches: data as PowerMatchWithJob[] | null,
    error,
  };
};

// Function to mark a power match as viewed by the user
export const markPowerMatchViewed = async (powerMatchId: string) => {
  const { data, error } = await supabase
    .from("power_matches")
    .update({ viewed_at: new Date().toISOString() })
    .eq("id", powerMatchId)
    .select("id, viewed_at")
    .single();

  return { powerMatch: data, error };
};

// Function to get details for a specific power match (useful if needed)
export const getPowerMatch = async (powerMatchId: string) => {
  const { data, error } = await supabase
    .from("power_matches")
    .select(
      `
      *,
      job:jobs(*, employer:profiles(company_name:employer_profiles(company_name))),
      application:applications(*)
    `
    )
    .eq("id", powerMatchId)
    .single();

  // Adjust type to reflect nested company_name
  type PowerMatchWithJob = Omit<PowerMatch, "job"> & {
    job?: Job & {
      employer?: Profile & {
        employer_profile?: { company_name: string } | null;
      };
    };
  };

  return { powerMatch: data as PowerMatchWithJob | null, error };
};

// Function to manually trigger power match generation for a user
// Matches the JSON structure returned by the trigger_user_power_match SQL function
export interface TriggerPowerMatchResult {
  status: "success" | "error";
  message: string;
  new_matches_applied: number;
}

export const triggerUserPowerMatch = async (
  userId: string
): Promise<{ data: TriggerPowerMatchResult | null; error: Error | null }> => {
  const { data, error } = await supabase.rpc("trigger_user_power_match", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error triggering power match:", error);
    return {
      data: null,
      error: new Error(`Failed to trigger power match: ${error.message}`),
    };
  }

  return {
    data: {
      status: "success",
      message: data?.message || "Power match trigger completed.",
      new_matches_applied: data?.new_matches_applied || 0,
    } as TriggerPowerMatchResult,
    error: null,
  };
};

// --- Employer Power Match & Invitation Functions ---

/**
 * Fetches potential candidate matches for a specific job owned by the employer.
 * Includes basic job seeker profile details for display.
 */
export const getEmployerPowerMatches = async (
  employerId: string,
  jobId: string,
  filters?: {
    minScore?: number;
    status?: InvitationStatus | "not_invited";
    page?: number;
    pageSize?: number;
  }
) => {
  const { page = 1, pageSize = 10 } = filters ?? {};
  const offset = (page - 1) * pageSize;

  // Define precise types for the raw Supabase query result
  type RawJobData = { id: string; title: string };
  type RawSkill = { name: string; category: string | null };
  type RawUserSkillEntry = { skill: RawSkill | null };
  type RawJobSeekerProfileData = {
    headline: string | null;
    location: string | null;
    years_of_experience: number | null;
    bio?: string | null;
    education?: string | null;
    desired_role?: string | null;
  };
  type RawJobSeekerData = {
    id: string;
    full_name: string | null;
    email?: string;
    job_seeker_profile:
      | RawJobSeekerProfileData
      | RawJobSeekerProfileData[]
      | null;
    user_skills: RawUserSkillEntry[] | null;
  };
  type RawEmployerPowerMatchData = {
    id: string;
    match_score: number;
    created_at: string;
    viewed_at: string | null;
    sent_invitation_at: string | null;
    invitation_status: InvitationStatus | null;
    invitation_response_at: string | null;
    // Supabase might return single objects or arrays for joins
    job: RawJobData | RawJobData[] | null;
    job_seeker: RawJobSeekerData | RawJobSeekerData[] | null;
  };

  let query = supabase
    .from("employer_power_matches")
    .select(
      `
      id,
      match_score,
      created_at,
      viewed_at,
      sent_invitation_at,
      invitation_status,
      invitation_response_at,
      job:jobs!inner(id, title),
      job_seeker:profiles!employer_power_matches_user_id_fkey(
        id,
        full_name,
        email,
        job_seeker_profile:job_seeker_profiles(
          headline,
          location,
          years_of_experience,
          bio,
          education,
          desired_role
        ),
        user_skills:user_skills(
          skill:skills(
            name,
            category
          )
        )
      )
    `,
      { count: "exact" }
    )
    .eq("employer_id", employerId)
    .eq("job_id", jobId)
    .order("match_score", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (filters?.minScore !== undefined) {
    query = query.gte("match_score", filters.minScore);
  }

  if (filters?.status) {
    if (filters.status === "not_invited") {
      query = query.is("sent_invitation_at", null);
    } else {
      query = query.eq("invitation_status", filters.status);
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching employer power matches:", error);
    return { data: [], error, count: 0 };
  }

  // Helper to safely get the first item if it's an array, or return the object/null
  function getSingle<T>(val: T | T[] | null): T | null {
    if (Array.isArray(val)) {
      return val[0] || null;
    }
    return val;
  }

  // Map data to the correct type, handling potential arrays from joins
  const mappedData: EmployerPowerMatch[] = data.map((item) => {
    const singleJob = getSingle(item.job);
    const singleJobSeeker = getSingle(item.job_seeker);
    const singleJobSeekerProfile = singleJobSeeker
      ? getSingle(singleJobSeeker.job_seeker_profile)
      : null;
    // Correctly map user_skills which might be an array of objects with a skill property
    const userSkills = singleJobSeeker?.user_skills
      ? singleJobSeeker.user_skills
          .map((us) => getSingle(us?.skill)?.name)
          .filter((name): name is string => !!name)
      : [];

    return {
      id: item.id,
      employer_id: employerId, // Add employerId here
      job_id: jobId, // Add jobId here
      user_id: singleJobSeeker?.id ?? "", // Ensure user_id is always string
      match_score: item.match_score,
      created_at: item.created_at,
      viewed_at: item.viewed_at,
      sent_invitation_at: item.sent_invitation_at,
      invitation_status: item.invitation_status,
      invitation_response_at: item.invitation_response_at,
      job: singleJob ? { id: singleJob.id, title: singleJob.title } : undefined,
      job_seeker: singleJobSeeker
        ? {
            id: singleJobSeeker.id,
            full_name: singleJobSeeker.full_name,
            email: singleJobSeeker.email,
            user_skills: userSkills, // Use the mapped skills array
            job_seeker_profile: singleJobSeekerProfile
              ? {
                  headline: singleJobSeekerProfile.headline,
                  location: singleJobSeekerProfile.location,
                  years_of_experience:
                    singleJobSeekerProfile.years_of_experience,
                  bio: singleJobSeekerProfile.bio,
                  education: singleJobSeekerProfile.education,
                  desired_role: singleJobSeekerProfile.desired_role,
                }
              : null,
          }
        : undefined,
    };
  });

  return { data: mappedData, error: null, count: count ?? 0 };
};

/**
 * Updates the viewed_at timestamp for a specific employer power match.
 */
export const markEmployerPowerMatchViewed = async (
  powerMatchId: string,
  employerId: string // Ensure the employer owns the match
) => {
  const { data, error } = await supabase
    .from("employer_power_matches")
    .update({ viewed_at: new Date().toISOString() })
    .eq("id", powerMatchId)
    .eq("employer_id", employerId) // RLS also enforces this, but good practice
    .is("viewed_at", null) // Only update if not already viewed
    .select("id")
    .single();

  if (error) {
    console.error("Error marking employer power match as viewed:", error);
  }

  return { data, error };
};

/**
 * Creates a candidate invitation record and updates the corresponding power match.
 * Assumes a notification will be created via a database trigger or separate call.
 */
export const sendCandidateInvitation = async (
  powerMatchId: string,
  employerId: string,
  jobId: string,
  userId: string, // Candidate ID
  message?: string // Optional custom message
) => {
  // 1. Update the power match record
  const { data: matchUpdateData, error: matchUpdateError } = await supabase
    .from("employer_power_matches")
    .update({
      sent_invitation_at: new Date().toISOString(),
      invitation_status: "pending",
    })
    .eq("id", powerMatchId)
    .eq("employer_id", employerId)
    .is("sent_invitation_at", null) // Only if not already sent
    .select("id")
    .single();

  if (matchUpdateError) {
    console.error(
      "Error updating power match for invitation:",
      matchUpdateError
    );
    return { data: null, error: matchUpdateError };
  }

  if (!matchUpdateData) {
    // Match might have already been invited or doesn't exist/belong to employer
    console.warn(
      `Power match ${powerMatchId} not updated, invitation not sent (already sent or invalid).`
    );
    return {
      data: null,
      error: new Error("Invitation already sent or match is invalid."),
    };
  }

  // 2. Create the candidate invitation record
  const { data: invitationData, error: invitationError } = await supabase
    .from("candidate_invitations")
    .insert({
      employer_id: employerId,
      job_id: jobId,
      user_id: userId,
      employer_power_match_id: powerMatchId,
      message: message,
      status: "pending",
    })
    .select("id, created_at") // Select needed data
    .single();

  if (invitationError) {
    console.error("Error creating candidate invitation:", invitationError);
    // Attempt to rollback the power match update? (More complex, skip for now)
    return { data: null, error: invitationError };
  }

  // TODO: Consider adding notification creation logic here if not handled by trigger

  return { data: invitationData as CandidateInvitation | null, error: null };
};

/**
 * Fetches invitations received by a specific job seeker.
 * Includes details about the job and the inviting employer.
 */
export const getCandidateInvitations = async (
  userId: string,
  filters?: {
    status?: InvitationStatus;
    page?: number;
    pageSize?: number;
  }
) => {
  const { page = 1, pageSize = 10 } = filters ?? {};
  const offset = (page - 1) * pageSize;

  // Define expected query result structure
  type CandidateInvitationQueryResult = {
    id: string;
    employer_id: string;
    job_id: string;
    employer_power_match_id: string | null;
    message: string | null;
    created_at: string;
    viewed_at: string | null;
    status: InvitationStatus;
    responded_at: string | null;
    job: Array<{
      id: string;
      title: string;
      location: string | null;
      remote: boolean;
    }> | null;
    employer: Array<{
      id: string;
      full_name: string | null;
      employer_profiles: Array<{
        company_name: string | null;
        logo_url: string | null;
      }> | null;
    }> | null;
  };

  let query = supabase
    .from("candidate_invitations")
    .select(
      `
      id,
      employer_id,
      job_id,
      employer_power_match_id,
      message,
      created_at,
      viewed_at,
      status,
      responded_at,
      job:jobs!candidate_invitations_job_id_fkey(
        id,
        title,
        location,
        remote
      ),
      employer:profiles!candidate_invitations_employer_id_fkey(
        id,
        full_name,
        employer_profiles(
          company_name,
          logo_url
        )
      )
    `,
      { count: "exact" }
    )
    .eq("user_id", userId);

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching candidate invitations:", error);
    return { data: null, error, count: 0 };
  }

  // Map data to the correct type
  const typedData: CandidateInvitation[] = (data || []).map(
    (item: CandidateInvitationQueryResult) => {
      // Handle potential array/object inconsistency from Supabase joins
      const jobData = Array.isArray(item.job) ? item.job[0] : item.job;
      const employerData = Array.isArray(item.employer)
        ? item.employer[0]
        : item.employer;
      const employerProfileData =
        employerData && Array.isArray(employerData.employer_profiles)
          ? employerData.employer_profiles[0]
          : employerData?.employer_profiles; // Allow object case too

      return {
        id: item.id,
        employer_id: item.employer_id,
        job_id: item.job_id,
        user_id: userId, // Add userId from function params
        employer_power_match_id: item.employer_power_match_id,
        message: item.message,
        created_at: item.created_at,
        viewed_at: item.viewed_at,
        status: item.status,
        responded_at: item.responded_at,
        job: jobData
          ? {
              id: jobData.id,
              title: jobData.title,
              location: jobData.location,
              remote: jobData.remote,
            }
          : undefined,
        employer: employerData
          ? {
              id: employerData.id,
              full_name: employerData.full_name,
              employer_profiles:
                employerProfileData && !Array.isArray(employerProfileData)
                  ? {
                      company_name: employerProfileData.company_name,
                      logo_url: employerProfileData.logo_url,
                    }
                  : null,
            }
          : undefined,
      };
    }
  );

  if (data) {
    data.forEach((invite, idx) => {
      console.group(`Invitation #${idx + 1}`);
      console.log("  id:", invite.id);
      console.log("  job_id:", invite.job_id, " job:", invite.job);
      console.log(
        "  employer_id:",
        invite.employer_id,
        " employer:",
        invite.employer
      );
      console.log("  status:", invite.status, " viewed_at:", invite.viewed_at);
      console.groupEnd();
    });
  }

  return { data: typedData, error: null, count: count ?? 0 };
};

/**
 * Updates the status of a candidate invitation (accept/decline).
 * Also updates the linked employer power match record.
 */
export const respondToCandidateInvitation = async (
  invitationId: string,
  candidateId: string, // User responding
  newStatus: "accepted" | "declined" // Only allow accept/decline
) => {
  const responseTime = new Date().toISOString();

  // 1. Update the invitation status
  const { data: invitationUpdate, error: invitationError } = await supabase
    .from("candidate_invitations")
    .update({
      status: newStatus,
      responded_at: responseTime,
      viewed_at: responseTime, // Mark as viewed if responding
    })
    .eq("id", invitationId)
    .eq("user_id", candidateId)
    .eq("status", "pending") // Can only respond to pending invitations
    .select("id, employer_power_match_id") // Need power match ID for next step
    .single();

  if (invitationError) {
    console.error("Error updating invitation status:", invitationError);
    return { data: null, error: invitationError };
  }

  if (!invitationUpdate) {
    console.warn(
      `Invitation ${invitationId} not updated (already responded or invalid).`
    );
    return {
      data: null,
      error: new Error("Invitation already responded to or invalid."),
    };
  }

  // 2. Update the corresponding employer power match record (if linked)
  if (invitationUpdate.employer_power_match_id) {
    const { error: matchError } = await supabase
      .from("employer_power_matches")
      .update({
        invitation_status: newStatus,
        invitation_response_at: responseTime,
      })
      .eq("id", invitationUpdate.employer_power_match_id);

    if (matchError) {
      // Log error but don't necessarily fail the whole operation
      // The primary action (invitation update) succeeded.
      console.error(
        "Error updating linked employer power match status:",
        matchError
      );
    }
  }

  // TODO: Consider adding notification for employer on acceptance/rejection?

  return { data: { id: invitationUpdate.id }, error: null };
};

/**
 * Fetches statistics about invitations sent by an employer.
 */
export const getEmployerInvitationStats = async (
  employerId: string,
  jobId?: string // Optional filter by job
) => {
  // Define the structure we expect from the RPC call (or build query manually)
  // Using manual counts for better clarity
  type StatusCount = { status: InvitationStatus; count: number };

  try {
    // Count pending
    let pendingQuery = supabase
      .from("candidate_invitations")
      .select("*", { count: "exact", head: true })
      .eq("employer_id", employerId)
      .eq("status", "pending");
    if (jobId) pendingQuery = pendingQuery.eq("job_id", jobId);
    const { count: pendingCount, error: pendingError } = await pendingQuery;
    if (pendingError) throw pendingError;

    // Count accepted
    let acceptedQuery = supabase
      .from("candidate_invitations")
      .select("*", { count: "exact", head: true })
      .eq("employer_id", employerId)
      .eq("status", "accepted");
    if (jobId) acceptedQuery = acceptedQuery.eq("job_id", jobId);
    const { count: acceptedCount, error: acceptedError } = await acceptedQuery;
    if (acceptedError) throw acceptedError;

    // Count declined
    let declinedQuery = supabase
      .from("candidate_invitations")
      .select("*", { count: "exact", head: true })
      .eq("employer_id", employerId)
      .eq("status", "declined");
    if (jobId) declinedQuery = declinedQuery.eq("job_id", jobId);
    const { count: declinedCount, error: declinedError } = await declinedQuery;
    if (declinedError) throw declinedError;

    const totalSent =
      (pendingCount ?? 0) + (acceptedCount ?? 0) + (declinedCount ?? 0);

    const stats = {
      totalSent: totalSent,
      pending: pendingCount ?? 0,
      accepted: acceptedCount ?? 0,
      declined: declinedCount ?? 0,
    };

    return { data: stats, error: null };
  } catch (error) {
    // Type the error properly
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error fetching employer invitation stats:", error);
    return { data: null, error: new Error(errorMessage) };
  }
};

/**
 * Manually triggers the generation of employer power matches for a specific job.
 *
 * @param jobId The ID of the job to generate matches for
 * @param employerId The ID of the employer (for authorization)
 * @returns Object containing status, message, and count of new matches found
 */
export const triggerEmployerPowerMatch = async (
  jobId: string,
  employerId: string
): Promise<{
  data: {
    status: string;
    message: string;
    job_title?: string;
    potential_matches_evaluated?: number;
    new_matches_found: number;
  } | null;
  error: Error | null;
}> => {
  try {
    // First verify that the employer owns this job
    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select("employer_id")
      .eq("id", jobId)
      .single();

    if (jobError) throw jobError;
    if (jobData.employer_id !== employerId) {
      throw new Error("Not authorized to trigger matches for this job");
    }

    // Call the RPC function
    const { data, error } = await supabase.rpc("trigger_employer_power_match", {
      p_job_id: jobId,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("Error triggering employer power matches:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

// Function to get the total number of unique applicants for an employer
export const getEmployerTotalApplicants = async (
  employerId: string
): Promise<{ data: number | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.rpc(
      "get_employer_total_applicants",
      {
        p_employer_id: employerId,
      }
    );

    if (error) {
      console.error("Error fetching total applicants:", error);
      throw error;
    }

    return { data: data ?? 0, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// Function to get the total number of active (open) jobs for an employer
export const getEmployerActiveJobsCount = async (
  employerId: string
): Promise<{ data: number | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.rpc(
      "get_employer_active_jobs_count",
      {
        p_employer_id: employerId,
      }
    );

    if (error) {
      console.error("Error fetching active jobs count:", error);
      throw error;
    }

    return { data: data ?? 0, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// Function to get the total number of applications sent by a job seeker
export const getJobSeekerApplicationsCount = async (
  userId: string
): Promise<{ data: number | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.rpc(
      "get_job_seeker_applications_count",
      {
        p_user_id: userId,
      }
    );

    if (error) {
      console.error("Error fetching job seeker applications count:", error);
      throw error;
    }

    return { data: data ?? 0, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// Function to get the total number of invitations received by a job seeker
export const getJobSeekerInvitationsCount = async (
  userId: string
): Promise<{ data: number | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.rpc(
      "get_job_seeker_invitations_count",
      {
        p_user_id: userId,
      }
    );

    if (error) {
      console.error("Error fetching job seeker invitations count:", error);
      throw error;
    }

    return { data: data ?? 0, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// Function to get the total number of offers received by a job seeker
export const getJobSeekerOffersCount = async (
  userId: string
): Promise<{ data: number | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.rpc("get_job_seeker_offers_count", {
      p_user_id: userId,
    });

    if (error) {
      console.error("Error fetching job seeker offers count:", error);
      throw error;
    }

    return { data: data ?? 0, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// Function to get the total number of offers extended by an employer
export const getEmployerTotalOffersExtended = async (
  employerId: string
): Promise<{ data: number | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.rpc(
      "get_employer_total_offers_extended",
      {
        p_employer_id: employerId,
      }
    );

    if (error) {
      console.error("Error fetching total offers extended:", error);
      throw error;
    }

    return { data: data ?? 0, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// --- END Employer Power Match & Invitation Functions ---
