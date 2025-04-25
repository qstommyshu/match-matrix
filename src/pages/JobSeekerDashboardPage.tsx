import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProfile } from "@/lib/ProfileContext";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  FileText,
  Search,
  MapPin,
  Loader2,
  Plus,
  ClipboardList,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  getJobs,
  Profile,
  EmployerProfile,
  getUserApplications,
  Application,
} from "@/lib/database";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

// Define the expected Job structure for this component
type JobWithNestedEmployerProfile = {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  location: string | null;
  remote: boolean;
  job_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  experience_level: string | null;
  status: string;
  required_skills: string[] | null;
  created_at: string;
  updated_at: string;
  employer?: Profile & {
    // Nest employer_profile within employer
    employer_profile?: EmployerProfile | null;
  };
  employer_profile?: EmployerProfile;
  // skills?: JobSkill[]; // Add if needed, requires importing JobSkill
};

// Application Stage Badge mapping for colors
const getStageBadgeColor = (stage: string | null) => {
  switch (stage) {
    case "Applied":
      return "bg-blue-100 text-blue-800";
    case "Screening":
      return "bg-purple-100 text-purple-800";
    case "Interview":
      return "bg-yellow-100 text-yellow-800";
    case "Offer":
      return "bg-green-100 text-green-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
    case "Withdrawn":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Function to format stage display
const formatStageDisplay = (stage: string | null) => {
  if (!stage) return "Applied";
  return stage;
};

export const JobSeekerDashboardPage: React.FC = () => {
  const { profile, jobSeekerProfile, isJobSeeker } = useProfile();
  const navigate = useNavigate();

  const [recommendedJobs, setRecommendedJobs] = useState<
    JobWithNestedEmployerProfile[]
  >([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [appsError, setAppsError] = useState<string | null>(null);

  const profileCompleteness = jobSeekerProfile?.profile_completeness || 60;
  const displayName = profile?.full_name || profile?.email || "Job Seeker";

  useEffect(() => {
    let isMounted = true;
    const fetchRecommendedJobs = async () => {
      if (!isMounted) return;
      setIsLoadingJobs(true);
      setJobsError(null);
      try {
        const { jobs: fetchedJobs, error: fetchError } = await getJobs({});
        if (!isMounted) return;
        if (fetchError) throw fetchError;

        const openJobs = (fetchedJobs || [])
          .filter((job) => job.status === "open")
          .slice(0, 5);

        // Cast fetchedJobs to the explicit type when setting state
        setRecommendedJobs(openJobs as JobWithNestedEmployerProfile[]);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching recommended jobs:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load job recommendations.";
        setJobsError(errorMessage);
        toast({
          title: "Error Loading Jobs",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        if (isMounted) setIsLoadingJobs(false);
      }
    };

    if (profile && isJobSeeker()) {
      fetchRecommendedJobs();
    } else {
      if (isMounted) setIsLoadingJobs(false);
    }

    return () => {
      isMounted = false;
    };
  }, [profile, isJobSeeker]);

  useEffect(() => {
    let isMounted = true;
    const fetchApplications = async () => {
      if (!profile || !isJobSeeker()) {
        if (isMounted) setIsLoadingApps(false);
        return;
      }
      if (isMounted) setIsLoadingApps(true);
      setAppsError(null);
      try {
        const { applications: fetchedApps, error: fetchError } =
          await getUserApplications(profile.id);
        if (!isMounted) return;
        if (fetchError) throw fetchError;
        const sortedApps = (fetchedApps || []).sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setApplications(sortedApps);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching applications:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load applications.";
        setAppsError(errorMessage);
        toast({
          title: "Error Loading Applications",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        if (isMounted) setIsLoadingApps(false);
      }
    };

    if (profile) {
      fetchApplications();
    } else {
      if (isMounted) setIsLoadingApps(false);
    }

    return () => {
      isMounted = false;
    };
  }, [profile, isJobSeeker]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <PageHeader>
        <div className="space-y-0.5">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome, {displayName}!
          </h2>
          <p className="text-muted-foreground">
            Find new opportunities and track your job applications.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => navigate("/job-search")}
            className="flex gap-1"
          >
            <Search className="h-4 w-4" /> Find Jobs
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 glass-card">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Keep your profile up-to-date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                Completeness
              </Label>
              <div className="flex items-center gap-2">
                <Progress value={profileCompleteness} className="h-2 w-full" />
                <span className="text-sm font-medium">
                  {profileCompleteness}%
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/edit-profile")}
            >
              <FileText className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/profile")}
            >
              <Briefcase className="mr-2 h-4 w-4" /> View Profile
            </Button>
          </CardContent>
        </Card>

        {/* Recommended Jobs Card */}
        <Card className="md:col-span-2 glass-card">
          <CardHeader>
            <CardTitle>Recommended Jobs</CardTitle>
            <CardDescription>
              Recent job postings relevant to you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingJobs ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : jobsError ? (
              <div className="text-center text-red-600 py-8">
                <p>Error loading jobs: {jobsError}</p>
              </div>
            ) : recommendedJobs.length > 0 ? (
              recommendedJobs.map((job) => {
                const companyName =
                  job.employer_profile?.company_name ||
                  "Company Name Unavailable";
                const postedDate = new Date(
                  job.created_at
                ).toLocaleDateString();

                return (
                  <div
                    key={job.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 glass-card-inner"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {companyName}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {postedDate}
                      </span>
                    </div>
                    {(job.location || job.remote) && (
                      <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>
                          {job.location
                            ? `${job.location}${
                                job.remote ? " (Remote Available)" : ""
                              }`
                            : "Fully Remote"}
                        </span>
                      </div>
                    )}
                    <p className="text-sm mb-3 line-clamp-2">
                      {job.description}
                    </p>
                    {job.required_skills && job.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {job.required_skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View Job
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground">
                No jobs found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Your Applications</CardTitle>
          <CardDescription>
            Track the status of your recent job applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingApps ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : appsError ? (
            <div className="text-center text-red-600 py-8">
              <p>Error loading applications: {appsError}</p>
            </div>
          ) : applications.length > 0 ? (
            applications.slice(0, 5).map((app) => (
              <div
                key={app.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 glass-card-inner flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {app.job?.title || "Untitled Position"}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {app.job?.employer_profile?.company_name ||
                        "Unknown Company"}
                    </span>
                    <span>·</span>
                    <span>
                      Applied: {new Date(app.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStageBadgeColor(app.stage)}>
                    {formatStageDisplay(app.stage)}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/jobs/${app.job_id}`)}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <ClipboardList className="mx-auto h-12 w-12 mb-4" />
              <p>You haven't applied to any jobs yet.</p>
              <Button className="mt-4" onClick={() => navigate("/job-search")}>
                Search for Jobs
              </Button>
            </div>
          )}
          {applications.length > 5 && (
            <div className="text-center">
              <Button variant="link" onClick={() => navigate("/applications")}>
                View All Applications
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
