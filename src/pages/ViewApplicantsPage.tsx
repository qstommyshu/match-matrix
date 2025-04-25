import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProfile } from "@/lib/ProfileContext";
import {
  getJob,
  getJobApplications,
  Application,
  Job,
  Profile,
  JobSeekerProfile,
  updateApplicationStage,
  batchUpdateApplicationStage,
} from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
import {
  Loader2,
  Users,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  CheckSquare,
  Square,
  Filter,
  MoveRight,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { generateAISummary } from "@/lib/supabase";

// Define the type for applications fetched by the updated getJobApplications
type ApplicationWithSkills = Application & {
  job?: Job; // Job should include required_skills
  user?: Profile & {
    job_seeker_profile?: JobSeekerProfile | null;
    user_skills?: { skill: { name: string } }[]; // Applicant's skills
  };
  ai_summary?: string | null; // Add the ai_summary field to the type
};

// Type for summary state per application
type SummaryState = {
  [applicationId: string]: {
    loading: boolean;
    error: string | null;
    summary: string | null;
  };
};

// Application stages array - must match enum in database
const ApplicationStages = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

// Define the next stage mapping for "Move to Next Round" functionality
const nextStageMap: Partial<
  Record<Application["stage"], Application["stage"]>
> = {
  Applied: "Screening",
  Screening: "Interview",
  Interview: "Offer",
};

// Helper function to get next stage (or null if no next stage)
const getNextStage = (
  currentStage: Application["stage"]
): Application["stage"] | null => {
  return nextStageMap[currentStage] || null;
};

// Helper function to get stage badge color
const getStageBadgeColor = (stage: Application["stage"]) => {
  switch (stage) {
    case "Applied":
      return "bg-blue-100 text-blue-800";
    case "Screening":
      return "bg-purple-100 text-purple-800";
    case "Interview":
      return "bg-amber-100 text-amber-800";
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

const ViewApplicantsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<ApplicationWithSkills[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryStates, setSummaryStates] = useState<SummaryState>({});
  const [stageUpdating, setStageUpdating] = useState<{ [id: string]: boolean }>(
    {}
  );

  // State for batch actions
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<
    string[]
  >([]);
  const [batchActionInProgress, setBatchActionInProgress] = useState(false);
  const [batchStage, setBatchStage] = useState<Application["stage"]>("Applied");

  // State for filtering
  const [stageFilter, setStageFilter] = useState<Application["stage"] | "all">(
    "all"
  );

  // Helper function to check if all applications are selected
  const areAllSelected =
    applications.length > 0 &&
    selectedApplicationIds.length === applications.length;

  // Helper function to check if some applications are selected
  const areSomeSelected =
    selectedApplicationIds.length > 0 &&
    selectedApplicationIds.length < applications.length;

  // Get filtered applications based on selected stage filter
  const filteredApplications = useMemo(() => {
    if (stageFilter === "all") return applications;
    return applications.filter((app) => app.stage === stageFilter);
  }, [applications, stageFilter]);

  // Count applications by stage
  const stageCounts = useMemo(() => {
    const counts: Record<Application["stage"] | "all", number> = {
      all: applications.length,
      Applied: 0,
      Screening: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
      Withdrawn: 0,
    };

    applications.forEach((app) => {
      counts[app.stage]++;
    });

    return counts;
  }, [applications]);

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
        if (isMounted && profile !== null) {
          setIsLoading(true);
        } else if (isMounted && profile === null) {
          setError("Could not load user profile to verify ownership.");
          setIsLoading(false);
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

        const apps = (fetchedApps as ApplicationWithSkills[]) || [];

        if (isMounted) {
          setApplications(apps);

          // Initialize summary states for applications that have AI summaries
          const initialSummaryStates: SummaryState = {};
          apps.forEach((app) => {
            initialSummaryStates[app.id] = {
              loading: false,
              error: null,
              summary: app.ai_summary || null,
            };
          });
          setSummaryStates(initialSummaryStates);
        }
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

    if (profile) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [jobId, profile, navigate]);

  // Helper to format match score and determine badge color
  const formatMatchScore = (score: number | null) => {
    if (score === null || score === undefined) {
      return {
        text: "N/A",
        color: "bg-gray-200",
        textColor: "text-gray-700",
        value: 0,
      };
    }
    let colorClass = "bg-red-100";
    let textColorClass = "text-red-800";
    if (score >= 75) {
      colorClass = "bg-green-100";
      textColorClass = "text-green-800";
    } else if (score >= 50) {
      colorClass = "bg-yellow-100";
      textColorClass = "text-yellow-800";
    }
    return {
      text: `${score}%`,
      color: colorClass,
      textColor: textColorClass,
      value: score,
    };
  };

  // Function to handle generating AI summary for an application
  const handleGenerateSummary = async (applicationId: string) => {
    // Update state to show loading
    setSummaryStates((prev) => ({
      ...prev,
      [applicationId]: {
        loading: true,
        error: null,
        summary: prev[applicationId]?.summary || null,
      },
    }));

    try {
      const { summary, error } = await generateAISummary(applicationId);

      if (error) {
        throw error;
      }

      if (summary) {
        // Update the application in the state with the new summary
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, ai_summary: summary } : app
          )
        );

        // Update summary state
        setSummaryStates((prev) => ({
          ...prev,
          [applicationId]: {
            loading: false,
            error: null,
            summary,
          },
        }));

        toast({
          title: "Summary Generated",
          description: "AI summary has been created successfully.",
        });
      }
    } catch (err) {
      console.error("Error generating summary:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate summary.";

      setSummaryStates((prev) => ({
        ...prev,
        [applicationId]: {
          loading: false,
          error: errorMessage,
          summary: prev[applicationId]?.summary || null,
        },
      }));

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Function to handle stage change
  const handleStageChange = async (
    applicationId: string,
    newStage: Application["stage"]
  ) => {
    setStageUpdating((prev) => ({ ...prev, [applicationId]: true }));

    try {
      const { application, error } = await updateApplicationStage(
        applicationId,
        newStage
      );

      if (error) throw error;

      if (application) {
        // Update the application in the state with the new stage
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, stage: newStage } : app
          )
        );

        toast({
          title: "Stage Updated",
          description: `Application status changed to ${newStage}`,
        });
      }
    } catch (err) {
      console.error("Error updating stage:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update application stage.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setStageUpdating((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  // Function to handle select all checkbox
  const handleSelectAll = () => {
    if (areAllSelected) {
      // If all are selected, deselect all
      setSelectedApplicationIds([]);
    } else {
      // Otherwise select all
      setSelectedApplicationIds(applications.map((app) => app.id));
    }
  };

  // Function to handle individual application selection
  const handleSelectApplication = (applicationId: string, checked: boolean) => {
    if (checked) {
      // Add to selected
      setSelectedApplicationIds((prev) => [...prev, applicationId]);
    } else {
      // Remove from selected
      setSelectedApplicationIds((prev) =>
        prev.filter((id) => id !== applicationId)
      );
    }
  };

  // Function to handle batch stage update
  const handleBatchStageUpdate = async () => {
    if (selectedApplicationIds.length === 0) {
      toast({
        title: "No Applications Selected",
        description: "Please select at least one application to update.",
        variant: "destructive",
      });
      return;
    }

    setBatchActionInProgress(true);

    try {
      const { results, error } = await batchUpdateApplicationStage(
        selectedApplicationIds,
        batchStage
      );

      if (error) throw error;

      // Update local state for successful updates
      if (results) {
        const successfulIds = results
          .filter((result) => result.success)
          .map((result) => result.application_id);

        setApplications((prev) =>
          prev.map((app) =>
            successfulIds.includes(app.id) ? { ...app, stage: batchStage } : app
          )
        );

        // Check if there were any failures
        const failedResults = results.filter((result) => !result.success);

        if (failedResults.length > 0) {
          const failureMessage = `${failedResults.length} application(s) could not be updated.`;
          toast({
            title: "Partial Success",
            description: failureMessage,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: `${successfulIds.length} application(s) updated to ${batchStage}.`,
          });
        }
      }
    } catch (err) {
      console.error("Error updating batch stages:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update application stages.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setBatchActionInProgress(false);
    }
  };

  // Helper to clear selections
  const clearSelections = () => {
    setSelectedApplicationIds([]);
  };

  // Function to move an application to the next stage
  const handleMoveToNextRound = async (applicationId: string) => {
    const application = applications.find((app) => app.id === applicationId);
    if (!application) return;

    const nextStage = getNextStage(application.stage);
    if (!nextStage) {
      toast({
        title: "No next stage",
        description: `Applications in '${application.stage}' stage cannot be moved forward.`,
        variant: "destructive",
      });
      return;
    }

    // Use the existing handleStageChange function
    await handleStageChange(applicationId, nextStage);
  };

  // Function to move batch of applications to next round
  const handleBatchMoveToNextRound = async () => {
    if (selectedApplicationIds.length === 0) {
      toast({
        title: "No Applications Selected",
        description: "Please select at least one application to update.",
        variant: "destructive",
      });
      return;
    }

    // Group applications by current stage
    const applicationsByStage: Record<Application["stage"], string[]> = {
      Applied: [],
      Screening: [],
      Interview: [],
      Offer: [],
      Rejected: [],
      Withdrawn: [],
    };

    // Populate the groups
    selectedApplicationIds.forEach((id) => {
      const app = applications.find((a) => a.id === id);
      if (app) {
        applicationsByStage[app.stage].push(id);
      }
    });

    setBatchActionInProgress(true);

    try {
      // Process each group that has a next stage
      let successCount = 0;
      let failCount = 0;

      for (const [stage, ids] of Object.entries(applicationsByStage)) {
        if (ids.length === 0) continue;

        const nextStage = getNextStage(stage as Application["stage"]);
        if (!nextStage) {
          failCount += ids.length;
          continue;
        }

        // Update this batch to the next stage
        const { results, error } = await batchUpdateApplicationStage(
          ids,
          nextStage
        );

        if (error) throw error;

        if (results) {
          const successful = results.filter((r) => r.success).length;
          successCount += successful;
          failCount += ids.length - successful;

          // Update local state for successful updates
          const successfulIds = results
            .filter((result) => result.success)
            .map((result) => result.application_id);

          setApplications((prev) =>
            prev.map((app) =>
              successfulIds.includes(app.id)
                ? { ...app, stage: nextStage }
                : app
            )
          );
        }
      }

      // Show toast with results
      if (successCount > 0 && failCount === 0) {
        toast({
          title: "Success",
          description: `${successCount} application(s) moved to next stage.`,
        });
      } else if (successCount > 0 && failCount > 0) {
        toast({
          title: "Partial Success",
          description: `${successCount} application(s) moved to next stage. ${failCount} could not be moved (already at final stage or failed).`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "No Changes",
          description: "No applications could be moved to next stage.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error moving applications to next round:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update application stages.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setBatchActionInProgress(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 px-4 mb-16">
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

            {applications.length > 0 && (
              <div className="px-6">
                <Tabs
                  defaultValue="all"
                  value={stageFilter}
                  onValueChange={(value) =>
                    setStageFilter(value as Application["stage"] | "all")
                  }
                  className="w-full"
                >
                  <TabsList className="w-full justify-start overflow-auto py-1">
                    <TabsTrigger
                      value="all"
                      className="flex items-center gap-2"
                    >
                      All
                      <Badge variant="secondary" className="ml-1">
                        {stageCounts.all}
                      </Badge>
                    </TabsTrigger>
                    {ApplicationStages.map((stage) => (
                      <TabsTrigger
                        key={stage}
                        value={stage}
                        className="flex items-center gap-2"
                        disabled={stageCounts[stage] === 0}
                      >
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            stage === "Applied" && "bg-blue-500",
                            stage === "Screening" && "bg-purple-500",
                            stage === "Interview" && "bg-amber-500",
                            stage === "Offer" && "bg-green-500",
                            stage === "Rejected" && "bg-red-500",
                            stage === "Withdrawn" && "bg-gray-500"
                          )}
                        />
                        {stage}
                        <Badge variant="secondary" className="ml-1">
                          {stageCounts[stage]}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <Separator className="my-4" />
              </div>
            )}

            <CardContent>
              {applications.length > 0 ? (
                <>
                  <Table>
                    <TableCaption>
                      A list of applicants for this job.
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={
                              filteredApplications.length > 0 &&
                              selectedApplicationIds.length ===
                                filteredApplications.length
                            }
                            data-state={
                              selectedApplicationIds.length > 0 &&
                              selectedApplicationIds.length <
                                filteredApplications.length
                                ? "indeterminate"
                                : filteredApplications.length > 0 &&
                                  selectedApplicationIds.length ===
                                    filteredApplications.length
                                ? "checked"
                                : "unchecked"
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                // Select all filtered applications
                                setSelectedApplicationIds((prev) => {
                                  const filteredIds = filteredApplications.map(
                                    (app) => app.id
                                  );
                                  return [
                                    ...new Set([...prev, ...filteredIds]),
                                  ];
                                });
                              } else {
                                // Deselect all filtered applications
                                setSelectedApplicationIds((prev) =>
                                  prev.filter(
                                    (id) =>
                                      !filteredApplications.find(
                                        (app) => app.id === id
                                      )
                                  )
                                );
                              }
                            }}
                            aria-label="Select all visible"
                          />
                        </TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead className="w-[120px]">Match</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((app) => {
                        const scoreInfo = formatMatchScore(app.match_score);
                        const applicantSkillNames =
                          app.user?.user_skills?.map((us) => us.skill.name) ||
                          [];
                        const requiredSkills = job.required_skills || [];
                        const summaryState = summaryStates[app.id] || {
                          loading: false,
                          error: null,
                          summary: app.ai_summary || null,
                        };
                        const isSelected = selectedApplicationIds.includes(
                          app.id
                        );
                        const hasNextStage = !!getNextStage(app.stage);

                        return (
                          <TableRow
                            key={app.id}
                            className={isSelected ? "bg-muted/20" : undefined}
                          >
                            <TableCell>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) =>
                                  handleSelectApplication(
                                    app.id,
                                    checked === true
                                  )
                                }
                                aria-label={`Select ${
                                  app.user?.full_name ||
                                  app.user?.email ||
                                  "applicant"
                                }`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {app.user?.full_name || app.user?.email || "N/A"}
                              {app.user?.job_seeker_profile?.headline && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {app.user.job_seeker_profile.headline}
                                </div>
                              )}
                              {app.user?.job_seeker_profile
                                ?.years_of_experience && (
                                <div className="text-xs text-muted-foreground">
                                  {
                                    app.user.job_seeker_profile
                                      .years_of_experience
                                  }{" "}
                                  years experience
                                </div>
                              )}
                              {/* AI Summary section */}
                              {summaryState.summary && (
                                <div className="mt-2 p-2 bg-primary/5 rounded-md text-xs border border-primary/10">
                                  <div className="flex items-center gap-1 text-primary font-medium mb-1">
                                    <Sparkles className="h-3 w-3" />
                                    AI Summary:
                                  </div>
                                  {summaryState.summary}
                                </div>
                              )}
                              {summaryState.loading && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Generating summary...
                                </div>
                              )}
                              {summaryState.error && (
                                <div className="text-xs text-red-500 mt-1">
                                  Error: {summaryState.error}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(app.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-2 cursor-help">
                                    <Progress
                                      value={scoreInfo.value}
                                      className="h-2 w-16"
                                    />
                                    <Badge
                                      variant="secondary"
                                      className={`${scoreInfo.color} ${scoreInfo.textColor} text-xs`}
                                    >
                                      {scoreInfo.text}
                                    </Badge>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs p-3">
                                  <p className="font-semibold text-sm mb-2 border-b pb-1">
                                    Skill Match Breakdown:
                                  </p>
                                  {requiredSkills.length > 0 ? (
                                    <ul className="space-y-1 list-disc list-inside">
                                      {requiredSkills.map((reqSkill) => {
                                        const hasSkill =
                                          applicantSkillNames.includes(
                                            reqSkill
                                          );
                                        return (
                                          <li
                                            key={reqSkill}
                                            className="text-xs"
                                          >
                                            <span
                                              className={cn(
                                                hasSkill
                                                  ? "text-green-700 font-medium"
                                                  : "text-red-600"
                                              )}
                                            >
                                              {reqSkill}
                                            </span>
                                            {hasSkill
                                              ? " (Matched)"
                                              : " (Missing)"}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic">
                                      No required skills specified for this job.
                                    </p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-2">
                                <Badge
                                  className={cn(getStageBadgeColor(app.stage))}
                                >
                                  {app.stage}
                                </Badge>

                                <Select
                                  value={app.stage}
                                  onValueChange={(value) =>
                                    handleStageChange(
                                      app.id,
                                      value as Application["stage"]
                                    )
                                  }
                                  disabled={stageUpdating[app.id]}
                                >
                                  <SelectTrigger className="w-[140px] h-8 text-xs">
                                    <SelectValue placeholder="Change Stage" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ApplicationStages.map((stage) => (
                                      <SelectItem key={stage} value={stage}>
                                        {stage}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                {stageUpdating[app.id] && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Updating...</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right space-y-2">
                              {app.user_id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    navigate(`/user-profile/${app.user_id}`)
                                  }
                                  className="w-full"
                                >
                                  <ExternalLink className="mr-1 h-3 w-3" /> View
                                </Button>
                              )}

                              <Button
                                variant="secondary"
                                size="sm"
                                className="w-full"
                                disabled={summaryState.loading}
                                onClick={() => handleGenerateSummary(app.id)}
                              >
                                {summaryState.loading ? (
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                ) : (
                                  <Sparkles className="mr-1 h-3 w-3" />
                                )}
                                {summaryState.summary
                                  ? "Regenerate"
                                  : "Summarize"}
                              </Button>

                              {hasNextStage && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="w-full"
                                  disabled={stageUpdating[app.id]}
                                  onClick={() => handleMoveToNextRound(app.id)}
                                >
                                  <ChevronRight className="mr-1 h-3 w-3" />
                                  Next Round
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </>
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
          </p>
        )}

        {/* Fixed Batch Action Bar */}
        {selectedApplicationIds.length > 0 && (
          <div
            className="fixed bottom-0 left-0 right-0 p-3 bg-background border-t shadow-lg transform transition-all duration-200 z-50"
            style={{
              boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="container mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Batch Actions:</span>
                  <Badge variant="outline" className="bg-primary/10">
                    {selectedApplicationIds.length} selected
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBatchMoveToNextRound}
                    disabled={batchActionInProgress}
                    className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                  >
                    {batchActionInProgress ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-1 h-3 w-3" />
                    )}
                    Move to Next Round
                  </Button>

                  <Select
                    value={batchStage}
                    onValueChange={(value) =>
                      setBatchStage(value as Application["stage"])
                    }
                    disabled={batchActionInProgress}
                  >
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Select Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {ApplicationStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          Change to: {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    disabled={batchActionInProgress}
                    onClick={handleBatchStageUpdate}
                  >
                    {batchActionInProgress ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <CheckSquare className="mr-1 h-3 w-3" />
                    )}
                    Apply
                  </Button>

                  <Separator orientation="vertical" className="h-6" />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelections}
                    disabled={batchActionInProgress}
                  >
                    Clear selection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ViewApplicantsPage;
