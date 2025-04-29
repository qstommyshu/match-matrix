import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Briefcase,
  Zap,
  Mail,
  Eye,
  UserPlus,
  Filter,
} from "lucide-react";
import {
  getEmployerPowerMatches,
  markEmployerPowerMatchViewed,
  sendCandidateInvitation,
  EmployerPowerMatch,
  Job,
} from "@/lib/database";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EmployerPowerMatchesSectionProps {
  employerId: string;
  job: Job;
}

export interface EmployerPowerMatchesSectionRef {
  refresh: () => Promise<void>;
}

export const EmployerPowerMatchesSection = forwardRef<
  EmployerPowerMatchesSectionRef,
  EmployerPowerMatchesSectionProps
>(({ employerId, job }, ref) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [powerMatches, setPowerMatches] = useState<EmployerPowerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<EmployerPowerMatch | null>(
    null
  );
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [minScore, setMinScore] = useState<number>(0.6); // 60% minimum match threshold

  // Fetch power matches for this job
  const fetchPowerMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await getEmployerPowerMatches(
        employerId,
        job.id,
        { minScore, status: "not_invited", page: 1, pageSize: 10 }
      );

      if (fetchError) throw fetchError;

      setPowerMatches(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load potential matches"
      );
      toast({
        title: "Error Loading Matches",
        description: "Could not load power matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [employerId, job.id, minScore, toast]);

  // Expose the refresh method to parent components
  useImperativeHandle(
    ref,
    () => ({
      refresh: fetchPowerMatches,
    }),
    [fetchPowerMatches]
  );

  useEffect(() => {
    fetchPowerMatches();
  }, [fetchPowerMatches]);

  // Mark a match as viewed
  const handleView = async (match: EmployerPowerMatch) => {
    try {
      if (!match.viewed_at) {
        await markEmployerPowerMatchViewed(match.id, employerId);
        // Update local state to show as viewed
        setPowerMatches((currentMatches) =>
          currentMatches.map((m) =>
            m.id === match.id
              ? { ...m, viewed_at: new Date().toISOString() }
              : m
          )
        );
      }

      // Here you could navigate to a detail view or show more info
      // navigate(`/candidates/${match.user_id}`);
      toast({
        title: "Candidate Viewed",
        description: `You've viewed ${
          match.job_seeker?.full_name || "this candidate"
        }'s profile.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not mark match as viewed.",
        variant: "destructive",
      });
    }
  };

  // Open invitation dialog
  const openInviteDialog = (match: EmployerPowerMatch) => {
    setSelectedMatch(match);
    setInviteMessage(
      `Hi ${
        match.job_seeker?.full_name || "there"
      },\n\nI noticed your profile and think you would be a great fit for our ${
        job.title
      } position. Would you be interested in applying?\n\nLooking forward to your response.`
    );
    setIsInviteDialogOpen(true);
  };

  // Send invitation to a candidate
  const sendInvite = async () => {
    if (!selectedMatch) return;

    setSendingInvite(true);
    try {
      const { data, error: inviteError } = await sendCandidateInvitation(
        selectedMatch.id,
        employerId,
        job.id,
        selectedMatch.user_id,
        inviteMessage
      );

      if (inviteError) throw inviteError;

      // Update local state or remove the invited candidate
      setPowerMatches((currentMatches) =>
        currentMatches.filter((m) => m.id !== selectedMatch.id)
      );

      toast({
        title: "Invitation Sent",
        description: `Successfully invited ${
          selectedMatch.job_seeker?.full_name || "candidate"
        } to apply.`,
      });

      setIsInviteDialogOpen(false);
    } catch (err) {
      toast({
        title: "Error Sending Invitation",
        description:
          err instanceof Error
            ? err.message
            : "Could not send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingInvite(false);
    }
  };

  // Filter matches by score
  const handleScoreFilter = (score: number) => {
    setMinScore(score);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <Zap className="mr-2 h-5 w-5 text-yellow-500" />
            Potential Candidates
          </CardTitle>
          <CardDescription>
            AI-matched candidates for your {job.title} position
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center">
              <Filter className="mr-1 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleScoreFilter(0.5)}>
              All Matches (50%+)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleScoreFilter(0.7)}>
              Good Matches (70%+)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleScoreFilter(0.8)}>
              Strong Matches (80%+)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleScoreFilter(0.9)}>
              Excellent Matches (90%+)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="text-red-600 text-center">Error: {error}</p>
        ) : powerMatches.length > 0 ? (
          powerMatches.map((match) => (
            <div
              key={match.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 glass-card-inner"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">
                    {match.job_seeker?.full_name || "Anonymous Candidate"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {match.job_seeker?.job_seeker_profile?.headline ||
                      "Candidate"}
                    {match.job_seeker?.job_seeker_profile?.location &&
                      ` • ${match.job_seeker.job_seeker_profile.location}`}
                  </p>
                </div>
                <Badge className="bg-purple-100 text-purple-800 ml-2">
                  {Math.round(match.match_score * 100)}% Match
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                {match.job_seeker?.job_seeker_profile?.years_of_experience && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Experience:</span>{" "}
                    {match.job_seeker.job_seeker_profile.years_of_experience}{" "}
                    years
                  </p>
                )}

                {match.job_seeker?.job_seeker_profile?.education && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Education:</span>{" "}
                    {match.job_seeker.job_seeker_profile.education}
                  </p>
                )}

                {match.job_seeker?.job_seeker_profile?.desired_role && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Desired Role:</span>{" "}
                    {match.job_seeker.job_seeker_profile.desired_role}
                  </p>
                )}

                {match.job_seeker?.user_skills &&
                  match.job_seeker.user_skills.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">
                        Skills:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {match.job_seeker.user_skills
                          .slice(0, 5)
                          .map((skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-primary/5"
                            >
                              {skill}
                            </Badge>
                          ))}
                        {match.job_seeker.user_skills.length > 5 && (
                          <Badge variant="outline" className="bg-primary/5">
                            +{match.job_seeker.user_skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                {match.job_seeker?.job_seeker_profile?.bio && (
                  <div className="text-sm mt-2">
                    <span className="font-medium text-muted-foreground">
                      Bio:
                    </span>
                    <p className="mt-1 text-muted-foreground line-clamp-3">
                      {match.job_seeker.job_seeker_profile.bio}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={() => handleView(match)}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  {!match.viewed_at ? "View Profile" : "View Again"}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center"
                  onClick={() => openInviteDialog(match)}
                >
                  <UserPlus className="mr-1 h-4 w-4" />
                  Invite to Apply
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <Briefcase className="mx-auto h-12 w-12 mb-4" />
            <p>No potential matches found for this job.</p>
            <p className="text-sm mt-2">
              Try adjusting your job requirements or filter settings.
            </p>
          </div>
        )}
      </CardContent>

      {/* Invitation Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Candidate to Apply</DialogTitle>
            <DialogDescription>
              Send an invitation to{" "}
              {selectedMatch?.job_seeker?.full_name || "this candidate"} for the{" "}
              {job.title} position.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <Textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              rows={6}
              placeholder="Write a personal message to invite the candidate..."
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={sendInvite}
              disabled={sendingInvite}
              className="flex items-center"
            >
              {sendingInvite ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
});
