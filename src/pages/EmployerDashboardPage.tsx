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
  Plus,
  Zap,
  TrendingUp,
  UserCheck,
  Award,
} from "lucide-react";
import {
  getJobs,
  Job,
  getEmployerReceivedApplications,
  Profile,
  getEmployerJobsWithApplicantCount,
  JobWithApplicantCount,
  getEmployerTotalApplicants,
  getEmployerTotalOffersExtended,
  getEmployerActiveJobsCount,
} from "@/lib/database";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import BrowseAllJobsButton from "@/components/jobs/BrowseAllJobsButton";

export const EmployerDashboardPage: React.FC = () => {
  const { profile, employerProfile, isEmployer } = useProfile();
  const navigate = useNavigate();
  const [postedJobs, setPostedJobs] = useState<JobWithApplicantCount[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [recentJobsWithCounts, setRecentJobsWithCounts] = useState<
    JobWithApplicantCount[]
  >([]);
  const [isLoadingRecentJobs, setIsLoadingRecentJobs] = useState(true);
  const [recentJobsError, setRecentJobsError] = useState<string | null>(null);

  const [stats, setStats] = useState<{
    totalActiveJobs: number | null;
    totalApplicants: number | null;
    totalOffers: number | null;
  }>({
    totalActiveJobs: null,
    totalApplicants: null,
    totalOffers: null,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (profile?.id && isEmployer()) {
      const fetchPostedJobs = async () => {
        if (!isMounted) return;
        setIsLoadingJobs(true);
        setJobsError(null);
        try {
          const { jobs, error } = await getEmployerJobsWithApplicantCount(
            profile.id,
            undefined
          );
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
      const fetchRecentJobs = async () => {
        if (!isMounted) return;
        setIsLoadingRecentJobs(true);
        setRecentJobsError(null);
        try {
          const { jobs, error } = await getEmployerJobsWithApplicantCount(
            profile.id,
            5
          );
          if (!isMounted) return;
          if (error) throw error;
          setRecentJobsWithCounts(jobs || []);
        } catch (error) {
          if (!isMounted) return;
          console.error("Failed to fetch recent jobs with counts:", error);
          const errorMsg =
            error instanceof Error
              ? error.message
              : "Could not load recent job data.";
          setRecentJobsError(errorMsg);
          toast({
            title: "Error Loading Recent Jobs",
            description: errorMsg,
            variant: "destructive",
          });
        } finally {
          if (isMounted) setIsLoadingRecentJobs(false);
        }
      };
      fetchRecentJobs();
    }
    return () => {
      isMounted = false;
    };
  }, [profile, isEmployer]);

  useEffect(() => {
    let isMounted = true;
    if (profile?.id && isEmployer()) {
      const fetchStats = async () => {
        if (!isMounted) return;
        setIsLoadingStats(true);
        setStatsError(null);
        try {
          const [activeJobsResult, applicantsResult, offersResult] =
            await Promise.all([
              getEmployerActiveJobsCount(profile.id),
              getEmployerTotalApplicants(profile.id),
              getEmployerTotalOffersExtended(profile.id),
            ]);

          if (!isMounted) return;

          if (activeJobsResult.error) {
            throw new Error(
              `Failed to fetch active jobs count: ${activeJobsResult.error.message}`
            );
          }
          if (applicantsResult.error) {
            throw new Error(
              `Failed to fetch total applicants: ${applicantsResult.error.message}`
            );
          }
          if (offersResult.error) {
            throw new Error(
              `Failed to fetch total offers: ${offersResult.error.message}`
            );
          }

          setStats({
            totalActiveJobs: activeJobsResult.data,
            totalApplicants: applicantsResult.data,
            totalOffers: offersResult.data,
          });
        } catch (error) {
          if (!isMounted) return;
          console.error("Failed to fetch employer stats:", error);
          const errorMsg =
            error instanceof Error
              ? error.message
              : "Could not load employer statistics.";
          setStatsError(errorMsg);
          toast({
            title: "Error Loading Stats",
            description: errorMsg,
            variant: "destructive",
          });
        } finally {
          if (isMounted) setIsLoadingStats(false);
        }
      };

      fetchStats();
    } else {
      if (isMounted) {
        setIsLoadingStats(false);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [profile, isEmployer]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <PageHeader>
        <div className="space-y-0.5">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome, {profile?.full_name || "User"} @{" "}
            {employerProfile?.company_name || "Employer"}!
          </h2>
          <p className="text-muted-foreground">
            Manage your job postings and review applications.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => navigate("/post-job")} className="flex gap-1">
            <Plus className="h-4 w-4" /> Post New Job
          </Button>
          <BrowseAllJobsButton variant="outline" />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 glass-card">
          <CardHeader>
            <CardTitle>At a Glance</CardTitle>
            <CardDescription>Your company's current activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingStats ? (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : statsError ? (
              <p className="text-red-600 text-center">Error: {statsError}</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
                    <span>Active Postings</span>
                  </div>
                  <span className="font-semibold text-lg">
                    {stats.totalActiveJobs ?? "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-green-500" />
                    <span>Total Applicants</span>
                  </div>
                  <span className="font-semibold text-lg">
                    {stats.totalApplicants ?? "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="mr-2 h-5 w-5 text-yellow-500" />
                    <span>Offers Extended</span>
                  </div>
                  <span className="font-semibold text-lg">
                    {stats.totalOffers ?? "-"}
                  </span>
                </div>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate("/edit-company-profile")}
            >
              <Building className="mr-2 h-4 w-4" /> Edit Company Profile
            </Button>
          </CardContent>
        </Card>

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
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{job.applicant_count} Applicant(s)</span>
                      </div>
                      <span>·</span>
                      <span>
                        Posted: {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        View Description
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/edit-job/${job.id}`)}
                      >
                        Edit Post
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/jobs/${job.id}/applicants`)}
                      >
                        View Applicants
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/jobs/${job.id}/candidates`)}
                        className="flex items-center"
                      >
                        <Zap className="mr-1 h-3 w-3 text-yellow-500" />
                        Find Candidates
                      </Button>
                    </div>
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

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Job Activity</CardTitle>
          <CardDescription>
            Overview of applicants for your recent job postings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingRecentJobs ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recentJobsError ? (
            <p className="text-red-600 text-center">Error: {recentJobsError}</p>
          ) : recentJobsWithCounts.length > 0 ? (
            recentJobsWithCounts.map((job) => (
              <div
                key={job.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 glass-card-inner flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{job.applicant_count} Applicant(s)</span>
                    <span className="mx-1">·</span>
                    <Badge
                      variant={job.status === "open" ? "default" : "secondary"}
                      className={`text-xs ${
                        job.status === "open"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {job.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/jobs/${job.id}/applicants`)}
                    className="mb-2"
                  >
                    View Applicants
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/jobs/${job.id}/candidates`)}
                    className="flex items-center"
                  >
                    <Zap className="mr-1 h-3 w-3 text-yellow-500" />
                    Find Candidates
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Briefcase className="mx-auto h-12 w-12 mb-4" />
              <p>No recent job activity to display.</p>
              <Button className="mt-4" onClick={() => navigate("/post-job")}>
                Post a Job
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
