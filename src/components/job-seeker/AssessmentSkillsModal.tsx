import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ShieldCheck,
  PlusCircle,
  Check,
  ChevronsUpDown,
  X,
  Clock,
} from "lucide-react";
import {
  getAssessmentSkills,
  AssessmentSkill,
  getSkills,
  Skill,
  addAssessmentSkill,
  deleteAssessmentSkill,
} from "@/lib/database";
import { useProfile } from "@/lib/ProfileContext";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow, addDays, isPast } from "date-fns";

interface AssessmentSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssessmentSkillsModal: React.FC<AssessmentSkillsModalProps> = ({
  isOpen,
  onClose,
}): React.ReactElement => {
  const { profile } = useProfile();
  const [assessmentSkills, setAssessmentSkills] = useState<AssessmentSkill[]>(
    []
  );
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(
    new Set()
  );
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchAllData = async () => {
    if (!profile) return;
    setIsLoading(true);
    setError(null);
    try {
      const [assessedResult, allResult] = await Promise.all([
        getAssessmentSkills(profile.id),
        getSkills(),
      ]);

      if (assessedResult.error) throw assessedResult.error;
      if (allResult.error) throw allResult.error;

      setAssessmentSkills(assessedResult.assessmentSkills || []);
      setAllSkills(allResult.skills || []);
    } catch (err) {
      console.error("Error fetching skills data:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to load skills data.";
      setError(msg);
      toast({
        title: "Error Loading Data",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && profile) {
      fetchAllData();
    } else {
      // Reset state when modal closes
      setAssessmentSkills([]);
      setAllSkills([]);
      setSelectedSkillIds(new Set());
      setError(null);
    }
  }, [isOpen, profile]);

  const assessedSkillIds = useMemo(() => {
    return new Set(assessmentSkills.map((s) => s.skill_id));
  }, [assessmentSkills]);

  const availableSkillsToAssess = useMemo(() => {
    return allSkills.filter((skill) => !assessedSkillIds.has(skill.id));
  }, [allSkills, assessedSkillIds]);

  const handleAddSelectedSkills = async () => {
    if (!profile || selectedSkillIds.size === 0) return;

    setIsAdding(true);
    const addedSkills: string[] = [];
    const errors: string[] = [];

    for (const skillId of selectedSkillIds) {
      try {
        const { error: addError } = await addAssessmentSkill({
          user_id: profile.id,
          skill_id: skillId,
          assessment_score: 100, // Default score
        });
        if (addError) throw addError;
        addedSkills.push(
          allSkills.find((s) => s.id === skillId)?.name || skillId
        );
      } catch (err) {
        console.error(`Error adding assessment skill ${skillId}:`, err);
        const skillName =
          allSkills.find((s) => s.id === skillId)?.name || skillId;
        errors.push(skillName);
      }
    }

    setIsAdding(false);

    if (errors.length > 0) {
      toast({
        title: "Some Skills Failed",
        description: `Could not add assessments for: ${errors.join(", ")}.`,
        variant: "destructive",
      });
    }
    if (addedSkills.length > 0) {
      toast({
        title: "Skills Added",
        description: `Successfully added assessments for: ${addedSkills.join(
          ", "
        )}.`,
      });
      setSelectedSkillIds(new Set()); // Clear selection
      fetchAllData(); // Refresh the assessed skills list
    }
  };

  const handleSelectSkill = (skillId: string) => {
    setSelectedSkillIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(skillId)) {
        newSet.delete(skillId);
      } else {
        newSet.add(skillId);
      }
      return newSet;
    });
  };

  const handleDeleteSkill = async (skillToDelete: AssessmentSkill) => {
    if (!skillToDelete) return;
    setIsDeleting(skillToDelete.id);
    try {
      const { error: deleteError } = await deleteAssessmentSkill(
        skillToDelete.id
      );
      if (deleteError) throw deleteError;
      toast({
        title: "Skill Removed",
        description: `Assessment for "${
          skillToDelete.skill?.name || "skill"
        }" removed.`,
      });
      fetchAllData();
    } catch (err) {
      console.error(
        `Error deleting assessment skill ${skillToDelete.id}:`,
        err
      );
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to remove skill assessment.";
      toast({
        title: "Deletion Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const getExpirationStatus = (
    verifiedDate: string | Date
  ): {
    expiresOn: Date;
    isExpired: boolean;
    isExpiringSoon: boolean;
    daysRemaining: number | null;
  } => {
    const verified = new Date(verifiedDate);
    const expiresOn = new Date(verified);
    expiresOn.setDate(expiresOn.getDate() + 90); // Add 90 days

    const now = new Date();
    const diffTime = expiresOn.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isExpired = diffTime <= 0;
    const isExpiringSoon = !isExpired && diffDays <= 7; // Expiring within 7 days
    const daysRemaining = isExpired ? null : diffDays;

    return { expiresOn, isExpired, isExpiringSoon, daysRemaining };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <span>Verified Skill Assessments</span>
          </DialogTitle>
          <DialogDescription>
            View your assessed skills or add new ones to demonstrate your
            proficiency.
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-4" />

        <h3 className="text-md font-semibold mb-2">Your Assessed Skills:</h3>
        <div className="max-h-[250px] overflow-y-auto pr-2 space-y-3 mb-4 border-b pb-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="text-center text-red-600">Error: {error}</p>
          ) : assessmentSkills.length > 0 ? (
            <>
              {assessmentSkills.map((skill) => {
                const { expiresOn, isExpired, isExpiringSoon, daysRemaining } =
                  getExpirationStatus(skill.verified_at);
                const expirationTextClass = cn("text-xs", {
                  "text-red-600 font-medium": isExpired,
                  "text-orange-600 font-semibold": isExpiringSoon,
                  "text-muted-foreground": !isExpired && !isExpiringSoon,
                });

                return (
                  <div
                    key={skill.id}
                    className="flex justify-between items-start p-3 border rounded-md bg-muted/30"
                  >
                    <div className="flex-1 mr-2">
                      <p className="font-medium">
                        {skill.skill?.name || "Skill Name Missing"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Verified on:{" "}
                        {new Date(skill.verified_at).toLocaleDateString()}
                      </p>
                      <p className={expirationTextClass}>
                        <Clock className="inline-block h-3 w-3 mr-1" />
                        {isExpired
                          ? "Assessment Expired"
                          : isExpiringSoon
                          ? `Expires in ${daysRemaining} days`
                          : `Expires on: ${expiresOn.toLocaleDateString()}`}
                      </p>
                    </div>
                    <Badge
                      variant={isExpired ? "destructive" : "secondary"}
                      className="text-base font-semibold whitespace-nowrap"
                    >
                      {skill.assessment_score}%
                    </Badge>
                  </div>
                );
              })}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              You haven't completed any skill assessments yet.
            </p>
          )}
        </div>

        <h3 className="text-md font-semibold mb-2">Add New Verified Skills:</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Select skills from the list to add them as verified (with a default
          100% score).
        </p>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={popoverOpen}
              className="w-full justify-between mb-3"
              disabled={isLoading || availableSkillsToAssess.length === 0}
            >
              {selectedSkillIds.size > 0
                ? `${selectedSkillIds.size} skill${
                    selectedSkillIds.size > 1 ? "s" : ""
                  } selected`
                : availableSkillsToAssess.length === 0
                ? "No unassessed skills available"
                : "Select skills to add..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
            <Command>
              <CommandInput placeholder="Search skills..." />
              <CommandList>
                <CommandEmpty>No skills found.</CommandEmpty>
                <CommandGroup>
                  {availableSkillsToAssess.map((skill) => (
                    <CommandItem
                      key={skill.id}
                      value={skill.name}
                      onSelect={() => handleSelectSkill(skill.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedSkillIds.has(skill.id)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {skill.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-4">
          <Button
            variant="default"
            onClick={handleAddSelectedSkills}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
            disabled={isAdding || selectedSkillIds.size === 0 || isLoading}
          >
            {isAdding ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            Add{" "}
            {selectedSkillIds.size > 0
              ? `${selectedSkillIds.size} Selected`
              : "Selected"}{" "}
            Skill(s)
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
