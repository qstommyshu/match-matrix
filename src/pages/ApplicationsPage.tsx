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
  Briefcase,
  FilterIcon,
  Loader2,
  ClipboardList,
  ArrowLeft,
} from "lucide-react";
import { getUserApplications, Application } from "@/lib/database";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Application Stage Badge mapping for colors
const getStageBadgeColor = (stage: string | null) => {
  switch (stage) {
    case "Applied":
      return "bg-blue-100 text-blue-800";
    case "Screening":
      return "bg-purple-100 text-purple-800";
    case "Interview":
      return "bg-yellow-100 text-yellow-800";
    case "Offer":
      return "bg-green-100 text-green-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
    case "Withdrawn":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Function to format stage display
const formatStageDisplay = (stage: string | null) => {
  if (!stage) return "Applied";
  return stage;
};

// Application stages for filtering
const stages: Application["stage"][] = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

export const ApplicationsPage: React.FC = () => {
  const { profile, isJobSeeker } = useProfile();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    Application[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    // Redirect if not a job seeker
    if (profile && !isJobSeeker()) {
      navigate("/dashboard");
      return;
    }
  }, [profile, isJobSeeker, navigate]);

  useEffect(() => {
    let isMounted = true;
    const fetchApplications = async () => {
      if (!profile || !isJobSeeker()) {
        if (isMounted) setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { applications: fetchedApps, error: fetchError } =
          await getUserApplications(profile.id);

        if (!isMounted) return;
        if (fetchError) throw fetchError;

        // Sort applications by creation date (newest first)
        const sortedApps = (fetchedApps || []).sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setApplications(sortedApps);
        setFilteredApplications(sortedApps);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching applications:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load applications.";
        setError(errorMessage);
        toast({
          title: "Error Loading Applications",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchApplications();

    return () => {
      isMounted = false;
    };
  }, [profile, isJobSeeker]);

  // Filter applications when active filter changes
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredApplications(applications);
    } else {
      const filtered = applications.filter((app) => app.stage === activeFilter);
      setFilteredApplications(filtered);
    }
  }, [activeFilter, applications]);

  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <PageHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-0.5">
            <h2 className="text-3xl font-bold tracking-tight">
              Your Applications
            </h2>
            <p className="text-muted-foreground">
              Track and manage all your job applications
            </p>
          </div>
        </div>
      </PageHeader>

      {/* Filter Options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by stage:</span>
        </div>
        <div className="flex gap-2">
          <Select value={activeFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stage Tabs Alternative */}
      <Tabs
        defaultValue="all"
        value={activeFilter}
        onValueChange={handleFilterChange}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          {stages.map((stage) => (
            <TabsTrigger key={stage} value={stage}>
              {stage}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Applications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-16">
            <p>Error loading applications: {error}</p>
          </div>
        ) : filteredApplications.length > 0 ? (
          filteredApplications.map((app) => (
            <Card
              key={app.id}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        {app.job?.title || "Untitled Position"}
                      </h3>
                      <Badge className={getStageBadgeColor(app.stage)}>
                        {formatStageDisplay(app.stage)}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">
                        {app.job?.employer_profile?.company_name ||
                          "Unknown Company"}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        <span>{app.job?.job_type || "Full-time"}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span>
                        Applied: {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {app.match_score !== null && (
                      <div className="text-sm">
                        <span className="font-medium">Match Score:</span>{" "}
                        <span className="font-semibold text-primary">
                          {app.match_score}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jobs/${app.job_id}`)}
                    >
                      View Job
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <ClipboardList className="mx-auto h-12 w-12 mb-4" />
            <p>
              {activeFilter === "all"
                ? "You haven't applied to any jobs yet."
                : `No applications in the '${activeFilter}' stage.`}
            </p>
            <Button className="mt-4" onClick={() => navigate("/job-search")}>
              Search for Jobs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsPage;
