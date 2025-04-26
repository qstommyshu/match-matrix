import React, { useState, useEffect } from "react";
import { getJobs, Job, Profile, EmployerProfile } from "@/lib/database";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { MapPin, Loader2, Search, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Pagination } from "@/components/ui/pagination"; // Assuming pagination component exists

// Type for Job with nested employer profile
type JobWithNestedEmployer = Job & {
  employer?: Profile & {
    employer_profile?: EmployerProfile | null;
  };
};

// Default page size
const PAGE_SIZE = 10;

export const JobSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobWithNestedEmployer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const fetchJobs = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const {
        jobs: fetchedJobs,
        error: fetchError,
        count,
      } = await getJobs({
        search: searchTerm,
        location: locationTerm,
        page,
        pageSize: PAGE_SIZE,
      });
      if (fetchError) throw fetchError;
      setJobs((fetchedJobs as JobWithNestedEmployer[]) || []);
      setTotalJobs(count || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load jobs.";
      setError(errorMessage);
      toast({
        title: "Error Loading Jobs",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1); // Fetch first page on initial load or when search terms change
  }, [searchTerm, locationTerm]); // Re-fetch when search terms change

  const handleSearch = () => {
    fetchJobs(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage: number) => {
    fetchJobs(newPage);
  };

  const totalPages = Math.ceil(totalJobs / PAGE_SIZE);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 glass-card">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Search className="h-6 w-6" /> Job Search
          </CardTitle>
          <CardDescription>Find your next opportunity.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            placeholder="Search by keyword (title, description)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Input
            placeholder="Search by location..."
            value={locationTerm}
            onChange={(e) => setLocationTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Search
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : error ? (
        <p className="text-red-600 text-center">Error: {error}</p>
      ) : jobs.length > 0 ? (
        <div className="space-y-6">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer glass-card-inner"
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>
                  {job.employer?.employer_profile?.company_name ||
                    "Company Name Unavailable"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {job.description}
                </p>
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
                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {job.required_skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Posted: {new Date(job.created_at).toLocaleDateString()}
              </CardFooter>
            </Card>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="ml-2"
              >
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-16">
          No jobs found matching your criteria.
        </p>
      )}
    </div>
  );
};
