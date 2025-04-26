import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertTriangle, Zap } from "lucide-react";
import { getPowerMatches, PowerMatch, Job } from "@/lib/database"; // Assuming PowerMatch type includes nested job
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

  const isProUser = jobSeekerProfile?.is_pro || false;

  useEffect(() => {
    // Only fetch if user is Pro
    if (isProUser && profile) {
      const fetchMatches = async () => {
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
            err instanceof Error
              ? err.message
              : "Failed to load power matches.";
          setError(msg);
          toast({
            title: "Error Loading Power Matches",
            description: msg,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchMatches();
    }
  }, [isProUser, profile]);

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

  // Don't render anything if not a pro user
  if (!isProUser) {
    return null;
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <CardTitle>Power Matches</CardTitle>
        </div>
        <CardDescription>
          Top job matches found for you. We may auto-apply to these if you don't
          view them soon!
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
            No new Power Matches found for you right now. Check back later!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
