import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ExternalLink, CheckCircle } from "lucide-react";
import { PowerMatch, Job, markPowerMatchViewed } from "@/lib/database";
import { toast } from "@/components/ui/use-toast";

// Type definition matching the one in PowerMatchesSection
type PowerMatchWithJob = PowerMatch & {
  job?: Job & {
    employer?: {
      employer_profile?: { company_name: string } | null;
    } | null;
  };
};

interface PowerMatchCardProps {
  powerMatch: PowerMatchWithJob;
  onViewed?: (id: string) => void; // Optional callback after marking as viewed
}

export const PowerMatchCard: React.FC<PowerMatchCardProps> = ({
  powerMatch,
  onViewed,
}) => {
  const navigate = useNavigate();

  const jobTitle = powerMatch.job?.title || "Job Title Unavailable";
  const companyName =
    powerMatch.job?.employer?.employer_profile?.company_name ||
    "Company Unavailable";
  const appliedDate = powerMatch.applied_at
    ? new Date(powerMatch.applied_at)
    : null;
  const createdDate = new Date(powerMatch.created_at);

  const isApplied = !!powerMatch.applied_at;
  const isViewed = !!powerMatch.viewed_at;

  // Calculate time difference for warning
  let needsViewingSoon = false;
  let hoursRemaining = 0;
  if (isApplied && !isViewed) {
    const now = new Date();
    const deadline = new Date(appliedDate!.getTime() + 2 * 24 * 60 * 60 * 1000); // 48 hours after applied
    const diffMs = deadline.getTime() - now.getTime();
    hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    // Show warning if less than ~24 hours remaining
    if (diffMs > 0 && diffMs < 24 * 60 * 60 * 1000) {
      needsViewingSoon = true;
    }
  }

  const handleViewJob = async () => {
    if (!powerMatch.job_id) return;

    // Mark as viewed only if it hasn't been viewed yet
    if (!isViewed) {
      try {
        const { error } = await markPowerMatchViewed(powerMatch.id);
        if (error) {
          throw error;
        }
        console.log(`Marked power match ${powerMatch.id} as viewed.`);
        if (onViewed) {
          onViewed(powerMatch.id);
        }
      } catch (err) {
        console.error("Error marking power match as viewed:", err);
        toast({
          title: "Error",
          description: "Could not mark match as viewed. Please try again.",
          variant: "destructive",
        });
        // Proceed to navigate even if marking fails, maybe?
      }
    }

    navigate(`/jobs/${powerMatch.job_id}`);
  };

  return (
    <div className="border rounded-lg p-4 bg-background shadow-sm relative">
      {/* Status Badges */}
      <div className="absolute top-2 right-2 flex gap-1">
        {isApplied && (
          <Badge
            variant="outline"
            className="text-xs border-blue-500 text-blue-700"
          >
            <CheckCircle className="h-3 w-3 mr-1" /> Auto-Applied
          </Badge>
        )}
        <Badge variant="secondary" className="text-xs">
          {powerMatch.match_score}% Match
        </Badge>
      </div>
      <h3 className="font-semibold text-lg mb-1 pr-24">{jobTitle}</h3>{" "}
      {/* Added padding for badges */}
      <p className="text-sm text-muted-foreground mb-3">{companyName}</p>
      {needsViewingSoon && (
        <div className="mb-3 p-2 rounded-md bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>
            Auto-withdrawal in approx. {hoursRemaining} hours. View job details
            soon!
          </span>
        </div>
      )}
      <p className="text-xs text-muted-foreground mb-4">
        Matched on: {createdDate.toLocaleDateString()}
        {appliedDate && ` | Applied on: ${appliedDate.toLocaleDateString()}`}
      </p>
      <Button variant="default" size="sm" onClick={handleViewJob}>
        <ExternalLink className="mr-2 h-4 w-4" /> View Job Details
      </Button>
    </div>
  );
};
