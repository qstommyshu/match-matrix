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
import { updateEmployerProfile, EmployerProfile } from "@/lib/database";
import { useAuth } from "@/lib/AuthContext";

// Predefined list of common benefits
const AVAILABLE_BENEFITS = [
  "Health Insurance",
  "Dental Insurance",
  "Vision Insurance",
  "401(k) Matching",
  "Paid Time Off (PTO)",
  "Unlimited PTO",
  "Parental Leave",
  "Remote Work Options",
  "Flexible Work Schedule",
  "Professional Development Budget",
  "Wellness Programs",
  "Life Insurance",
  "Disability Insurance",
  "Commuter Benefits",
  "Stock Options",
  "Gym Membership/Subsidy",
  "Free Lunch/Snacks",
  // Add more common benefits as needed
].sort();

interface UpdateBenefitsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentBenefits: string[] | null;
  onUpdate: () => void; // Callback after successful update
}

export const UpdateBenefitsModal: React.FC<UpdateBenefitsModalProps> = ({
  isOpen,
  onOpenChange,
  currentBenefits,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [selectedBenefits, setSelectedBenefits] = useState<Set<string>>(
    new Set()
  );
  const [isSaving, setIsSaving] = useState(false);

  // Initialize selected benefits when modal opens or current benefits change
  useEffect(() => {
    if (isOpen) {
      setSelectedBenefits(new Set(currentBenefits || []));
    }
  }, [isOpen, currentBenefits]);

  const handleCheckboxChange = (benefit: string, checked: boolean) => {
    setSelectedBenefits((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(benefit);
      } else {
        newSet.delete(benefit);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const benefitsToSave = [...selectedBenefits]; // Convert Set to Array

      const { error } = await updateEmployerProfile(user.id, {
        benefits: benefitsToSave,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Company benefits have been updated.",
      });
      onUpdate(); // Trigger refresh
      onOpenChange(false); // Close modal
    } catch (error) {
      console.error("Error saving benefits:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save benefits.",
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
          <DialogTitle>Update Company Benefits</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-72 w-full rounded-md border p-4">
          <div className="space-y-2">
            {AVAILABLE_BENEFITS.map((benefit) => (
              <div key={benefit} className="flex items-center space-x-2">
                <Checkbox
                  id={benefit} // Use benefit text as ID
                  checked={selectedBenefits.has(benefit)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(benefit, !!checked)
                  }
                  disabled={isSaving}
                />
                <Label htmlFor={benefit} className="font-normal">
                  {benefit}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSaving}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
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
