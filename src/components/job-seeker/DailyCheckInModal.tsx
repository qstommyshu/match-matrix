import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Activity } from "lucide-react";

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCheckIn: () => void; // Function to call backend check-in
  isCheckingIn: boolean; // To show loading state on button
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  onConfirmCheckIn,
  isCheckingIn,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Need to handle preventing close during check-in if required */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>Confirm Active Job Search</span>
          </DialogTitle>
          <DialogDescription>
            Pro users need to confirm they are actively seeking jobs daily to
            ensure Power Matches are relevant and prioritized.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Click the button below to confirm your status for today.
          </p>
        </div>
        <DialogFooter>
          {/* Optionally disable close button during check-in */}
          {/* <Button variant="outline" onClick={onClose} disabled={isCheckingIn}>Cancel</Button> */}
          <Button
            onClick={onConfirmCheckIn}
            disabled={isCheckingIn}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isCheckingIn ? "Confirming..." : "Yes, I am Actively Seeking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
