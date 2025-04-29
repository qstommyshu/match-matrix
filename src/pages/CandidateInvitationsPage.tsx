import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "@/lib/ProfileContext";
import { getCandidateInvitations, CandidateInvitation } from "@/lib/database";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Inbox, AlertTriangle } from "lucide-react";
import { InvitationCard } from "@/components/job-seeker/InvitationCard";

export const CandidateInvitationsPage: React.FC = () => {
  const { profile } = useProfile();
  const [invitations, setInvitations] = useState<CandidateInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = async () => {
    if (!profile || profile.type !== "job_seeker") {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await getCandidateInvitations(
        profile.id
      );
      if (fetchError) throw fetchError;
      setInvitations(data || []);
    } catch (err) {
      console.error("Error fetching invitations:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to load invitations.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [profile]);

  // Callback function to update the invitation list after a response
  const handleInvitationResponded = (
    invitationId: string,
    newStatus: "accepted" | "declined"
  ) => {
    setInvitations((prevInvitations) =>
      prevInvitations.map((invite) =>
        invite.id === invitationId
          ? {
              ...invite,
              status: newStatus,
              responded_at: new Date().toISOString(),
            }
          : invite
      )
    );
    // Optionally refetch if more complex updates are needed
    // fetchInvitations();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Job Invitations</h1>

      {loading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {!loading && error && (
        <div className="text-center text-red-600 py-16">
          <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
          <p>Error loading invitations: {error}</p>
          <Button variant="outline" onClick={fetchInvitations} className="mt-4">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && invitations.length === 0 && (
        <div className="text-center text-muted-foreground py-16">
          <Inbox className="mx-auto h-12 w-12 mb-4" />
          <p>You have no pending job invitations.</p>
          <Link to="/jobs">
            <Button variant="link" className="mt-2">
              Search for jobs
            </Button>
          </Link>
        </div>
      )}

      {!loading && !error && invitations.length > 0 && (
        <div className="space-y-4">
          {invitations.map((invite) => (
            <InvitationCard
              key={invite.id}
              invitation={invite}
              onResponded={handleInvitationResponded}
            />
          ))}
        </div>
      )}
    </div>
  );
};
