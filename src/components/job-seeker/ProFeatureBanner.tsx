import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Rocket } from "lucide-react";

interface ProFeatureBannerProps {
  onUpgradeClick: () => void; // Function to open the upgrade modal
}

export const ProFeatureBanner: React.FC<ProFeatureBannerProps> = ({
  onUpgradeClick,
}) => {
  return (
    <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Rocket className="h-8 w-8" />
          <CardTitle className="text-2xl font-bold">
            Unlock Your Potential!
          </CardTitle>
        </div>
        <CardDescription className="text-purple-100 pt-1">
          Upgrade to Pro to access exclusive features like Power Match
          auto-applying and verified skills.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="secondary"
          className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold"
          onClick={onUpgradeClick}
        >
          Upgrade to Pro
        </Button>
      </CardContent>
    </Card>
  );
};
