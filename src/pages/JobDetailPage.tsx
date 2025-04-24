import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getJob,
  Job,
  getUserApplications,
  createApplication,
  Application,
} from "@/lib/database"; // Import application functions
import { useProfile } from "@/lib/ProfileContext"; // To check if viewer is owner or applicant
import { useAuth } from "@/lib/AuthContext"; // To check if logged in
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  MapPin,
  Briefcase,
  DollarSign,
  CalendarDays,
  UserCheck,
  Send,
  Users,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const { profile, isJobSeeker } = useProfile();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true); // Loading state for application check

  useEffect(() => {
    let isMounted = true;
    if (!jobId) {
      setError("Job ID is missing.");
      setIsLoading(false);
      setCheckingApplication(false);
      return;
    }

    const fetchDetailsAndApplicationStatus = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      setCheckingApplication(true);
      setError(null);
      setHasApplied(false); // Reset application status on job change

      try {
        // Fetch Job Details
        const { job: fetchedJob, error: fetchError } = await getJob(jobId);
        if (!isMounted) return;
        if (fetchError) throw fetchError;
        if (!fetchedJob) throw new Error("Job not found.");
        setJob(fetchedJob);

        // Check Application Status (only if user is logged in seeker)
        if (user && profile && isJobSeeker()) {
          const { applications, error: appError } = await getUserApplications(
            user.id
          );
          if (!isMounted) return;
          if (appError) {
            // Log error but don't block job view
            console.error("Error checking application status:", appError);
          } else {
            const alreadyApplied = applications?.some(
              (app) => app.job_id === jobId
            );
            setHasApplied(!!alreadyApplied);
          }
        } else {
          setHasApplied(false); // Cannot apply if not logged in seeker
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching job details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load job details."
        );
        toast({
          title: "Error",
          description: "Could not load job details.",
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setCheckingApplication(false);
        }
      }
    };

    fetchDetailsAndApplicationStatus();

    return () => {
      isMounted = false;
    };
  }, [jobId, user, profile]); // Rerun if user/profile context changes

  const handleApply = async () => {
    if (!user || !profile || !isJobSeeker() || !jobId || hasApplied) {
      toast({
        title: "Cannot Apply",
        description: "You are either not eligible or have already applied.",
        variant: "default",
      });
      return;
    }

    setIsApplying(true);
    try {
      const { application, error } = await createApplication({
        job_id: jobId,
        user_id: user.id,
        status: "applied", // Explicitly set status
        cover_letter: null, // No cover letter for now
      });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your application has been sent successfully.",
      });
      setHasApplied(true); // Update UI to reflect application
    } catch (err) {
      console.error("Error submitting application:", err);
      toast({
        title: "Application Failed",
        description:
          err instanceof Error ? err.message : "Could not submit application.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">
          Error Loading Job
        </h2>
        <p>{error || "The requested job could not be found."}</p>
        <Button onClick={() => navigate("/jobs")} className="mt-4">
          Back to Jobs
        </Button>
      </div>
    );
  }

  // Determine button state
  const getApplyButton = () => {
    if (!user || !isJobSeeker()) {
      return (
        <Button className="w-full" disabled>
          Login as Job Seeker to Apply
        </Button>
      );
    }
    if (checkingApplication) {
      return (
        <Button className="w-full" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking Status...
        </Button>
      );
    }
    if (hasApplied) {
      return (
        <Button className="w-full" disabled variant="outline">
          Already Applied
        </Button>
      );
    }
    if (isApplying) {
      return (
        <Button className="w-full" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Applying...
        </Button>
      );
    }
    return (
      <Button className="w-full" onClick={handleApply}>
        <Send className="mr-2 h-4 w-4" /> Apply Now
      </Button>
    );
  };

  const isOwner = user && job && job.employer_id === user.id;

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <Card className="glass-card overflow-hidden">
        <CardHeader className="bg-muted/30 p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                {job.job_type || "Not specified"}
              </Badge>
              <CardTitle className="text-3xl font-bold">{job.title}</CardTitle>
              {job.employer && (
                // TODO: Link to a proper company profile page if available
                <span className="text-lg text-muted-foreground">
                  {job.employer.full_name || job.employer.email}
                </span>
              )}
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <Badge
                variant={job.status === "open" ? "default" : "secondary"}
                className={`text-xs ${
                  job.status === "open" ? "bg-green-100 text-green-800" : ""
                }`}
              >
                {job.status}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Posted: {new Date(job.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Job Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 border-b pb-1">
                Job Description
              </h3>
              <div
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: job.description }}
              ></div>
            </div>

            {/* Required Skills Section */}
            {job.required_skills && job.required_skills.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2 border-b pb-1">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar with overview and apply button */}
          <div className="md:col-span-1 space-y-6">
            <Card className="bg-muted/10 border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Job Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {job.location || (job.remote ? "Remote" : "Not specified")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{job.job_type || "Not specified"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {job.salary_min && job.salary_max
                      ? `$${job.salary_min / 1000}k - $${
                          job.salary_max / 1000
                        }k`
                      : job.salary_min
                      ? `$${job.salary_min / 1000}k+`
                      : "Not specified"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span>{job.experience_level || "Not specified"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              {isOwner ? (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/edit-job/${jobId}`)}
                  className="w-full"
                >
                  Edit Job
                </Button>
              ) : (
                getApplyButton()
              )}
              {/* Add button to view applicants if owner */}
              {isOwner && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/jobs/${jobId}/applicants`)} // TODO: Create this route/page
                  className="w-full"
                >
                  <Users className="mr-2 h-4 w-4" /> View Applicants
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobDetailPage;
