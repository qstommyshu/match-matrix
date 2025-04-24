import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProfile } from "@/lib/ProfileContext";
import { useNavigate } from "react-router-dom";
import {
  getUserSkills,
  UserSkill,
  getUserExperiencesByType,
  Experience,
} from "@/lib/database";
import { toast } from "@/components/ui/use-toast";
import { UpdateSkillsModal } from "./UpdateSkillsModal";
import { Loader2 } from "lucide-react";

const CandidateProfile = () => {
  const { profile, jobSeekerProfile, loading, refreshProfile } = useProfile();
  const navigate = useNavigate();
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [workExperiences, setWorkExperiences] = useState<Experience[]>([]);
  const [educationExperiences, setEducationExperiences] = useState<
    Experience[]
  >([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [isLoadingExperiences, setIsLoadingExperiences] = useState(false);
  const [isUpdateSkillsModalOpen, setIsUpdateSkillsModalOpen] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      const fetchSkills = async () => {
        setIsLoadingSkills(true);
        try {
          const { userSkills: fetchedSkills, error } = await getUserSkills(
            profile.id
          );
          if (error) throw error;
          setUserSkills(fetchedSkills || []);
        } catch (error) {
          console.error("Failed to fetch user skills:", error);
          toast({
            title: "Error",
            description: "Could not load your skills.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingSkills(false);
        }
      };
      fetchSkills();

      // Fetch work and education experiences
      const fetchExperiences = async () => {
        setIsLoadingExperiences(true);
        try {
          // Fetch work experiences
          const { experiences: workExp, error: workError } =
            await getUserExperiencesByType(profile.id, "work");

          if (workError) throw workError;
          setWorkExperiences(workExp || []);

          // Fetch education experiences
          const { experiences: eduExp, error: eduError } =
            await getUserExperiencesByType(profile.id, "education");

          if (eduError) throw eduError;
          setEducationExperiences(eduExp || []);
        } catch (error) {
          console.error("Failed to fetch user experiences:", error);
          toast({
            title: "Error",
            description: "Could not load your experiences.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingExperiences(false);
        }
      };
      fetchExperiences();
    }
  }, [profile?.id]);

  // Calculate profile completeness based on data
  const calculateProfileCompleteness = () => {
    if (!profile || !jobSeekerProfile) return 0;

    let completedItems = 0;
    const totalItems = 10; // Adjust the total based on your requirements

    // Check basic profile
    if (profile.full_name) completedItems++;
    if (profile.email) completedItems++;

    // Check job seeker profile
    if (jobSeekerProfile.headline) completedItems++;
    if (jobSeekerProfile.bio) completedItems++;
    if (jobSeekerProfile.location) completedItems++;
    if (jobSeekerProfile.years_of_experience) completedItems++;
    if (jobSeekerProfile.desired_role) completedItems++;
    if (jobSeekerProfile.open_to) completedItems++;

    // Check extra items
    if (userSkills.length > 0) completedItems++;
    if (workExperiences.length > 0) completedItems++;

    return Math.round((completedItems / totalItems) * 100);
  };

  if (loading || isLoadingExperiences) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || !jobSeekerProfile) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
        <p className="mb-6">Please complete your profile setup.</p>
        <Button
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity"
          onClick={() => navigate("/profile-setup")}
        >
          Set Up Profile
        </Button>
      </div>
    );
  }

  const handleSkillsUpdate = () => {
    refreshProfile();
  };

  // Format date to display in a readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const profileCompleteness = calculateProfileCompleteness();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="glass mb-8 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile.full_name
                  ? profile.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : profile.email[0].toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 h-6 w-6 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                {profile.full_name || "Update Your Name"}
              </h1>
              <p className="text-gray-600">
                {jobSeekerProfile.headline || "Add Your Professional Headline"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="text-sm text-gray-600">Profile Completeness</div>
              <div className="flex items-center gap-2">
                <Progress value={profileCompleteness} className="h-2 w-40" />
                <span className="text-sm font-medium">
                  {profileCompleteness}%
                </span>
              </div>
            </div>

            <Button
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity"
              onClick={() => navigate("/edit-profile")}
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Experience
                </h3>
                <p className="text-base">
                  {jobSeekerProfile.years_of_experience
                    ? `${jobSeekerProfile.years_of_experience} years`
                    : "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="text-base">
                  {jobSeekerProfile.location || "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                <p className="text-base">
                  {jobSeekerProfile.bio ||
                    "Add your bio to tell employers about yourself"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Skills
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setIsUpdateSkillsModalOpen(true)}
                >
                  Update Skills
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSkills ? (
                <div className="flex justify-center items-center h-10">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userSkills.length > 0 ? (
                    userSkills.map((userSkill) => (
                      <div
                        key={userSkill.id}
                        className="px-3 py-1 bg-neon-purple/10 text-neon-purple text-sm rounded-full"
                      >
                        {userSkill.skill?.name || "Unknown Skill"}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No skills added yet.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Job Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Desired Role
                </h3>
                <p className="text-base">
                  {jobSeekerProfile.desired_role || "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Open To</h3>
                <p className="text-base">
                  {jobSeekerProfile.open_to || "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Salary Expectation
                </h3>
                <p className="text-base">
                  {jobSeekerProfile.salary_expectation || "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Education</h3>
                <p className="text-base">
                  {jobSeekerProfile.education || "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Resume</h3>
                {jobSeekerProfile.resume_url ? (
                  <a
                    href={jobSeekerProfile.resume_url}
                    className="text-neon-purple hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Resume
                  </a>
                ) : (
                  <p className="text-base">No resume uploaded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 lg:col-span-2">
          <Tabs defaultValue="experience" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            </TabsList>

            <TabsContent value="experience">
              <Card className="glass-card border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Work Experience</CardTitle>
                    <CardDescription>
                      Your professional journey so far
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate("/edit-profile?tab=work-experience")
                    }
                  >
                    Add Experience
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {workExperiences.length > 0 ? (
                    workExperiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="border-l-2 border-neon-purple pl-4 pb-4"
                      >
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-lg">{exp.title}</h3>
                          <div className="text-sm text-gray-500">
                            {formatDate(exp.start_date)} -{" "}
                            {exp.is_current
                              ? "Present"
                              : formatDate(exp.end_date)}
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <span>{exp.organization}</span>
                          {exp.location && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{exp.location}</span>
                            </>
                          )}
                        </div>
                        {exp.description && (
                          <p className="mt-2 text-gray-700">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      You haven't added any work experience yet. Add your
                      professional experiences to showcase your career journey.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education">
              <Card className="glass-card border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Education</CardTitle>
                    <CardDescription>Your academic background</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/edit-profile?tab=education")}
                  >
                    Add Education
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {educationExperiences.length > 0 ? (
                    educationExperiences.map((edu) => (
                      <div
                        key={edu.id}
                        className="border-l-2 border-neon-blue pl-4 pb-4"
                      >
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-lg">{edu.title}</h3>
                          <div className="text-sm text-gray-500">
                            {formatDate(edu.start_date)} -{" "}
                            {edu.is_current
                              ? "Present"
                              : formatDate(edu.end_date)}
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <span>{edu.organization}</span>
                          {edu.location && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{edu.location}</span>
                            </>
                          )}
                        </div>
                        {edu.description && (
                          <p className="mt-2 text-gray-700">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      You haven't added any education yet. Add your educational
                      background to enhance your profile.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio">
              <Card className="glass-card border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Portfolio & Projects</CardTitle>
                    <CardDescription>
                      Showcase your work and achievements
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    Add Project
                  </Button>
                </CardHeader>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">
                    You haven't added any projects yet. Showcase your work by
                    adding projects to your portfolio.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {profile && (
        <UpdateSkillsModal
          isOpen={isUpdateSkillsModalOpen}
          onOpenChange={setIsUpdateSkillsModalOpen}
          onUpdate={handleSkillsUpdate}
        />
      )}
    </div>
  );
};

export default CandidateProfile;
