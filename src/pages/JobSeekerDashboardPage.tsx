import React, { useState, useEffect, useCallback } from "react";
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
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Send,
  Mail,
  Award,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  getJobs,
  Profile,
  EmployerProfile,
  getUserApplications,
  Application,
  Job,
  upgradeToProAccount,
  checkInActiveStatus,
  getJobSeekerApplicationsCount,
  getJobSeekerInvitationsCount,
  getJobSeekerOffersCount,
} from "@/lib/database";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { cn, getStageBadgeColor } from "@/lib/utils";
import BrowseAllJobsButton from "@/components/jobs/BrowseAllJobsButton";
import { ProFeatureBanner } from "@/components/job-seeker/ProFeatureBanner";
import { UpgradeToProModal } from "@/components/job-seeker/UpgradeToProModal";
import { DailyCheckInModal } from "@/components/job-seeker/DailyCheckInModal";
import { AssessmentSkillsModal } from "@/components/job-seeker/AssessmentSkillsModal";
import { PowerMatchesSection } from "@/components/job-seeker/PowerMatchesSection";

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
  // skills?: JobSkill[]; // Add if needed, requires importing JobSkill
};

// Application type that includes the nested Job
type ApplicationWithJob = Application & {
  job?: Job;
};

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

  const [recommendedJobs, setRecommendedJobs] = useState<
    JobWithNestedEmployerProfile[]
  >([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [appsError, setAppsError] = useState<string | null>(null);

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);

  // State for job seeker stats
  const [stats, setStats] = useState<{
    totalApplications: number | null;
    totalInvitations: number | null;
    totalOffers: number | null;
  }>({
    totalApplications: null,
    totalInvitations: null,
    totalOffers: null,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const profileCompleteness = jobSeekerProfile?.profile_completeness || 60;
  const displayName = profile?.full_name || profile?.email || "Job Seeker";
  const isProUser = jobSeekerProfile?.is_pro || false;
  const checkInNeeded = useCallback(() => {
    if (!isProUser || !jobSeekerProfile) return false;

    // Already active today? Check status flag first (quick check)
    if (jobSeekerProfile.pro_active_status) {
      // Double check timestamp - paranoia, maybe flag wasn't reset?
      const lastCheckIn = jobSeekerProfile.last_active_check_in;
      if (lastCheckIn) {
        const lastCheckInDate = new Date(lastCheckIn);
        const today = new Date();
        // Check if last check-in was within the last 24 hours (approx)
        if (today.getTime() - lastCheckInDate.getTime() < 24 * 60 * 60 * 1000) {
          return false; // Checked in recently
        }
      }
    }
    // If not active or check-in is old/missing, they need to check in
    return true;
  }, [isProUser, jobSeekerProfile]);

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
        // Fetch applications with job details
        const { applications: fetchedApps, error: fetchError } =
          await getUserApplications(profile.id);
        if (!isMounted) return;
        if (fetchError) throw fetchError;
        const sortedApps = (fetchedApps || []).sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setApplications(sortedApps as ApplicationWithJob[]); // Cast to include job
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

  // Add effect for loading job seeker stats
  useEffect(() => {
    let isMounted = true;
    if (profile?.id && isJobSeeker()) {
      const fetchStats = async () => {
        if (!isMounted) return;
        setIsLoadingStats(true);
        setStatsError(null);
        try {
          const [applicationsResult, invitationsResult, offersResult] =
            await Promise.all([
              getJobSeekerApplicationsCount(profile.id),
              getJobSeekerInvitationsCount(profile.id),
              getJobSeekerOffersCount(profile.id),
            ]);

          if (!isMounted) return;

          if (applicationsResult.error) {
            throw new Error(
              `Failed to fetch applications count: ${applicationsResult.error.message}`
            );
          }
          if (invitationsResult.error) {
            throw new Error(
              `Failed to fetch invitations count: ${invitationsResult.error.message}`
            );
          }
          if (offersResult.error) {
            throw new Error(
              `Failed to fetch offers count: ${offersResult.error.message}`
            );
          }

          setStats({
            totalApplications: applicationsResult.data,
            totalInvitations: invitationsResult.data,
            totalOffers: offersResult.data,
          });
        } catch (error) {
          if (!isMounted) return;
          console.error("Failed to fetch job seeker stats:", error);
          const errorMsg =
            error instanceof Error
              ? error.message
              : "Could not load statistics.";
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

      // Call fetchStats immediately
      fetchStats();
    } else {
      // Not a job seeker or no profile ID, reset stats loading
      if (isMounted) {
        setIsLoadingStats(false);
      }
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

  const handleUpgradeClick = () => {
    setIsUpgradeModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUpgradeModalOpen(false);
  };

  const handleConfirmUpgrade = async () => {
    if (!profile) return;
    setIsUpgrading(true);
    try {
      const { error } = await upgradeToProAccount(profile.id);
      if (error) throw error;
      toast({
        title: "Upgrade Successful!",
        description: "Welcome to Match Matrix Pro!",
      });
      setIsUpgradeModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error("Error upgrading account:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upgrade to Pro.";
      toast({
        title: "Upgrade Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCloseCheckInModal = () => {
    setIsCheckInModalOpen(false);
  };

  const handleConfirmCheckIn = async () => {
    if (!profile) return;
    setIsCheckingIn(true);
    try {
      const { error } = await checkInActiveStatus(profile.id);
      if (error) throw error;
      toast({
        title: "Checked In Successfully!",
        description: "Your active status is confirmed for today.",
      });
      // TODO: Ideally, update profile context instead of reloading
      window.location.reload(); // Reload to reflect new status
      setIsCheckInModalOpen(false);
    } catch (err) {
      console.error("Error during check-in:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to check in.";
      toast({
        title: "Check-in Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <PageHeader>
        <div className="space-y-0.5">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <span>Welcome, {displayName}!</span>
            {isProUser && (
              <Badge
                variant="default"
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-2 py-0.5 rounded-full"
              >
                PRO
              </Badge>
            )}
            {isProUser && !checkInNeeded() && (
              <Badge
                variant="outline"
                className="text-xs border-green-500 text-green-700 font-medium"
              >
                <CheckCircle className="h-3 w-3 mr-1" /> Active Job Seeking
                Status Confirmed Today
              </Badge>
            )}
            {isProUser && checkInNeeded() && (
              <Badge
                variant="outline"
                className="text-xs border-orange-500 text-orange-700 font-medium"
              >
                <AlertTriangle className="h-3 w-3 mr-1" /> Daily Check-in Needed
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground">
            Find new opportunities and track your job applications.
            {isProUser && " Leverage your Pro features below!"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isProUser && checkInNeeded() && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCheckInModalOpen(true)}
            >
              Check In Now
            </Button>
          )}
          <BrowseAllJobsButton />
        </div>
      </PageHeader>

      {!isProUser && <ProFeatureBanner onUpgradeClick={handleUpgradeClick} />}

      {isProUser && <PowerMatchesSection />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card - UPDATED */}
        <Card className="md:col-span-1 glass-card">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Track your job seeking activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats section */}
            {isLoadingStats ? (
              <div className="flex justify-center items-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : statsError ? (
              <p className="text-red-600 text-xs">Error: {statsError}</p>
            ) : (
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Send className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="text-sm">Applications</span>
                  </div>
                  <span className="font-semibold text-lg">
                    {stats.totalApplications ?? "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-green-500" />
                    <span className="text-sm">Invitations</span>
                  </div>
                  <span className="font-semibold text-lg">
                    {stats.totalInvitations ?? "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="mr-2 h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Offers</span>
                  </div>
                  <span className="font-semibold text-lg">
                    {stats.totalOffers ?? "-"}
                  </span>
                </div>
              </div>
            )}

            {/* Profile completeness section */}
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

            {/* Actions section */}
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
            {isProUser && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsAssessmentModalOpen(true)}
              >
                <ShieldCheck className="mr-2 h-4 w-4" /> Manage Assessed Skills
              </Button>
            )}
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
                  job.employer?.employer_profile?.company_name ||
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
            {/* Add Browse All Jobs button below the recommendations */}
            <div className="mt-4 text-center border-t pt-4">
              <BrowseAllJobsButton variant="link" showIcon={false} />
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
                    <Badge
                      className={cn("border", getStageBadgeColor(app.stage))}
                    >
                      {app.stage}
                    </Badge>
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

      <UpgradeToProModal
        isOpen={isUpgradeModalOpen}
        onClose={handleCloseModal}
        onConfirmUpgrade={handleConfirmUpgrade}
        isUpgrading={isUpgrading}
      />
      <DailyCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={handleCloseCheckInModal}
        onConfirmCheckIn={handleConfirmCheckIn}
        isCheckingIn={isCheckingIn}
      />
      <AssessmentSkillsModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
      />
    </div>
  );
};
