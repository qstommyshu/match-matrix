import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getJob, Job } from "@/lib/database";
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

  useEffect(() => {
    if (!jobId) {
      setError("Job ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchJobDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { job: fetchedJob, error: fetchError } = await getJob(jobId);
        if (fetchError) throw fetchError;
        if (!fetchedJob) throw new Error("Job not found.");
        setJob(fetchedJob);
      } catch (err) {
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
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const isOwner = user && job && job.employer_id === user.id;

  // TODO: Implement apply functionality
  const handleApply = () => {
    toast({
      title: "Feature Coming Soon!",
      description: "Application functionality is not yet implemented.",
    });
    // navigate(`/apply/${jobId}`);
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
              {/* Use dangerouslySetInnerHTML for potential markdown or render markdown component */}
              <div
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: job.description.replace(/\n/g, "<br />"),
                }}
              />
            </div>

            {/* TODO: Add Skills section here when job skills are implemented */}
            {/* <div>
                             <h3 className="font-semibold text-lg mb-2 border-b pb-1">Required Skills</h3>
                             <div className="flex flex-wrap gap-2">
                                 {job.skills?.map(js => (
                                     <Badge key={js.skill_id} variant="outline">{js.skill?.name}</Badge>
                                 )) || <p className="text-sm text-muted-foreground">No specific skills listed.</p>}
                             </div>
                         </div> */}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="glass-card-inner">
              <CardHeader className="p-4">
                <CardTitle className="text-base">Job Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm space-y-3">
                {job.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {job.location} {job.remote && "(Remote Available)"}
                    </span>
                  </div>
                )}
                {!job.location && job.remote && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Fully Remote</span>
                  </div>
                )}
                {job.salary_min && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>
                      ${job.salary_min.toLocaleString()}
                      {job.salary_max &&
                        ` - $${job.salary_max.toLocaleString()}`}{" "}
                      Annually
                    </span>
                  </div>
                )}
                {job.experience_level && (
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <span>{job.experience_level}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="mt-6">
              {isOwner ? (
                <Button
                  className="w-full"
                  onClick={() => navigate(`/edit-job/${jobId}`)}
                >
                  <Briefcase className="mr-2 h-4 w-4" /> Edit Job Posting
                </Button>
              ) : isJobSeeker() ? (
                <Button className="w-full" onClick={handleApply}>
                  <Send className="mr-2 h-4 w-4" /> Apply Now
                </Button>
              ) : (
                <Button className="w-full" disabled>
                  Login as Job Seeker to Apply
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
