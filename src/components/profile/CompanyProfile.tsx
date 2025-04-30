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
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/lib/ProfileContext";
import { useNavigate } from "react-router-dom";
import {
  getEmployerJobsWithApplicantCount,
  JobWithApplicantCount,
} from "@/lib/database";
import { Loader2, Briefcase, Users, Zap } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { UpdateBenefitsModal } from "./UpdateBenefitsModal";

const CompanyProfile = () => {
  const { profile, employerProfile, loading, refreshProfile } = useProfile();
  const navigate = useNavigate();

  // State for fetched jobs
  const [activeJobs, setActiveJobs] = useState<JobWithApplicantCount[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [isUpdateBenefitsModalOpen, setIsUpdateBenefitsModalOpen] =
    useState(false);

  // Mock data for additional fields not yet in database
  const additionalData = {
    team: {
      engineering: 40,
      product: 15,
      marketing: 10,
      sales: 20,
      other: 15,
    },
    profileCompleteness: profile && employerProfile ? 75 : 40,
  };

  // useEffect to fetch employer jobs
  useEffect(() => {
    let isMounted = true;
    if (profile?.id) {
      const fetchJobs = async () => {
        if (!isMounted) return;
        setIsLoadingJobs(true);
        setJobsError(null);
        try {
          // Fetch all jobs for this employer
          const { jobs, error } = await getEmployerJobsWithApplicantCount(
            profile.id,
            undefined
          );
          if (!isMounted) return;
          if (error) throw error;
          // Filter for only 'open' jobs before setting state
          const openJobs = (jobs || []).filter((job) => job.status === "open");
          setActiveJobs(openJobs);
        } catch (error) {
          if (!isMounted) return;
          console.error("Failed to fetch company jobs:", error);
          const errorMsg =
            error instanceof Error
              ? error.message
              : "Could not load job postings.";
          setJobsError(errorMsg);
          toast({
            title: "Error Loading Jobs",
            description: errorMsg,
            variant: "destructive",
          });
        } finally {
          if (isMounted) setIsLoadingJobs(false);
        }
      };
      fetchJobs();
    }
    return () => {
      isMounted = false;
    };
  }, [profile]); // Dependency on profile to refetch if employer ID changes

  // Handler to refresh profile after benefits update
  const handleBenefitsUpdate = () => {
    refreshProfile();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">Loading profile...</div>
    );
  }

  if (!profile || !employerProfile) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Company Profile Not Found</h2>
        <p className="mb-6">Please complete your company profile setup.</p>
        <Button
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity"
          onClick={() => navigate("/profile-setup")}
        >
          Set Up Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Company header */}
      <div className="glass mb-8 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {employerProfile.logo_url ? (
                <img
                  src={employerProfile.logo_url}
                  alt={employerProfile.company_name}
                  className="h-20 w-20 rounded-xl object-cover"
                />
              ) : (
                <div className="h-20 w-20 bg-gradient-to-r from-neon-purple to-neon-blue rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                  {employerProfile.company_name[0]}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                {employerProfile.company_name}
              </h1>
              <p className="text-gray-600">
                {employerProfile.industry || "Industry not specified"} •{" "}
                {employerProfile.company_size || "Size not specified"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="text-sm text-gray-600">Profile Completeness</div>
              <div className="flex items-center gap-2">
                <Progress
                  value={additionalData.profileCompleteness}
                  className="h-2 w-40"
                />
                <span className="text-sm font-medium">
                  {additionalData.profileCompleteness}%
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

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Company Info */}
        <div className="space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Company Size
                </h3>
                <p className="text-base">
                  {employerProfile.company_size || "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Website</h3>
                {employerProfile.website ? (
                  <a
                    href={
                      employerProfile.website.startsWith("http")
                        ? employerProfile.website
                        : `https://${employerProfile.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neon-purple hover:underline"
                  >
                    {employerProfile.website.replace(/(^\w+:|^)\/\//, "")}
                  </a>
                ) : (
                  <p className="text-base">Not specified</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Industry</h3>
                <p className="text-base">
                  {employerProfile.industry || "Not specified"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Employee Benefits
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setIsUpdateBenefitsModalOpen(true)}
                >
                  Update Benefits
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {employerProfile.benefits &&
                employerProfile.benefits.length > 0 ? (
                  employerProfile.benefits.map((benefit, i) => (
                    <div
                      key={i}
                      className="px-3 py-1 bg-neon-blue/10 text-neon-blue text-sm rounded-full"
                    >
                      {benefit}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No benefits listed. Click 'Update Benefits' to add some.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Team Composition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(additionalData.team).map(
                ([department, percentage]) => (
                  <div key={department}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{department}</span>
                      <span>{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Description & Jobs */}
        <div className="col-span-1 lg:col-span-2">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="jobs">Open Positions</TabsTrigger>
              <TabsTrigger value="culture">Culture</TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle>About {employerProfile.company_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {employerProfile.company_description ||
                      "No company description available. Add a description to tell job seekers about your company."}
                  </p>

                  <div className="mt-8">
                    <h3 className="font-semibold text-lg mb-4">Why Join Us?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex gap-3 p-4 rounded-lg bg-gray-50">
                        <div className="text-neon-purple">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Innovation</h4>
                          <p className="text-sm text-gray-600">
                            Work on cutting-edge projects that push boundaries
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 p-4 rounded-lg bg-gray-50">
                        <div className="text-neon-blue">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Learning & Growth</h4>
                          <p className="text-sm text-gray-600">
                            Continuous learning opportunities and career
                            advancement
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 p-4 rounded-lg bg-gray-50">
                        <div className="text-neon-green">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Collaborative Culture</h4>
                          <p className="text-sm text-gray-600">
                            Work with talented individuals in a supportive
                            environment
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 p-4 rounded-lg bg-gray-50">
                        <div className="text-neon-pink">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">
                            Competitive Compensation
                          </h4>
                          <p className="text-sm text-gray-600">
                            Above-market salary and comprehensive benefits
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs">
              <Card className="glass-card border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Open Positions</CardTitle>
                    <CardDescription>
                      Current job openings at {employerProfile.company_name}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/post-job")}
                  >
                    Post a Job
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingJobs ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : jobsError ? (
                    <p className="text-red-600 text-center py-8">
                      Error: {jobsError}
                    </p>
                  ) : activeJobs.length > 0 ? (
                    <div className="space-y-4">
                      {activeJobs.map((job) => {
                        const postedDate = new Date(
                          job.created_at
                        ).toLocaleDateString();
                        const locationDisplay =
                          job.location ||
                          (job.remote ? "Remote" : "Location N/A");
                        const jobTypeDisplay = job.job_type || "Type N/A";

                        return (
                          <div
                            key={job.id}
                            className="border rounded-lg p-4 transition-colors hover:bg-gray-50/80 glass-card-inner"
                          >
                            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                              <div>
                                <h3 className="font-semibold text-lg mb-1">
                                  {job.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <Badge
                                    variant={
                                      job.status === "open"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className={
                                      job.status === "open"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }
                                  >
                                    {job.status}
                                  </Badge>
                                  <span>•</span>
                                  <span>{locationDisplay}</span>
                                  <span>•</span>
                                  <span>{jobTypeDisplay}</span>
                                  <span>•</span>
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    {job.applicant_count} Applicant(s)
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1 sm:mt-0 sm:text-right whitespace-nowrap">
                                Posted: {postedDate}
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(`/jobs/${job.id}/applicants`)
                                }
                              >
                                <Users className="mr-1 h-3 w-3" /> View
                                Applicants
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(`/jobs/${job.id}/candidates`)
                                }
                                className="flex items-center"
                              >
                                <Zap className="mr-1 h-3 w-3 text-yellow-500" />{" "}
                                Find Candidates
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/edit-job/${job.id}`)}
                              >
                                Edit Job
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/jobs/${job.id}`)}
                              >
                                View Job Details
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center p-10 border-2 border-dashed rounded-lg">
                      <Briefcase className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                      <h3 className="font-medium text-lg mb-2">
                        No active jobs posted yet
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Start attracting candidates by posting your first job.
                      </p>
                      <Button onClick={() => navigate("/post-job")}>
                        Post a Job
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="culture">
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle>Company Culture</CardTitle>
                  <CardDescription>
                    Share what makes your workplace special
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">
                    You haven't added any content about your company culture
                    yet. Tell potential candidates about your values, work
                    environment, and what makes your company a great place to
                    work.
                  </p>
                  <Button className="mt-4" variant="outline">
                    Add Culture Details
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add the modal component */}
      {employerProfile && (
        <UpdateBenefitsModal
          isOpen={isUpdateBenefitsModalOpen}
          onOpenChange={setIsUpdateBenefitsModalOpen}
          currentBenefits={employerProfile.benefits}
          onUpdate={handleBenefitsUpdate}
        />
      )}
    </div>
  );
};

export default CompanyProfile;
