import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  Profile,
  JobSeekerProfile,
  EmployerProfile,
  getProfile,
  getJobSeekerProfile,
  getEmployerProfile,
  createProfile,
  createJobSeekerProfile,
  createEmployerProfile,
  updateProfile,
  updateJobSeekerProfile,
  updateEmployerProfile,
} from "./database";

interface ProfileContextType {
  profile: Profile | null;
  jobSeekerProfile: JobSeekerProfile | null;
  employerProfile: EmployerProfile | null;
  loading: boolean;
  error: Error | null;
  refreshProfile: () => Promise<void>;
  createUserProfile: (
    profileData: Partial<Profile>
  ) => Promise<{ success: boolean; error: Error | null }>;
  createSeeker: (
    profileData: Partial<JobSeekerProfile>
  ) => Promise<{ success: boolean; error: Error | null }>;
  createEmployer: (
    profileData: Partial<EmployerProfile>
  ) => Promise<{ success: boolean; error: Error | null }>;
  updateUserProfile: (
    updates: Partial<Profile>
  ) => Promise<{ success: boolean; error: Error | null }>;
  updateSeeker: (
    updates: Partial<JobSeekerProfile>
  ) => Promise<{ success: boolean; error: Error | null }>;
  updateEmployer: (
    updates: Partial<EmployerProfile>
  ) => Promise<{ success: boolean; error: Error | null }>;
  isJobSeeker: () => boolean;
  isEmployer: () => boolean;
  hasProfile: () => boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobSeekerProfile, setJobSeekerProfile] =
    useState<JobSeekerProfile | null>(null);
  const [employerProfile, setEmployerProfile] =
    useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfiles = async () => {
    if (!user) {
      setProfile(null);
      setJobSeekerProfile(null);
      setEmployerProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch basic profile
      const { profile: fetchedProfile, error: profileError } = await getProfile(
        user.id
      );

      if (profileError) {
        throw new Error(`Error fetching profile: ${profileError.message}`);
      }

      setProfile(fetchedProfile);

      if (fetchedProfile) {
        if (fetchedProfile.type === "job_seeker") {
          // Fetch job seeker profile
          const { profile: seekerProfile, error: seekerError } =
            await getJobSeekerProfile(user.id);

          if (seekerError) {
            throw new Error(
              `Error fetching job seeker profile: ${seekerError.message}`
            );
          }

          setJobSeekerProfile(seekerProfile);
          setEmployerProfile(null);
        } else if (fetchedProfile.type === "employer") {
          // Fetch employer profile
          const { profile: empProfile, error: empError } =
            await getEmployerProfile(user.id);

          if (empError) {
            throw new Error(
              `Error fetching employer profile: ${empError.message}`
            );
          }

          setEmployerProfile(empProfile);
          setJobSeekerProfile(null);
        }
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Unknown error fetching profiles")
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchProfiles();
  };

  const createUserProfile = async (profileData: Partial<Profile>) => {
    if (!user) {
      return { success: false, error: new Error("No authenticated user") };
    }

    try {
      const { profile: newProfile, error: profileError } = await createProfile({
        id: user.id,
        ...profileData,
      });

      if (profileError) {
        throw profileError;
      }

      setProfile(newProfile);
      return { success: true, error: null };
    } catch (err) {
      console.error("Error creating profile:", err);
      return {
        success: false,
        error:
          err instanceof Error
            ? err
            : new Error("Unknown error creating profile"),
      };
    }
  };

  const createSeeker = async (profileData: Partial<JobSeekerProfile>) => {
    if (!user || !profile) {
      return {
        success: false,
        error: new Error("No authenticated user or base profile"),
      };
    }

    try {
      const { profile: newProfile, error: profileError } =
        await createJobSeekerProfile({
          id: user.id,
          ...profileData,
        });

      if (profileError) {
        throw profileError;
      }

      setJobSeekerProfile(newProfile);
      return { success: true, error: null };
    } catch (err) {
      console.error("Error creating job seeker profile:", err);
      return {
        success: false,
        error:
          err instanceof Error
            ? err
            : new Error("Unknown error creating job seeker profile"),
      };
    }
  };

  const createEmployer = async (profileData: Partial<EmployerProfile>) => {
    if (!user || !profile) {
      return {
        success: false,
        error: new Error("No authenticated user or base profile"),
      };
    }

    try {
      const { profile: newProfile, error: profileError } =
        await createEmployerProfile({
          id: user.id,
          ...profileData,
        });

      if (profileError) {
        throw profileError;
      }

      setEmployerProfile(newProfile);
      return { success: true, error: null };
    } catch (err) {
      console.error("Error creating employer profile:", err);
      return {
        success: false,
        error:
          err instanceof Error
            ? err
            : new Error("Unknown error creating employer profile"),
      };
    }
  };

  const updateUserProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) {
      return {
        success: false,
        error: new Error("No authenticated user or profile"),
      };
    }

    try {
      const { profile: updatedProfile, error: profileError } =
        await updateProfile(user.id, updates);

      if (profileError) {
        throw profileError;
      }

      setProfile(updatedProfile);
      return { success: true, error: null };
    } catch (err) {
      console.error("Error updating profile:", err);
      return {
        success: false,
        error:
          err instanceof Error
            ? err
            : new Error("Unknown error updating profile"),
      };
    }
  };

  const updateSeeker = async (updates: Partial<JobSeekerProfile>) => {
    if (!user || !jobSeekerProfile) {
      return {
        success: false,
        error: new Error("No authenticated user or job seeker profile"),
      };
    }

    try {
      const { profile: updatedProfile, error: profileError } =
        await updateJobSeekerProfile(user.id, updates);

      if (profileError) {
        throw profileError;
      }

      setJobSeekerProfile(updatedProfile);
      return { success: true, error: null };
    } catch (err) {
      console.error("Error updating job seeker profile:", err);
      return {
        success: false,
        error:
          err instanceof Error
            ? err
            : new Error("Unknown error updating job seeker profile"),
      };
    }
  };

  const updateEmployer = async (updates: Partial<EmployerProfile>) => {
    if (!user || !employerProfile) {
      return {
        success: false,
        error: new Error("No authenticated user or employer profile"),
      };
    }

    try {
      const { profile: updatedProfile, error: profileError } =
        await updateEmployerProfile(user.id, updates);

      if (profileError) {
        throw profileError;
      }

      setEmployerProfile(updatedProfile);
      return { success: true, error: null };
    } catch (err) {
      console.error("Error updating employer profile:", err);
      return {
        success: false,
        error:
          err instanceof Error
            ? err
            : new Error("Unknown error updating employer profile"),
      };
    }
  };

  const isJobSeeker = () => {
    return profile?.type === "job_seeker" && jobSeekerProfile !== null;
  };

  const isEmployer = () => {
    return profile?.type === "employer" && employerProfile !== null;
  };

  const hasProfile = () => {
    return profile !== null && (isJobSeeker() || isEmployer());
  };

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        jobSeekerProfile,
        employerProfile,
        loading,
        error,
        refreshProfile,
        createUserProfile,
        createSeeker,
        createEmployer,
        updateUserProfile,
        updateSeeker,
        updateEmployer,
        isJobSeeker,
        isEmployer,
        hasProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
