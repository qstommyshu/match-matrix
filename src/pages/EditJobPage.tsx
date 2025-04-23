import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PostJobForm } from "@/components/jobs/PostJobForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getJob, Job } from "@/lib/database";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useProfile } from "@/lib/ProfileContext"; // Import useProfile for auth check

const EditJobPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { profile } = useProfile(); // Get current user profile
  const [jobData, setJobData] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    if (!jobId) {
      setError("Job ID is missing.");
      setIsLoading(false);
      return;
    }

    // Wait until the profile is loaded
    if (profile === undefined) {
      // Profile is still loading, wait for the next effect run
      setIsLoading(true); // Ensure loading indicator stays
      return;
    }

    // Handle case where profile is loaded but null (e.g., error during profile fetch)
    if (profile === null) {
      setError("User profile not available.");
      setIsLoading(false);
      return;
    }

    const fetchJobData = async () => {
      // No need to set isLoading true here if effect is triggered correctly
      // It starts as true and is only set false in finally or error conditions
      setError(null);
      try {
        const { job, error: fetchError } = await getJob(jobId);

        if (!isMounted) return; // Don't update state if component unmounted

        if (fetchError) throw fetchError;
        if (!job) throw new Error("Job not found.");

        // Authorization Check: Ensure the current user owns this job
        if (job.employer_id !== profile.id) {
          toast({
            title: "Unauthorized",
            description: "You do not have permission to edit this job.",
            variant: "destructive",
          });
          navigate("/dashboard", { replace: true }); // Redirect if not owner
          // No need to set loading/error state here as we are navigating away
          return; // Stop execution here
        }

        setJobData(job);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching job data for edit:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load job data.";
        setError(errorMessage);
        toast({
          title: "Error",
          description: "Could not load job details for editing.",
          variant: "destructive",
        });
      } finally {
        // Only set loading to false if the component is still mounted
        // and we haven't navigated away due to authorization failure.
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Set loading true *before* starting the fetch
    setIsLoading(true);
    fetchJobData();

    // Cleanup function to set isMounted to false when the component unmounts
    return () => {
      isMounted = false;
    };
    // Dependencies: only run when jobId or profile changes.
    // Profile check handles the initial undefined state.
  }, [jobId, profile, navigate]);

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Job Listing</CardTitle>
          <CardDescription>
            Update the details for your job opening.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="text-red-600 text-center">Error: {error}</p>
          ) : jobData ? (
            <PostJobForm jobId={jobId} initialData={jobData} />
          ) : (
            <p className="text-center text-muted-foreground">
              Could not load job data.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditJobPage;
