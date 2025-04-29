import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProfile } from "@/lib/ProfileContext";
import { getJob, Job, triggerEmployerPowerMatch } from "@/lib/database";
import {
  EmployerPowerMatchesSection,
  EmployerPowerMatchesSectionRef,
} from "@/components/employer/EmployerPowerMatchesSection";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, Zap, Users, RefreshCw, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

export const EmployerPowerMatchesPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { profile, isEmployer } = useProfile();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingMatches, setIsGeneratingMatches] = useState(false);
  const matchesSectionRef = useRef<EmployerPowerMatchesSectionRef>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;

      setLoading(true);
      try {
        const { job: jobData, error } = await getJob(jobId);

        if (error) throw error;
        if (!jobData) throw new Error("Job not found");

        // Check if the logged-in user is the employer of this job
        if (profile?.id !== jobData.employer_id) {
          toast({
            title: "Access Denied",
            description: "You can only view power matches for your own jobs.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        setJob(jobData);
      } catch (err) {
        toast({
          title: "Error",
          description:
            err instanceof Error ? err.message : "Failed to load job details",
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchJobDetails();
    }
  }, [jobId, profile, navigate, toast]);

  // Redirect if user is not an employer
  useEffect(() => {
    if (profile && !isEmployer()) {
      toast({
        title: "Access Denied",
        description: "This page is only accessible to employers",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [profile, isEmployer, navigate, toast]);

  // Function to trigger the power match generation
  const handleTriggerPowerMatch = async () => {
    if (!jobId || !profile) return;

    setIsGeneratingMatches(true);
    try {
      const { data, error } = await triggerEmployerPowerMatch(
        jobId,
        profile.id
      );

      if (error) throw error;

      // Show success message with match generation results
      toast({
        title: "Power Match Generation Complete",
        description: `${data?.message} ${
          data?.new_matches_found || 0
        } new matches found.`,
        variant: "default",
      });

      // Refresh the matches list
      if (matchesSectionRef.current) {
        await matchesSectionRef.current.refresh();
      }
    } catch (err) {
      toast({
        title: "Error Generating Matches",
        description:
          err instanceof Error ? err.message : "Failed to generate matches",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMatches(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (!job) {
    return null; // Should already have been redirected
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <PageHeader>
        <div className="space-y-0.5">
          <h2 className="text-3xl font-bold tracking-tight flex items-center">
            <Button
              variant="ghost"
              className="mr-2 p-0 h-auto"
              onClick={() => navigate(`/jobs/${jobId}`)}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            {job.title}
          </h2>
          <p className="text-muted-foreground">
            Find and invite potential candidates for this position
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/jobs/${jobId}/applicants`)}
            className="flex items-center gap-1"
          >
            <Users className="h-4 w-4" />
            View Applicants
          </Button>
          <Button
            variant={isGeneratingMatches ? "outline" : "default"}
            onClick={handleTriggerPowerMatch}
            disabled={isGeneratingMatches}
            className="flex items-center gap-1"
          >
            {isGeneratingMatches ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Find New Matches
              </>
            )}
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="power-matches" className="w-full">
        <TabsContent value="power-matches" className="w-full">
          {profile && job && (
            <EmployerPowerMatchesSection
              ref={matchesSectionRef}
              employerId={profile.id}
              job={job}
            />
          )}
        </TabsContent>

        <TabsContent value="invited" className="w-full">
          <div className="text-center py-8 text-muted-foreground">
            <p>This feature is coming soon.</p>
            <p className="text-sm mt-2">
              You'll be able to track all candidates you've invited here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
