import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import { useProfile } from "../../lib/ProfileContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireProfile?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireProfile = true,
}: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { loading: profileLoading, hasProfile } = useProfile();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // When both auth and profile status are no longer loading, we've completed our checks
    if (!authLoading && !profileLoading) {
      setIsChecking(false);
    }
  }, [authLoading, profileLoading]);

  // While checking authentication or profile status, show a loading state
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If profile is required but user doesn't have one, redirect to profile setup
  // Skip this check if we're already on the profile setup page to avoid redirect loops
  if (
    requireProfile &&
    !hasProfile() &&
    location.pathname !== "/profile-setup"
  ) {
    return <Navigate to="/profile-setup" replace />;
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
