import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { useProfile } from "../lib/ProfileContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  UserCircle,
  LogOut,
  LayoutDashboard,
  Briefcase,
  Mail,
} from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const { profile, isJobSeeker, isEmployer, hasProfile, loading } =
    useProfile();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue"
          >
            Match<span className="font-normal">Matrix</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium hover:text-neon-purple transition-colors"
          >
            Home
          </Link>
          {user && (
            <Link
              to="/jobs"
              className="text-sm font-medium hover:text-neon-purple transition-colors flex items-center gap-1"
            >
              <Briefcase className="h-4 w-4" /> Jobs
            </Link>
          )}
          <Link
            to="/about"
            className="text-sm font-medium hover:text-neon-purple transition-colors"
          >
            How it Works
          </Link>
          <Link
            to="/pricing"
            className="text-sm font-medium hover:text-neon-purple transition-colors"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* Display profile setup prompt if user doesn't have a profile */}
              {!loading && !hasProfile() && (
                <Link to="/profile-setup">
                  <Button className="text-sm bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity">
                    Complete Profile
                  </Button>
                </Link>
              )}

              {/* User dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1 p-1"
                  >
                    <span className="text-sm font-medium">
                      Hi!{" "}
                      {profile?.full_name ||
                        user?.email?.split("@")[0] ||
                        "User"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {hasProfile() && (
                    <>
                      {/* Dashboard Link */}
                      <DropdownMenuItem asChild>
                        <Link
                          to="/dashboard"
                          className="flex items-center cursor-pointer"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>

                      {/* Job Invitations Link - Only for job seekers */}
                      {isJobSeeker() && (
                        <DropdownMenuItem asChild>
                          <Link
                            to="/candidate-invitations"
                            className="flex items-center cursor-pointer"
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Job Invitations</span>
                          </Link>
                        </DropdownMenuItem>
                      )}

                      {/* My Profile Link */}
                      <DropdownMenuItem asChild>
                        <Link
                          to={
                            isJobSeeker()
                              ? "/candidate-profile"
                              : "/company-profile"
                          }
                          className="flex items-center cursor-pointer"
                        >
                          <UserCircle className="mr-2 h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center text-red-500 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="text-sm bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
