import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  getSkills,
  getUserSkills,
  addUserSkill,
  removeUserSkill,
  Skill,
  UserSkill,
} from "@/lib/database";
import { useAuth } from "@/lib/AuthContext"; // Assuming useAuth provides the user

interface UpdateSkillsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdate: () => void; // Callback after successful update
}

export const UpdateSkillsModal: React.FC<UpdateSkillsModalProps> = ({
  isOpen,
  onOpenChange,
  onUpdate,
}) => {
  const { user } = useAuth(); // Get the authenticated user
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all skills and user's current skills
  useEffect(() => {
    if (isOpen && user) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [skillsResult, userSkillsResult] = await Promise.all([
            getSkills(),
            getUserSkills(user.id),
          ]);

          if (skillsResult.error) throw skillsResult.error;
          if (userSkillsResult.error) throw userSkillsResult.error;

          setAllSkills(skillsResult.skills || []);
          const currentUserSkills = userSkillsResult.userSkills || [];
          setUserSkills(currentUserSkills);
          setSelectedSkillIds(
            new Set(currentUserSkills.map((us) => us.skill_id))
          );
        } catch (error) {
          console.error("Error fetching skills data:", error);
          toast({
            title: "Error",
            description: "Failed to load skills data.",
            variant: "destructive",
          });
          onOpenChange(false); // Close modal on error
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, user, onOpenChange]);

  const handleCheckboxChange = (skillId: string, checked: boolean) => {
    setSelectedSkillIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(skillId);
      } else {
        newSet.delete(skillId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const initialSkillIds = new Set(userSkills.map((us) => us.skill_id));
      const skillsToAdd = [...selectedSkillIds].filter(
        (id) => !initialSkillIds.has(id)
      );
      const skillsToRemove = userSkills.filter(
        (us) => !selectedSkillIds.has(us.skill_id)
      );

      // Perform add operations
      const addPromises = skillsToAdd.map((skillId) =>
        addUserSkill({
          user_id: user.id,
          skill_id: skillId,
          proficiency_level: 3, // Default proficiency
        })
      );

      // Perform remove operations
      const removePromises = skillsToRemove.map((userSkill) =>
        removeUserSkill(userSkill.id)
      );

      const results = await Promise.allSettled([
        ...addPromises,
        ...removePromises,
      ]);

      let hasError = false;
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `Error processing skill update (index ${index}):`,
            result.reason
          );
          hasError = true;
        } else if (result.value?.error) {
          console.error(
            `Error processing skill update (index ${index}):`,
            result.value.error
          );
          hasError = true;
        }
      });

      if (hasError) {
        throw new Error(
          "Some skill updates failed. Check console for details."
        );
      }

      toast({
        title: "Success",
        description: "Your skills have been updated.",
      });
      onUpdate(); // Trigger refresh and close modal
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving skills:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save skills.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Skills</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="h-72 w-full rounded-md border p-4">
            <div className="space-y-2">
              {allSkills.length > 0 ? (
                allSkills.map((skill) => (
                  <div key={skill.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={skill.id}
                      checked={selectedSkillIds.has(skill.id)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(skill.id, !!checked)
                      }
                      disabled={isSaving}
                    />
                    <Label htmlFor={skill.id} className="font-normal">
                      {skill.name}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No skills available.
                </p>
              )}
            </div>
          </ScrollArea>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSaving}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
