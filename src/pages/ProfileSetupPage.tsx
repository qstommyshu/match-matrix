import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { JobSeekerProfileForm } from "../components/profile/JobSeekerProfileForm";
import { EmployerProfileForm } from "../components/profile/EmployerProfileForm";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { cn } from "../lib/utils";

export function ProfileSetupPage() {
  const [userType, setUserType] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserType = localStorage.getItem("userType");

    if (storedUserType === "candidate") {
      setUserType("job-seeker");
    } else if (storedUserType === "company") {
      setUserType("employer");
    }

    localStorage.removeItem("userType");
  }, []);

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Let's set up your profile to get started with Match Matrix
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!userType ? (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">I am a:</h3>
              <RadioGroup
                onValueChange={(value) => setUserType(value)}
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                <div>
                  <RadioGroupItem
                    value="job-seeker"
                    id="job-seeker"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="job-seeker"
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-3 h-10 w-10"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <div className="space-y-1 text-center">
                      <h3 className="font-medium">Job Seeker</h3>
                      <p className="text-sm text-muted-foreground">
                        Find your next job opportunity
                      </p>
                    </div>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="employer"
                    id="employer"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="employer"
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-3 h-10 w-10"
                    >
                      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    <div className="space-y-1 text-center">
                      <h3 className="font-medium">Employer</h3>
                      <p className="text-sm text-muted-foreground">
                        Find qualified candidates
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    if (userType) {
                      // If we're just selecting the profile type but not going straight to the form
                      // we would save this preference and then show the appropriate form
                      // For now, we're showing the form in the same component
                    }
                  }}
                  disabled={!userType}
                >
                  Continue
                </Button>
              </div>
            </div>
          ) : userType === "job-seeker" ? (
            <JobSeekerProfileForm />
          ) : (
            <EmployerProfileForm />
          )}

          {userType && (
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => setUserType(null)}
                className="text-sm"
              >
                ← Back to profile type selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
