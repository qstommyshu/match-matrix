import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/lib/ProfileContext";
import { getJobs, Job, updateJob } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2,
  Edit,
  Eye,
  PlusCircle,
  Briefcase,
  XCircle,
  CheckCircle,
  Users,
} from "lucide-react";

const ManageJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchEmployerJobs = async () => {
      if (!profile || profile.type !== "employer") {
        if (isMounted) {
          setError("User is not an employer.");
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) setIsLoading(true);
      setError(null);
      try {
        const { jobs: fetchedJobs, error: fetchError } = await getJobs({
          employerId: profile.id,
        });

        if (!isMounted) return;
        if (fetchError) throw fetchError;

        const sortedJobs = (fetchedJobs || []).sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        if (isMounted) setJobs(sortedJobs);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching employer jobs:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load jobs.";
        if (isMounted) {
          setError(errorMessage);
          toast({
            title: "Error Loading Jobs",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (profile) {
      fetchEmployerJobs();
    } else {
      if (isMounted && profile === null) {
        setError("Could not load user profile.");
        setIsLoading(false);
      } else if (isMounted && profile === undefined) {
        setIsLoading(true);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [profile]);

  const handleUpdateJobStatus = async (
    jobId: string,
    newStatus: "open" | "closed"
  ) => {
    setIsUpdatingStatus(jobId);
    try {
      const { job, error } = await updateJob(jobId, { status: newStatus });
      if (error) throw error;

      toast({
        title: `Job ${newStatus === "open" ? "Reopened" : "Closed"}`,
        description: `Job "${job?.title}" has been ${newStatus}.`,
      });

      setJobs((prevJobs) =>
        prevJobs.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );
    } catch (err) {
      console.error(`Error updating job status to ${newStatus}:`, err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : `Failed to ${newStatus === "open" ? "reopen" : "close"} job.`;
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Your Job Postings</h1>
        <Button onClick={() => navigate("/post-job")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Post New Job
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>All Posted Jobs</CardTitle>
          <CardDescription>
            View, edit, and manage all your job listings here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="text-red-600 text-center">Error: {error}</p>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 glass-card-inner flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <Badge
                        variant={
                          job.status === "open" ? "default" : "secondary"
                        }
                        className={`transition-colors ${
                          job.status === "open"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        Status: {job.status}
                      </Badge>
                      <span>
                        Posted: {new Date(job.created_at).toLocaleDateString()}
                      </span>
                      {/* TODO: Add applicant count indicator later */}
                      {/* <span>Applicants: {job.applicant_count || 0}</span> */}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 mt-3 sm:mt-0 flex-wrap justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jobs/${job.id}/applicants`)}
                      disabled={isUpdatingStatus === job.id}
                    >
                      <Users className="mr-1 h-4 w-4" /> Applicants
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      disabled={isUpdatingStatus === job.id}
                    >
                      <Eye className="mr-1 h-4 w-4" /> View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/edit-job/${job.id}`)}
                      disabled={isUpdatingStatus === job.id}
                    >
                      <Edit className="mr-1 h-4 w-4" /> Edit
                    </Button>
                    {job.status === "open" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 border-red-300 hover:text-red-700"
                        onClick={() => handleUpdateJobStatus(job.id, "closed")}
                        disabled={isUpdatingStatus === job.id}
                      >
                        {isUpdatingStatus === job.id ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-1 h-4 w-4" />
                        )}
                        Close
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:bg-green-50 border-green-300 hover:text-green-700"
                        onClick={() => handleUpdateJobStatus(job.id, "open")}
                        disabled={isUpdatingStatus === job.id}
                      >
                        {isUpdatingStatus === job.id ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-1 h-4 w-4" />
                        )}
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-16">
              <Briefcase className="mx-auto h-12 w-12 mb-4" />
              <p>You haven't posted any jobs yet.</p>
              <Button className="mt-4" onClick={() => navigate("/post-job")}>
                Post Your First Job
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageJobsPage;
