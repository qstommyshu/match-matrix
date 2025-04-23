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
import { Briefcase, FileText, Search, MapPin, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  getJobs,
  Job,
  Profile,
  getUserApplications,
  Application,
} from "@/lib/database";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

// Placeholder type for Recent Applications section
interface ApplicationStub {
  id: number;
  title: string;
  company: string;
  status: string;
}

export const JobSeekerDashboardPage: React.FC = () => {
  const { profile, jobSeekerProfile, isJobSeeker } = useProfile();
  const navigate = useNavigate();

  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
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

        const openJobs = (fetchedJobs || []).filter(
          (job) => job.status === "open"
        );
        setRecommendedJobs(openJobs.slice(0, 5));
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

  // Use the placeholder type
  const recentApplications: ApplicationStub[] = [
    // { id: 1, title: 'Software Engineer', company: 'Tech Corp', status: 'Applied' },
    // { id: 2, title: 'Product Manager', company: 'Innovate Ltd', status: 'Interviewing' },
  ];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold">Welcome back, {displayName}!</h1>

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
                const employerProfile = job.employer as
                  | Profile
                  | null
                  | undefined;
                const employerDisplayName =
                  employerProfile?.full_name || "Unknown Employer";
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
                          {employerDisplayName}
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
                    <p className="text-sm mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Search className="mx-auto h-12 w-12 mb-4" />
                <p>No job recommendations available right now.</p>
              </div>
            )}
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => navigate("/jobs")}>
                Browse All Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Track your job application status.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingApps ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : appsError ? (
            <div className="text-center text-red-600 py-8">
              <p>Error loading applications: {appsError}</p>
            </div>
          ) : applications.length > 0 ? (
            <ul className="space-y-4">
              {applications.map((app) => (
                <li
                  key={app.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 glass-card-inner flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                >
                  <div className="flex-grow">
                    <h4
                      className="font-semibold cursor-pointer hover:underline"
                      onClick={() => navigate(`/jobs/${app.job_id}`)}
                    >
                      {app.job?.title || "Job Title Unavailable"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {app.job?.employer?.full_name || "Company Unavailable"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 mt-2 sm:mt-0">
                    <Badge variant="secondary">{app.status}</Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Applied: {new Date(app.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Briefcase className="mx-auto h-12 w-12 mb-4" />
              <p>You haven't applied to any jobs recently.</p>
            </div>
          )}
          {applications.length > 0 && (
            <div className="mt-4 text-center">
              <Button variant="link">View All Applications</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
