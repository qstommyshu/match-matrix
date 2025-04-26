import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, Zap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface UpgradeToProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmUpgrade: () => void; // Function to call backend upgrade
  isUpgrading: boolean; // To show loading state on button
}

export const UpgradeToProModal: React.FC<UpgradeToProModalProps> = ({
  isOpen,
  onClose,
  onConfirmUpgrade,
  isUpgrading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Zap className="h-6 w-6 text-purple-600" />
            <span>Upgrade to Match Matrix Pro</span>
          </DialogTitle>
          <DialogDescription>
            Supercharge your job search with exclusive Pro features.
            {/* Pricing info placeholder */}
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-4" />
        <div className="grid gap-4 py-4">
          <h3 className="text-lg font-semibold mb-2">Pro Benefits:</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">Power Match Auto-Apply:</span>
                <p className="text-sm text-muted-foreground">
                  Automatically apply to up to 3 top-matching jobs (>80% score) daily that you haven't applied for.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">Verified Skills Assessments:</span>
                <p className="text-sm text-muted-foreground">
                  Prove your expertise with skill assessments and stand out to employers.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">Active Seeker Status:</span>
                <p className="text-sm text-muted-foreground">
                  Confirm your active job search daily to prioritize your Power Matches.
                </p>
              </div>
            </li>
            {/* Add more benefits as needed */}
          </ul>
        </div>
        <Separator className="my-4" />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpgrading}>
            Maybe Later
          </Button>
          <Button 
            onClick={onConfirmUpgrade} 
            disabled={isUpgrading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isUpgrading ? 'Upgrading...' : 'Confirm Upgrade'}
            {/* Price placeholder */}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 