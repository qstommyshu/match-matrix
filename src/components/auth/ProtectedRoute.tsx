import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import { useProfile } from "../../lib/ProfileContext";
// Import the Profile interface to potentially get the user_type definition
import { Profile } from "@/lib/database";

interface ProtectedRouteProps {
  children: ReactNode;
  requireProfile?: boolean;
  // Use the type directly from the imported Profile interface
  allowedRoles?: Profile["type"][];
}

export const ProtectedRoute = ({
  children,
  requireProfile = true,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, hasProfile } = useProfile(); // Get profile for role check
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
    console.log("ProtectedRoute: No user found, redirecting to /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If profile is required but user doesn't have one, redirect to profile setup
  if (
    requireProfile &&
    !hasProfile() &&
    location.pathname !== "/profile-setup"
  ) {
    console.log(
      "ProtectedRoute: Profile required but missing, redirecting to /profile-setup"
    );
    return <Navigate to="/profile-setup" state={{ from: location }} replace />;
  }

  // Check roles if allowedRoles is provided
  if (allowedRoles && allowedRoles.length > 0) {
    if (!profile || !profile.type || !allowedRoles.includes(profile.type)) {
      console.log(
        `ProtectedRoute: Role mismatch. User type: ${profile?.type}, Allowed: ${allowedRoles}. Redirecting to /dashboard`
      );
      // Redirect to a generic page like dashboard or show an unauthorized message
      // Avoid redirecting to login if they are already logged in
      return <Navigate to="/dashboard" replace />; // Or show an Unauthorized component
    }
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
