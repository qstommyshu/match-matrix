import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProfile } from "@/lib/ProfileContext";
import { getJob, getJobApplications, Application, Job } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Users, ArrowLeft, ExternalLink } from "lucide-react";

const ViewApplicantsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!jobId) {
        if (isMounted) {
          setError("Job ID is missing.");
          setIsLoading(false);
        }
        return;
      }

      if (!profile) {
        if (isMounted && profile === null) {
          setError("Could not load user profile to verify ownership.");
          setIsLoading(false);
        } else if (isMounted) {
          setIsLoading(true);
        }
        return;
      }

      if (profile.type !== "employer") {
        if (isMounted) {
          setError("Access denied. Only employers can view applicants.");
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) setIsLoading(true);
      setError(null);

      try {
        const { job: fetchedJob, error: jobError } = await getJob(jobId);
        if (!isMounted) return;
        if (jobError) throw jobError;
        if (!fetchedJob) throw new Error("Job not found.");

        if (fetchedJob.employer_id !== profile.id) {
          throw new Error(
            "You do not have permission to view applicants for this job."
          );
        }
        if (isMounted) setJob(fetchedJob);

        const { applications: fetchedApps, error: appsError } =
          await getJobApplications(jobId);
        if (!isMounted) return;
        if (appsError) throw appsError;

        if (isMounted) setApplications(fetchedApps || []);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching applicants:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load applicant data.";
        if (isMounted) {
          setError(errorMessage);
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [jobId, profile, navigate]);

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : error ? (
        <p className="text-red-600 text-center">Error: {error}</p>
      ) : job ? (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6" />
              Applicants for "{job.title}"
            </CardTitle>
            <CardDescription>
              Review candidates who applied for this position.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length > 0 ? (
              <Table>
                <TableCaption>A list of applicants for this job.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">
                        {/* Display full name if available, fall back to email */}
                        {app.user?.full_name || app.user?.email || "N/A"}
                        {app.user?.job_seeker_profile?.headline && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {app.user.job_seeker_profile.headline}
                          </div>
                        )}
                        {app.user?.job_seeker_profile?.years_of_experience && (
                          <div className="text-xs text-muted-foreground">
                            {app.user.job_seeker_profile.years_of_experience}{" "}
                            years experience
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(app.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {/* TODO: Implement status update functionality */}
                        <Badge variant="secondary">{app.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {/* Link to view applicant profile */}
                        {app.user_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/user-profile/${app.user_id}`)
                            }
                          >
                            <ExternalLink className="mr-1 h-3 w-3" /> View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-16">
                <Users className="mx-auto h-12 w-12 mb-4" />
                <p>No applications received for this job yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <p className="text-center text-muted-foreground">
          Job details not found.
        </p> // Should be caught by error state usually
      )}
    </div>
  );
};

export default ViewApplicantsPage;
