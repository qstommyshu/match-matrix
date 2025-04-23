import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useProfile } from "@/lib/ProfileContext";
import { ProfileTypeSelector } from "./ProfileTypeSelector";
import { JobSeekerProfileForm } from "./JobSeekerProfileForm";
import { EmployerProfileForm } from "./EmployerProfileForm";
import { Loader2 } from "lucide-react";

enum ProfileSetupStage {
  LOADING,
  SELECT_TYPE,
  JOB_SEEKER_FORM,
  EMPLOYER_FORM,
  COMPLETED,
}

interface UserData {
  fullName?: string;
  full_name?: string;
  companyName?: string;
  company_name?: string;
  industry?: string;
  email?: string;
  [key: string]: unknown;
}

export const ProfileCompletion: React.FC = () => {
  const { user } = useAuth();
  const {
    profile,
    jobSeekerProfile,
    employerProfile,
    loading,
    createUserProfile,
  } = useProfile();
  const [setupStage, setSetupStage] = useState<ProfileSetupStage>(
    ProfileSetupStage.LOADING
  );
  const navigate = useNavigate();

  // Get previously stored registration data
  const storedUserType = localStorage.getItem("userType");
  const storedUserData = localStorage.getItem("userData");
  const initialData: UserData = storedUserData
    ? JSON.parse(storedUserData)
    : {};

  useEffect(() => {
    // If still loading profile data, show loading state
    if (loading) {
      setSetupStage(ProfileSetupStage.LOADING);
      return;
    }

    // If user has a basic profile already
    if (profile) {
      // Check if they have the specific profile type completed
      if (profile.type === "job_seeker" && jobSeekerProfile) {
        setSetupStage(ProfileSetupStage.COMPLETED);
        navigate("/candidate-profile");
      } else if (profile.type === "employer" && employerProfile) {
        setSetupStage(ProfileSetupStage.COMPLETED);
        navigate("/company-profile");
      } else if (profile.type === "job_seeker") {
        setSetupStage(ProfileSetupStage.JOB_SEEKER_FORM);
      } else if (profile.type === "employer") {
        setSetupStage(ProfileSetupStage.EMPLOYER_FORM);
      }
    } else {
      // If we have a stored user type from registration, use it
      if (storedUserType === "candidate") {
        handleProfileTypeSelection("job_seeker");
      } else if (storedUserType === "company") {
        handleProfileTypeSelection("employer");
      } else {
        // Otherwise, let user select profile type
        setSetupStage(ProfileSetupStage.SELECT_TYPE);
      }

      // Clean up local storage after using the data
      localStorage.removeItem("userType");
      localStorage.removeItem("userData");
    }
  }, [
    profile,
    jobSeekerProfile,
    employerProfile,
    loading,
    navigate,
    storedUserType,
  ]);

  const handleProfileTypeSelection = async (
    type: "job_seeker" | "employer"
  ) => {
    if (!user?.email) return;

    try {
      // Use stored full name if available from registration
      const fullName = initialData.fullName || initialData.full_name || "";

      const { success } = await createUserProfile({
        email: user.email,
        type: type,
        full_name: fullName,
      });

      if (success) {
        setSetupStage(
          type === "job_seeker"
            ? ProfileSetupStage.JOB_SEEKER_FORM
            : ProfileSetupStage.EMPLOYER_FORM
        );
      }
    } catch (error) {
      console.error("Failed to create profile:", error);
    }
  };

  // Render appropriate stage
  const renderContent = () => {
    switch (setupStage) {
      case ProfileSetupStage.LOADING:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        );

      case ProfileSetupStage.SELECT_TYPE:
        return <ProfileTypeSelector onSelect={handleProfileTypeSelection} />;

      case ProfileSetupStage.JOB_SEEKER_FORM:
        return <JobSeekerProfileForm initialData={initialData} />;

      case ProfileSetupStage.EMPLOYER_FORM:
        return <EmployerProfileForm initialData={initialData} />;

      case ProfileSetupStage.COMPLETED:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-xl mb-4">Profile completed!</p>
            <p className="text-muted-foreground mb-8">
              Redirecting to your dashboard...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Complete Your Profile
        </h1>
        {renderContent()}
      </div>
    </div>
  );
};
