import React from "react";
import { useProfile } from "@/lib/ProfileContext";
import { JobSeekerDashboardPage } from "./JobSeekerDashboardPage";
import { EmployerDashboardPage } from "./EmployerDashboardPage";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";

export const DashboardPage: React.FC = () => {
  const { profile, loading, isJobSeeker, isEmployer } = useProfile();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    // Should be caught by protected route, but as a fallback
    return <Navigate to="/login" replace />;
  }

  if (isJobSeeker()) {
    return <JobSeekerDashboardPage />;
  }

  if (isEmployer()) {
    return <EmployerDashboardPage />;
  }

  // If profile exists but type is unknown or profile details are missing
  // Redirect to profile setup or show an error/guidance message
  console.warn("Dashboard accessed with incomplete profile:", profile);
  return <Navigate to="/profile-setup" replace />;
};
