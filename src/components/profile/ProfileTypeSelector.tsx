import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BriefcaseIcon, UserIcon } from "lucide-react";

interface ProfileTypeSelectorProps {
  onSelect: (type: "job_seeker" | "employer") => void;
}

export const ProfileTypeSelector: React.FC<ProfileTypeSelectorProps> = ({
  onSelect,
}) => {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-lg mx-auto mb-8">
        <p className="text-muted-foreground">
          Please select the type of profile you'd like to create. This will
          determine your experience on Match Matrix.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card
          className="border-2 hover:border-primary transition-colors cursor-pointer"
          onClick={() => onSelect("job_seeker")}
        >
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
              <UserIcon className="h-10 w-10 text-primary" />
            </div>
            <CardTitle>Job Seeker</CardTitle>
            <CardDescription>
              Looking for your next career opportunity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Create a professional profile
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Showcase your skills and experience
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Discover matching job opportunities
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Apply to positions with a single click
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => onSelect("job_seeker")}>
              Continue as Job Seeker
            </Button>
          </CardFooter>
        </Card>

        <Card
          className="border-2 hover:border-primary transition-colors cursor-pointer"
          onClick={() => onSelect("employer")}
        >
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
              <BriefcaseIcon className="h-10 w-10 text-primary" />
            </div>
            <CardTitle>Employer</CardTitle>
            <CardDescription>
              Hiring talent for your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Create company profile
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Post job openings
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Find candidates that match your requirements
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Manage applications efficiently
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => onSelect("employer")}>
              Continue as Employer
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
