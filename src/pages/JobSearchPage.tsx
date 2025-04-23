import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs, Job, Profile } from "@/lib/database";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Briefcase, DollarSign } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const JobSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all jobs (status/company name refinement needed later)
        const { jobs: fetchedJobs, error: fetchError } = await getJobs({});
        if (fetchError) throw fetchError;
        // Removed client-side status filter - display all jobs for now
        setJobs(fetchedJobs || []);
      } catch (err) {
        console.error("Error fetching all jobs:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load jobs.";
        setError(errorMessage);
        toast({
          title: "Error",
          description: "Could not load job listings.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllJobs();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Browse All Jobs</h1>

      {/* TODO: Add Filtering/Search Bar here later */}

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : error ? (
        <p className="text-red-600 text-center">Error: {error}</p>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
            // Assuming job.employer is of type Profile | null | undefined
            const employerProfile = job.employer as Profile | null | undefined;
            // Use full_name as company_name is not available on Profile type
            const displayName =
              employerProfile?.full_name || "Unknown Employer";

            return (
              <Card
                key={job.id}
                className="glass-card hover:shadow-lg transition-shadow duration-200 flex flex-col"
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold hover:text-primary transition-colors">
                    {/* Make title clickable */}
                    <span
                      className="cursor-pointer"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      {job.title}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {/* Display employer's full name */}
                    {displayName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  {(job.location || job.remote) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {job.location
                          ? `${job.location}${
                              job.remote ? " (Remote Available)" : ""
                            }`
                          : "Fully Remote"}
                      </span>
                    </div>
                  )}
                  {(job.salary_min || job.salary_max) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {job.salary_min
                          ? `$${job.salary_min.toLocaleString()}`
                          : ""}
                        {job.salary_min && job.salary_max ? " - " : ""}
                        {job.salary_max
                          ? `$${job.salary_max.toLocaleString()}`
                          : ""}
                        {job.salary_min || job.salary_max
                          ? " (Annual)"
                          : "Salary not specified"}
                      </span>
                    </div>
                  )}
                  {job.job_type && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 flex-shrink-0" />
                      <span>{job.job_type}</span>
                    </div>
                  )}
                  {/* Trimmed description */}
                  <p className="text-sm text-muted-foreground line-clamp-3 pt-2">
                    {job.description}
                  </p>
                </CardContent>
                <div className="p-4 pt-0 mt-auto">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16">
          <Briefcase className="mx-auto h-12 w-12 mb-4" />
          <p>No jobs found at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default JobSearchPage;
