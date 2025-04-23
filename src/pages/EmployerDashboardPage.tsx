import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProfile } from "@/lib/ProfileContext";
import { useNavigate } from "react-router-dom";
import {
  Building,
  FilePlus,
  Users,
  Bell,
  Briefcase,
  Loader2,
} from "lucide-react";
import {
  getJobs,
  Job,
  getEmployerReceivedApplications,
  Profile,
} from "@/lib/database";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

// Define type for received applications (matching the return type of getEmployerReceivedApplications)
type ReceivedApplication = {
  id: string;
  created_at: string;
  status: string;
  user_id: string;
  job: { id: string; title: string; employer_id: string } | null;
  user: {
    id: string;
    full_name: string | null;
    email: string;
    job_seeker_profile: {
      id: string;
      headline: string | null;
      years_of_experience: number | null;
    } | null;
  } | null;
};

export const EmployerDashboardPage: React.FC = () => {
  const { profile, employerProfile, isEmployer } = useProfile();
  const navigate = useNavigate();
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [recentApplications, setRecentApplications] = useState<
    ReceivedApplication[]
  >([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [appsError, setAppsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (profile?.id && isEmployer()) {
      const fetchPostedJobs = async () => {
        if (!isMounted) return;
        setIsLoadingJobs(true);
        setJobsError(null);
        try {
          const { jobs, error } = await getJobs({ employerId: profile.id });
          if (!isMounted) return;
          if (error) throw error;
          setPostedJobs(jobs || []);
        } catch (error) {
          if (!isMounted) return;
          console.error("Failed to fetch posted jobs:", error);
          setJobsError(
            error instanceof Error
              ? error.message
              : "Could not load job postings."
          );
        } finally {
          if (isMounted) setIsLoadingJobs(false);
        }
      };
      fetchPostedJobs();
    }
    return () => {
      isMounted = false;
    };
  }, [profile, isEmployer]);

  useEffect(() => {
    let isMounted = true;
    if (profile?.id && isEmployer()) {
      const fetchRecentApps = async () => {
        if (!isMounted) return;
        setIsLoadingApps(true);
        setAppsError(null);
        try {
          const { applications, error } = await getEmployerReceivedApplications(
            profile.id
          );
          if (!isMounted) return;
          if (error) throw error;
          setRecentApplications(applications || []);
        } catch (error) {
          if (!isMounted) return;
          console.error("Failed to fetch recent applications:", error);
          const errorMsg =
            error instanceof Error
              ? error.message
              : "Could not load recent applications.";
          setAppsError(errorMsg);
          toast({
            title: "Error",
            description: errorMsg,
            variant: "destructive",
          });
        } finally {
          if (isMounted) setIsLoadingApps(false);
        }
      };
      fetchRecentApps();
    }
    return () => {
      isMounted = false;
    };
  }, [profile, isEmployer]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold">
        Welcome, {employerProfile?.company_name || "Employer"}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Company Profile Card */}
        <Card className="md:col-span-1 glass-card">
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
            <CardDescription>Manage your company's details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/edit-company-profile")}
            >
              <Building className="mr-2 h-4 w-4" /> Edit Company Profile
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/company-profile")}
            >
              <Building className="mr-2 h-4 w-4" /> View Company Profile
            </Button>
            <Button
              variant="default"
              className="w-full"
              onClick={() => navigate("/post-job")}
            >
              <FilePlus className="mr-2 h-4 w-4" /> Post a New Job
            </Button>
          </CardContent>
        </Card>

        {/* Active Job Postings Card */}
        <Card className="md:col-span-2 glass-card">
          <CardHeader>
            <CardTitle>Active Job Postings</CardTitle>
            <CardDescription>
              Overview of your current listings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingJobs ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : jobsError ? (
              <p className="text-red-600 text-center">Error: {jobsError}</p>
            ) : postedJobs.length > 0 ? (
              postedJobs.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 glass-card-inner flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge
                        variant={
                          job.status === "open" ? "default" : "secondary"
                        }
                        className={
                          job.status === "open"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {job.status}
                      </Badge>
                      <span>·</span>
                      <span>
                        Posted: {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/edit-job/${job.id}`)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Briefcase className="mx-auto h-12 w-12 mb-4" />
                <p>You haven't posted any jobs yet.</p>
                <Button className="mt-4" onClick={() => navigate("/post-job")}>
                  Post Your First Job
                </Button>
              </div>
            )}
            {postedJobs.length > 0 && (
              <div className="mt-4 text-center">
                <Button variant="link" onClick={() => navigate("/manage-jobs")}>
                  Manage All Jobs
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>
            Latest candidates applying to your jobs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingApps ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : appsError ? (
            <p className="text-red-600 text-center">Error: {appsError}</p>
          ) : recentApplications.length > 0 ? (
            <ul className="space-y-4">
              {recentApplications.map((app) => {
                // Safely access potentially nested data
                const applicantName =
                  app.user?.full_name || app.user?.email || "Unknown Applicant";
                const applicantHeadline =
                  app.user?.job_seeker_profile?.headline;
                const experienceYears =
                  app.user?.job_seeker_profile?.years_of_experience;
                const jobTitle = app.job?.title || "Unknown Job";
                const jobId = app.job?.id;
                const appliedDate = new Date(
                  app.created_at
                ).toLocaleDateString();

                return (
                  <li
                    key={app.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 glass-card-inner flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                  >
                    <div className="flex-grow">
                      <h4 className="font-semibold">{applicantName}</h4>
                      {applicantHeadline && (
                        <p className="text-sm text-muted-foreground">
                          {applicantHeadline}
                        </p>
                      )}
                      {experienceYears && (
                        <span className="text-xs text-muted-foreground">
                          {experienceYears} years experience
                        </span>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Applied for:{" "}
                        {jobId ? (
                          <span
                            className="cursor-pointer hover:underline"
                            onClick={() => navigate(`/jobs/${jobId}`)}
                          >
                            {jobTitle}
                          </span>
                        ) : (
                          <span>{jobTitle}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 mt-2 sm:mt-0">
                      <Badge variant="secondary">{app.status}</Badge>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {appliedDate}
                      </span>
                      {/* Link to view applicant profile */}
                      {app.user_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/user-profile/${app.user_id}`)
                          }
                        >
                          View Profile
                        </Button>
                      )}
                      {/* Link to view all applicants for that specific job */}
                      {jobId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/jobs/${jobId}/applicants`)}
                        >
                          View Applicants
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Bell className="mx-auto h-12 w-12 mb-4" />
              <p>No recent applications found.</p>
            </div>
          )}
          {/* Optionally link to a full application history page for the employer */}
          {recentApplications.length > 0 && (
            <div className="mt-4 text-center">
              {/* TODO: Create /employer-applications page */}
              <Button variant="link">View All Received Applications</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
