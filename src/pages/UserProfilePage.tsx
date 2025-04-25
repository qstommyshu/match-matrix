import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getUserProfileById,
  getUserExperiences,
  Profile,
  JobSeekerProfile,
  EmployerProfile,
  Experience,
  getUserSkills,
  UserSkill,
} from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Calendar,
  Building,
  MapPin,
  GraduationCap,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

// Extended Profile type that includes joined tables
interface ProfileWithDetails extends Profile {
  job_seeker_profile: JobSeekerProfile | null;
  employer_profile: EmployerProfile | null;
}

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileWithDetails | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingExperiences, setLoadingExperiences] = useState<boolean>(false);
  const [loadingSkills, setLoadingSkills] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError("User ID is required");
        setLoading(false);
        return;
      }

      try {
        const userData = await getUserProfileById(userId);
        if (!userData) {
          setError("User profile not found");
        } else {
          setProfile(userData as ProfileWithDetails);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    const fetchExperiences = async () => {
      if (!userId) return;

      setLoadingExperiences(true);
      try {
        const { experiences: data, error } = await getUserExperiences(userId);
        if (error) {
          console.error("Error fetching experiences:", error);
          // Use toast for user feedback but continue showing the page
          toast.error(
            "Could not load experiences. Please try refreshing the page."
          );
        } else {
          setExperiences(data || []);
        }
      } catch (err) {
        console.error("Exception in fetchExperiences:", err);
        toast.error("An unexpected error occurred while loading experiences.");
      } finally {
        setLoadingExperiences(false);
      }
    };

    if (userId) {
      fetchExperiences();
    }
  }, [userId]);

  useEffect(() => {
    const fetchSkills = async () => {
      if (!userId) return;

      setLoadingSkills(true);
      try {
        const { userSkills: data, error } = await getUserSkills(userId);
        if (error) {
          console.error("Error fetching user skills:", error);
          toast.error("Could not load user skills.");
        } else {
          setUserSkills(data || []);
        }
      } catch (err) {
        console.error("Exception fetching user skills:", err);
        toast.error("An unexpected error occurred while loading skills.");
      } finally {
        setLoadingSkills(false);
      }
    };

    if (userId) {
      fetchSkills();
    }
  }, [userId]);

  const handleBack = () => {
    navigate(-1);
  };

  // Helper function to format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Filter experiences by type
  const workExperiences = experiences.filter((exp) => exp.type === "work");
  const educationExperiences = experiences.filter(
    (exp) => exp.type === "education"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500 text-lg">{error}</p>
        <Button variant="outline" onClick={handleBack}>
          Go Back
        </Button>
      </div>
    );
  }

  const isJobSeeker = profile?.job_seeker_profile !== null;
  const isEmployer = profile?.employer_profile !== null;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Button variant="outline" onClick={handleBack} className="mb-6">
        ← Back
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              {profile?.full_name || "Profile"}
            </CardTitle>
            {isJobSeeker && (
              <Badge variant="outline" className="bg-blue-50">
                Job Seeker
              </Badge>
            )}
            {isEmployer && (
              <Badge variant="outline" className="bg-green-50">
                Employer
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium text-lg mb-2">Contact Information</h3>
            <p className="text-gray-600">{profile?.email}</p>
          </div>

          {isJobSeeker && profile?.job_seeker_profile && (
            <>
              {profile.job_seeker_profile.headline && (
                <div>
                  <h3 className="font-medium text-lg mb-2">Headline</h3>
                  <p className="text-gray-600">
                    {profile.job_seeker_profile.headline}
                  </p>
                </div>
              )}

              {profile.job_seeker_profile.bio && (
                <div>
                  <h3 className="font-medium text-lg mb-2">About</h3>
                  <p className="text-gray-600">
                    {profile.job_seeker_profile.bio}
                  </p>
                </div>
              )}

              {profile.job_seeker_profile.location && (
                <div>
                  <h3 className="font-medium text-lg mb-2">Location</h3>
                  <p className="text-gray-600">
                    {profile.job_seeker_profile.location}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" /> Skills
                </h3>
                {loadingSkills ? (
                  <div className="flex justify-center items-center h-10">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : userSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userSkills.map((userSkill) => (
                      <Badge key={userSkill.id} variant="secondary">
                        {userSkill.skill?.name || "Unknown Skill"}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No skills listed.
                  </p>
                )}
              </div>

              {/* Display Work Experience and Education Sections directly */}
              {(workExperiences.length > 0 ||
                educationExperiences.length > 0) &&
                !loadingExperiences && (
                  <div className="space-y-6 mt-6">
                    {/* Work Experience Section */}
                    {workExperiences.length > 0 && (
                      <div>
                        <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                          <Building className="h-5 w-5 text-primary" /> Work
                          Experience
                        </h3>
                        <div className="space-y-4">
                          {workExperiences.map((exp) => (
                            <div
                              key={exp.id}
                              className="pl-4 border-l-2 border-primary/50"
                            >
                              <h4 className="font-semibold">{exp.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {exp.organization}
                              </p>
                              {exp.location && (
                                <p className="text-xs text-muted-foreground">
                                  {exp.location}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {formatDate(exp.start_date)} -
                                {exp.is_current
                                  ? " Present"
                                  : ` ${formatDate(exp.end_date)}`}
                              </p>
                              {exp.description && (
                                <p className="mt-1 text-sm whitespace-pre-wrap text-gray-700">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education Section */}
                    {educationExperiences.length > 0 && (
                      <div>
                        <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-primary" />{" "}
                          Education
                        </h3>
                        <div className="space-y-4">
                          {educationExperiences.map((exp) => (
                            <div
                              key={exp.id}
                              className="pl-4 border-l-2 border-primary/50"
                            >
                              <h4 className="font-semibold">{exp.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {exp.organization}
                              </p>
                              {exp.location && (
                                <p className="text-xs text-muted-foreground">
                                  {exp.location}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {formatDate(exp.start_date)} -
                                {exp.is_current
                                  ? " Present"
                                  : ` ${formatDate(exp.end_date)}`}
                              </p>
                              {exp.description && (
                                <p className="mt-1 text-sm whitespace-pre-wrap text-gray-700">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              {loadingExperiences && (
                <div className="flex justify-center items-center h-20">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </>
          )}

          {isEmployer && profile?.employer_profile && (
            <>
              <div>
                <h3 className="font-medium text-lg mb-2">Company Name</h3>
                <p className="text-gray-600">
                  {profile.employer_profile.company_name}
                </p>
              </div>
              {/* Add other employer details here if needed */}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;
