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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

              {/* Experience and Education in Tabs */}
              {(workExperiences.length > 0 ||
                educationExperiences.length > 0) && (
                <div className="mt-8">
                  <Tabs defaultValue="experience" className="w-full">
                    <TabsList className="grid grid-cols-2 mb-4">
                      <TabsTrigger value="experience">
                        Work Experience
                      </TabsTrigger>
                      <TabsTrigger value="education">Education</TabsTrigger>
                    </TabsList>

                    <TabsContent value="experience">
                      {loadingExperiences ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : workExperiences.length > 0 ? (
                        <div className="space-y-6">
                          {workExperiences.map((exp) => (
                            <div
                              key={exp.id}
                              className="border-l-4 border-primary pl-4 py-2"
                            >
                              <h4 className="font-semibold text-lg">
                                {exp.title}
                              </h4>
                              <div className="flex items-center space-x-2 text-muted-foreground">
                                <Building className="h-4 w-4" />
                                <span>{exp.organization}</span>
                              </div>
                              {exp.location && (
                                <div className="flex items-center space-x-2 text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span>{exp.location}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {formatDate(exp.start_date)} -{" "}
                                  {exp.is_current
                                    ? "Present"
                                    : formatDate(exp.end_date)}
                                </span>
                              </div>
                              {exp.description && (
                                <p className="mt-2 text-sm text-gray-600">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-4">
                          No work experience listed
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="education">
                      {loadingExperiences ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : educationExperiences.length > 0 ? (
                        <div className="space-y-6">
                          {educationExperiences.map((edu) => (
                            <div
                              key={edu.id}
                              className="border-l-4 border-primary pl-4 py-2"
                            >
                              <h4 className="font-semibold text-lg">
                                {edu.title}
                              </h4>
                              <div className="flex items-center space-x-2 text-muted-foreground">
                                <GraduationCap className="h-4 w-4" />
                                <span>{edu.organization}</span>
                              </div>
                              {edu.location && (
                                <div className="flex items-center space-x-2 text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span>{edu.location}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {formatDate(edu.start_date)} -{" "}
                                  {edu.is_current
                                    ? "Present"
                                    : formatDate(edu.end_date)}
                                </span>
                              </div>
                              {edu.description && (
                                <p className="mt-2 text-sm text-gray-600">
                                  {edu.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-4">
                          No education details listed
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </>
          )}

          {isEmployer && profile?.employer_profile && (
            <>
              {profile.employer_profile.company_name && (
                <div>
                  <h3 className="font-medium text-lg mb-2">Company</h3>
                  <p className="text-gray-600">
                    {profile.employer_profile.company_name}
                  </p>
                </div>
              )}

              {profile.employer_profile.company_description && (
                <div>
                  <h3 className="font-medium text-lg mb-2">
                    Company Description
                  </h3>
                  <p className="text-gray-600">
                    {profile.employer_profile.company_description}
                  </p>
                </div>
              )}

              {profile.employer_profile.website && (
                <div>
                  <h3 className="font-medium text-lg mb-2">Website</h3>
                  <a
                    href={profile.employer_profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {profile.employer_profile.website}
                  </a>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;
