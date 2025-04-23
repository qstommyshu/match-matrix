import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../lib/AuthContext";
import { useNavigate } from "react-router-dom";

interface CommonFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface CandidateFormData extends CommonFormData {
  fullName: string;
}

interface CompanyFormData extends CommonFormData {
  companyName: string;
  industry: string;
}

const RegistrationForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("candidate");
  const [step, setStep] = useState(1);

  // Form data
  const [candidateData, setCandidateData] = useState<CandidateFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  const [companyData, setCompanyData] = useState<CompanyFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    industry: "",
  });

  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Handle form input changes
  const handleCandidateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCandidateData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setStep(1); // Reset step when changing tabs
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (
      activeTab === "candidate"
        ? candidateData.password !== candidateData.confirmPassword
        : companyData.password !== companyData.confirmPassword
    ) {
      toast({
        title: "Invalid input",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = activeTab === "candidate" ? candidateData : companyData;
      console.log("Registration attempt:", { userType: activeTab, formData });

      const { data, error } = await signUp(formData.email, formData.password);

      if (error) {
        console.error("Registration error:", error);
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Successfully registered
        toast({
          title: "Registration successful",
          description: "Account created! Redirecting to profile setup...",
        });

        // Store user type in localStorage for profile setup
        localStorage.setItem("userType", activeTab);

        // Store form data in localStorage for prefilling profile forms
        if (activeTab === "candidate") {
          localStorage.setItem(
            "userData",
            JSON.stringify({
              fullName: candidateData.fullName,
              email: candidateData.email,
            })
          );
        } else {
          localStorage.setItem(
            "userData",
            JSON.stringify({
              companyName: companyData.companyName,
              industry: companyData.industry,
              email: companyData.email,
            })
          );
        }

        // Redirect to profile setup page after registration
        setTimeout(() => {
          navigate("/profile-setup");
        }, 2000);
      }
    } catch (err) {
      console.error("An unexpected error occurred:", err);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Validation checks
  const validateCommonFields = (data: CommonFormData) => {
    if (!data.email || !data.password || !data.confirmPassword) return false;
    if (data.password !== data.confirmPassword) return false;
    if (data.password.length < 8) return false;
    return true;
  };

  // Next step handler
  const handleNextStep = () => {
    const formData = activeTab === "candidate" ? candidateData : companyData;
    if (validateCommonFields(formData)) {
      setStep(2);
    } else {
      toast({
        title: "Invalid input",
        description:
          "Please check all fields and ensure passwords match and are at least 8 characters.",
        variant: "destructive",
      });
    }
  };

  // Render steps
  const renderStep1 = () => (
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
          value={
            activeTab === "candidate" ? candidateData.email : companyData.email
          }
          onChange={
            activeTab === "candidate"
              ? handleCandidateChange
              : handleCompanyChange
          }
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="********"
          required
          value={
            activeTab === "candidate"
              ? candidateData.password
              : companyData.password
          }
          onChange={
            activeTab === "candidate"
              ? handleCandidateChange
              : handleCompanyChange
          }
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="********"
          required
          value={
            activeTab === "candidate"
              ? candidateData.confirmPassword
              : companyData.confirmPassword
          }
          onChange={
            activeTab === "candidate"
              ? handleCandidateChange
              : handleCompanyChange
          }
          disabled={isLoading}
        />
      </div>
    </CardContent>
  );

  const renderCandidateStep2 = () => (
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="John Doe"
          required
          value={candidateData.fullName}
          onChange={handleCandidateChange}
          disabled={isLoading}
        />
      </div>
      {/* More candidate-specific fields can be added here */}
    </CardContent>
  );

  const renderCompanyStep2 = () => (
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          name="companyName"
          type="text"
          placeholder="Acme Inc."
          required
          value={companyData.companyName}
          onChange={handleCompanyChange}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          name="industry"
          type="text"
          placeholder="Technology"
          required
          value={companyData.industry}
          onChange={handleCompanyChange}
          disabled={isLoading}
        />
      </div>
      {/* More company-specific fields can be added here */}
    </CardContent>
  );

  return (
    <Card className="w-full max-w-md mx-auto glass-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Create an Account
        </CardTitle>
        <CardDescription className="text-center">
          Sign up to find your perfect career match
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="candidate">I'm a Candidate</TabsTrigger>
            <TabsTrigger value="company">We're a Company</TabsTrigger>
          </TabsList>
        </div>

        <form onSubmit={handleSubmit}>
          <TabsContent value="candidate">
            {step === 1 ? renderStep1() : renderCandidateStep2()}
          </TabsContent>

          <TabsContent value="company">
            {step === 1 ? renderStep1() : renderCompanyStep2()}
          </TabsContent>

          <CardFooter className="flex flex-col space-y-4">
            {step === 1 ? (
              <Button
                type="button"
                className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity"
                onClick={handleNextStep}
                disabled={isLoading}
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            )}

            {step === 2 && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                Back
              </Button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300"></span>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" type="button" disabled={isLoading}>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" type="button" disabled={isLoading}>
                <svg
                  className="h-5 w-5 mr-2 text-[#1877F2]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
                Facebook
              </Button>
            </div>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-neon-purple hover:text-neon-blue font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Tabs>
    </Card>
  );
};

export default RegistrationForm;
