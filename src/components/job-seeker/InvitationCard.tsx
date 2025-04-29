import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CandidateInvitation,
  respondToCandidateInvitation,
} from "@/lib/database";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MailCheck,
  MailX,
  Loader2,
  ExternalLink,
  Building,
  Clock,
} from "lucide-react";
import { useProfile } from "@/lib/ProfileContext";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface InvitationCardProps {
  invitation: CandidateInvitation;
  onResponded?: (invitationId: string, status: "accepted" | "declined") => void; // Callback after responding
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  invitation,
  onResponded,
}) => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [isResponding, setIsResponding] = useState<
    "accepted" | "declined" | null
  >(null);

  const handleResponse = async (status: "accepted" | "declined") => {
    if (!profile || invitation.status !== "pending") return;

    setIsResponding(status);
    try {
      const { error } = await respondToCandidateInvitation(
        invitation.id,
        profile.id,
        status
      );

      if (error) throw error;

      toast({
        title: `Invitation ${status === "accepted" ? "Accepted" : "Declined"}`,
        description: `You have ${status} the invitation for ${
          invitation.job?.title || "this job"
        }.`,
      });

      if (onResponded) {
        onResponded(invitation.id, status);
      }

      // Optionally navigate or update UI further after success
      if (status === "accepted") {
        // Maybe navigate to the application page or job detail page?
        // navigate(`/applications/${invitation.application_id}`)
      }
    } catch (err) {
      console.error("Error responding to invitation:", err);
      toast({
        title: "Error",
        description: `Failed to ${status} invitation. Please try again. ${
          err instanceof Error ? err.message : ""
        }`,
        variant: "destructive",
      });
    } finally {
      setIsResponding(null);
    }
  };

  const getStatusBadgeInfo = (status: CandidateInvitation["status"]) => {
    switch (status) {
      case "pending":
        return { variant: "secondary" as const, className: "" };
      case "accepted":
        return {
          variant: "outline" as const,
          className: "border-green-600 text-green-700 bg-green-50", // Custom styling for accepted
        };
      case "declined":
        return { variant: "destructive" as const, className: "" };
      default:
        return { variant: "secondary" as const, className: "" };
    }
  };

  const statusBadgeInfo = getStatusBadgeInfo(invitation.status);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 p-4 border-b">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-lg mb-1">
              {invitation.job?.title || "Job Title Missing"}
            </CardTitle>
            <CardDescription className="flex items-center gap-1.5 text-sm">
              <Building className="h-3.5 w-3.5" />
              {invitation.employer?.employer_profile?.company_name ||
                "Company Missing"}
              {invitation.job?.location && ` - ${invitation.job.location}`}
              {invitation.job?.remote && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Remote
                </Badge>
              )}
            </CardDescription>
          </div>
          <Badge
            variant={statusBadgeInfo.variant}
            className={cn("capitalize shrink-0", statusBadgeInfo.className)}
          >
            {invitation.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Received: {new Date(invitation.created_at).toLocaleDateString()}
        </p>
        {invitation.message && (
          <div className="text-sm p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-800">
            <p className="font-medium mb-1">Message from Employer:</p>
            <p className="whitespace-pre-wrap">{invitation.message}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/30 p-4 border-t flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/jobs/${invitation.job_id}`)}
        >
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View Job Details
        </Button>
        {invitation.status === "pending" && (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleResponse("declined")}
              disabled={!!isResponding}
            >
              {isResponding === "declined" ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <MailX className="mr-1.5 h-3.5 w-3.5" />
              )}
              Decline
            </Button>
            <Button
              size="sm"
              onClick={() => handleResponse("accepted")}
              disabled={!!isResponding}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isResponding === "accepted" ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <MailCheck className="mr-1.5 h-3.5 w-3.5" />
              )}
              Accept Invitation
            </Button>
          </div>
        )}
        {invitation.status !== "pending" && (
          <p className="text-xs text-muted-foreground italic">
            You responded on{" "}
            {invitation.responded_at
              ? new Date(invitation.responded_at).toLocaleDateString()
              : "N/A"}
          </p>
        )}
      </CardFooter>
    </Card>
  );
};
