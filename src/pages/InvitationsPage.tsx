import React, { useState, useEffect, useCallback } from "react";
import { useProfile } from "@/lib/ProfileContext";
import {
  getCandidateInvitations,
  respondToCandidateInvitation,
  CandidateInvitation,
  createApplication,
} from "@/lib/database";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2,
  MailCheck, // Icon for Accepted
  MailX, // Icon for Declined
  Inbox, // Icon for Pending
  AlertTriangle, // Icon for Error
  Check, // Icon for Accept button
  X, // Icon for Decline button
  CheckCircle, // Icon for Applied
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export const InvitationsPage: React.FC = () => {
  const { profile } = useProfile();
  const [invitations, setInvitations] = useState<CandidateInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null); // Track which invitation is being responded to

  const fetchInvitations = useCallback(async () => {
    if (!profile || profile.type !== "job_seeker") return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await getCandidateInvitations(
        profile.id
      );
      if (fetchError) throw fetchError;
      console.log("data is ");
      console.log(data);
      setInvitations(data || []);
    } catch (err) {
      console.error("Error fetching invitations:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to load invitations.";
      setError(msg);
      toast({
        title: "Error Loading Invitations",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleResponse = async (
    invitationId: string,
    status: "accepted" | "declined"
  ) => {
    if (!profile) return;
    setRespondingId(invitationId);
    try {
      const { error: responseError } = await respondToCandidateInvitation(
        invitationId,
        profile.id,
        status
      );
      if (responseError) throw responseError;

      // Update local state optimistically
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId
            ? { ...inv, status: status, responded_at: new Date().toISOString() }
            : inv
        )
      );

      // If accepted, automatically apply to the job
      if (status === "accepted") {
        const invitation = invitations.find((inv) => inv.id === invitationId);
        if (invitation?.job_id) {
          try {
            const { application, error: applyError } = await createApplication({
              job_id: invitation.job_id,
              user_id: profile.id,
              cover_letter: `Applied via direct invitation from ${
                invitation.employer?.employer_profiles?.company_name ||
                "employer"
              }.`,
              status: "pending",
              stage: "Applied",
            });

            if (applyError) throw applyError;

            toast({
              title: "Applied to Job",
              description: "You've automatically applied to this job.",
              variant: "default",
            });
          } catch (applyErr) {
            console.error("Error auto-applying to job:", applyErr);
            toast({
              title: "Application Issue",
              description:
                "Invitation accepted, but there was an issue auto-applying to the job.",
              variant: "destructive",
            });
          }
        }
      }

      toast({
        title: `Invitation ${status === "accepted" ? "Accepted" : "Declined"}`,
        description:
          status === "accepted"
            ? "You have accepted the invitation and applied to the job."
            : "You have declined the invitation.",
      });
    } catch (err) {
      console.error("Error responding to invitation:", err);
      toast({
        title: "Error Responding",
        description:
          err instanceof Error ? err.message : "Failed to update invitation.",
        variant: "destructive",
      });
    } finally {
      setRespondingId(null);
    }
  };

  const getStatusBadge = (status: CandidateInvitation["status"]) => {
    switch (status) {
      case "accepted":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-700 border-green-200"
          >
            <MailCheck className="mr-1 h-3 w-3" /> Accepted
          </Badge>
        );
      case "declined":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-700">
            <MailX className="mr-1 h-3 w-3" /> Declined
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge variant="secondary">
            <Inbox className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Job Invitations</h1>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-16">
          <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
          <p>Error loading invitations: {error}</p>
        </div>
      ) : invitations.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          <Inbox className="mx-auto h-12 w-12 mb-4" />
          <p>You have no pending job invitations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <Card
              key={invitation.id}
              className={cn(
                "transition-opacity",
                respondingId === invitation.id && "opacity-50"
              )}
            >
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle>
                      {invitation.job?.title || "Job Title Missing"}
                    </CardTitle>
                    <CardDescription>
                      Invited by{" "}
                      {invitation.employer?.employer_profiles?.company_name ||
                        invitation.employer?.full_name || // Fallback to employer name
                        "Company Unavailable"}
                      {invitation.job?.location &&
                        ` - ${invitation.job.location}`}
                      {invitation.job?.remote && " (Remote)"}
                    </CardDescription>
                  </div>
                  {getStatusBadge(invitation.status)}
                </div>
              </CardHeader>
              <CardContent>
                {invitation.message && (
                  <div className="text-sm p-3 bg-muted/50 border rounded-md mb-4">
                    <p className="font-medium mb-1">Message from Employer:</p>
                    <p className="whitespace-pre-wrap">{invitation.message}</p>
                  </div>
                )}
                {invitation.status === "accepted" && (
                  <div className="flex items-center text-green-600 text-sm mt-2 mb-1">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>You've applied to this job</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Invited{" "}
                  {formatDistanceToNow(new Date(invitation.created_at), {
                    addSuffix: true,
                  })}
                  {invitation.responded_at &&
                    ` | Responded ${formatDistanceToNow(
                      new Date(invitation.responded_at),
                      { addSuffix: true }
                    )}`}
                </p>
              </CardContent>
              {invitation.status === "pending" && (
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResponse(invitation.id, "declined")}
                    disabled={respondingId === invitation.id}
                  >
                    {respondingId === invitation.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="mr-1 h-4 w-4" />
                    )}
                    Decline
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleResponse(invitation.id, "accepted")}
                    disabled={respondingId === invitation.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {respondingId === invitation.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-1 h-4 w-4" />
                    )}
                    Accept
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
