import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Zap } from "lucide-react";
import {
  getPowerMatches,
  PowerMatch,
  Job,
  triggerUserPowerMatch,
  TriggerPowerMatchResult,
} from "@/lib/database"; // Assuming PowerMatch type includes nested job
import { useProfile } from "@/lib/ProfileContext";
import { toast } from "@/components/ui/use-toast";
import { PowerMatchCard } from "./PowerMatchCard";

// Placeholder type until PowerMatchCard is created
// const PowerMatchCardPlaceholder = ({ match }: { match: PowerMatchWithJob }) => (
//   <div className="border p-4 rounded-md mb-2 bg-background">
//     <p>Job Title: {match.job?.title || 'N/A'} ({match.match_score}%)</p>
//     <p className="text-xs text-muted-foreground">Status: {match.applied_at ? 'Auto-Applied' : 'Generated'}</p>
//     {/* Add more details and View button later */}
//   </div>
// );

// Define the expected shape after joining in getPowerMatches
type PowerMatchWithJob = PowerMatch & {
  job?: Job & {
    employer?: {
      employer_profile?: { company_name: string } | null;
    } | null;
  };
};

export const PowerMatchesSection: React.FC = () => {
  const { profile, jobSeekerProfile } = useProfile();
  const [powerMatches, setPowerMatches] = useState<PowerMatchWithJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false); // State for manual trigger button

  const isProUser = jobSeekerProfile?.is_pro || false;
  // Determine if user is Pro AND Active for the button enablement
  const isActivePro =
    isProUser && (jobSeekerProfile?.pro_active_status || false);

  // useCallback for fetchMatches to use in useEffect dependency array
  const fetchMatches = useCallback(async () => {
    if (!profile) return;
    setIsLoading(true);
    setError(null);
    try {
      const { powerMatches: fetchedMatches, error: fetchError } =
        await getPowerMatches(profile.id);
      if (fetchError) throw fetchError;
      setPowerMatches(fetchedMatches || []);
    } catch (err) {
      console.error("Error fetching power matches:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to load power matches.";
      setError(msg);
      toast({
        title: "Error Loading Power Matches",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    // Only fetch if user is Pro
    if (isProUser && profile) {
      fetchMatches();
    }
  }, [isProUser, profile, fetchMatches]);

  const handleMatchViewed = (viewedMatchId: string) => {
    // Optimistically update the state to remove the warning/reflect viewed status
    setPowerMatches((prevMatches) =>
      prevMatches.map((match) =>
        match.id === viewedMatchId
          ? { ...match, viewed_at: new Date().toISOString() } // Mark as viewed in local state
          : match
      )
    );
    // Optional: Refetch might be safer if other state depends on viewed_at
    // fetchMatches();
  };

  const handleManualTrigger = async () => {
    if (!profile || !isActivePro) {
      console.log(
        "Manual trigger skipped: Profile missing or user not active Pro."
      );
      return; // Extra check
    }
    setIsTriggering(true);
    console.log(`Attempting manual trigger for user ID: ${profile.id}`); // Log User ID

    try {
      const { data: result, error: rpcError } = await triggerUserPowerMatch(
        profile.id
      );

      // Log the raw result and error regardless of outcome
      console.log("RPC triggerUserPowerMatch raw response:", {
        data: result,
        error: rpcError,
      });

      if (rpcError) {
        // Handle potential errors returned by the wrapper function itself
        console.error("RPC Error Object:", rpcError); // Log detailed error
        throw new Error(rpcError.message || "Failed to call trigger function.");
      }

      // Added check for null/undefined result which might indicate an issue
      if (!result) {
        throw new Error(
          "Received null or undefined result from trigger function wrapper."
        );
      }

      // Handle specific success/error messages from the RPC function's JSON response
      if (result.status === "success") {
        console.log("Trigger success:", result.message);
        toast({
          title: "Power Matches Searched & Applied",
          description: `${result.message} Found and auto-applied to ${result.new_matches_applied} new match(es). Refreshing list...`,
        });
        // Refresh the list after successful trigger
        await fetchMatches();
      } else {
        // Handle specific errors returned from the RPC function (e.g., user not active)
        console.warn("Trigger notice/error from function:", result.message);
        toast({
          title: "Power Match Search Notice",
          description:
            result.message ||
            "Could not trigger power match search at this time.",
          variant: "default", // Use default variant for info/notice messages
        });
      }
    } catch (err) {
      // Catch errors from the RPC call itself or thrown errors
      console.error("Error in handleManualTrigger catch block:", err);
      toast({
        title: "Error Triggering Search",
        description:
          err instanceof Error ? err.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsTriggering(false);
    }
  };

  // Don't render anything if not a pro user
  if (!isProUser) {
    return null;
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <CardTitle>Power Matches</CardTitle>
          </div>
          {isActivePro ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualTrigger}
              disabled={isTriggering || isLoading}
              className="flex-shrink-0"
            >
              {isTriggering ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Find Matches Now
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled
              title="Check in daily to enable manual search"
            >
              <Zap className="mr-2 h-4 w-4 text-muted-foreground" />
              Find Matches Now
            </Button>
          )}
        </div>
        <CardDescription>
          Top job matches found for you. We may auto-withdrawl these
          applications if you don't view them soon!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">
            <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
            <p>Error loading Power Matches: {error}</p>
          </div>
        ) : powerMatches.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {/* Replace Placeholder with PowerMatchCard when ready */}
            {powerMatches.map((match) => (
              <PowerMatchCard
                key={match.id}
                powerMatch={match}
                onViewed={handleMatchViewed}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No new Power Matches found for you right now. Try clicking "Find
            Matches Now" or check back later!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
