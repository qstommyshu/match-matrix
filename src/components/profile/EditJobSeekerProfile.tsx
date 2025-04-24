import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/lib/ProfileContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExperienceList } from "./ExperienceList";
import { Experience, getUserExperiences } from "@/lib/database";
import { useAuth } from "@/lib/AuthContext";

const jobSeekerFormSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters" }),
  headline: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  years_of_experience: z.string().optional(),
  education: z.string().optional(),
  desired_role: z.string().optional(),
  open_to: z.string().optional(),
  salary_expectation: z.string().optional(),
});

type JobSeekerFormValues = z.infer<typeof jobSeekerFormSchema>;

export const EditJobSeekerProfile = () => {
  const {
    profile,
    jobSeekerProfile,
    updateUserProfile,
    updateSeeker,
    loading,
  } = useProfile();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic-info");

  const form = useForm<JobSeekerFormValues>({
    resolver: zodResolver(jobSeekerFormSchema),
    defaultValues: {
      full_name: "",
      headline: "",
      bio: "",
      location: "",
      years_of_experience: "",
      education: "",
      desired_role: "",
      open_to: "",
      salary_expectation: "",
    },
  });

  useEffect(() => {
    if (profile && jobSeekerProfile) {
      // Set form values from existing profile
      form.reset({
        full_name: profile.full_name || "",
        headline: jobSeekerProfile.headline || "",
        bio: jobSeekerProfile.bio || "",
        location: jobSeekerProfile.location || "",
        years_of_experience:
          jobSeekerProfile.years_of_experience?.toString() || "",
        education: jobSeekerProfile.education || "",
        desired_role: jobSeekerProfile.desired_role || "",
        open_to: jobSeekerProfile.open_to || "",
        salary_expectation: jobSeekerProfile.salary_expectation || "",
      });
    }
  }, [profile, jobSeekerProfile, form]);

  // Fetch experiences
  const fetchExperiences = async () => {
    if (!user) return;

    setLoadingExperiences(true);
    try {
      const { experiences: data, error } = await getUserExperiences(user.id);
      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error("Error fetching experiences:", error);
      toast({
        title: "Error",
        description: "Failed to load experience data",
        variant: "destructive",
      });
    } finally {
      setLoadingExperiences(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchExperiences();
    }
  }, [user]);

  const onSubmit = async (data: JobSeekerFormValues) => {
    if (!profile || !jobSeekerProfile) {
      toast({
        title: "Error",
        description: "No profile found to update",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update basic profile info
      const { success: profileSuccess, error: profileError } =
        await updateUserProfile({
          full_name: data.full_name,
        });

      if (!profileSuccess) {
        throw new Error(
          profileError?.message || "Failed to update basic profile"
        );
      }

      // Calculate profile completeness
      let completedFields = 0;
      const totalFields = 9; // Count of all editable fields

      if (data.full_name) completedFields++;
      if (data.headline) completedFields++;
      if (data.bio) completedFields++;
      if (data.location) completedFields++;
      if (data.years_of_experience) completedFields++;
      if (data.education) completedFields++;
      if (data.desired_role) completedFields++;
      if (data.open_to) completedFields++;
      if (data.salary_expectation) completedFields++;

      const profileCompleteness = Math.round(
        (completedFields / totalFields) * 100
      );

      // Update job seeker profile
      const { success: seekerSuccess, error: seekerError } = await updateSeeker(
        {
          headline: data.headline || null,
          bio: data.bio || null,
          location: data.location || null,
          years_of_experience: data.years_of_experience
            ? parseInt(data.years_of_experience)
            : null,
          education: data.education || null,
          desired_role: data.desired_role || null,
          open_to: data.open_to || null,
          salary_expectation: data.salary_expectation || null,
          profile_completeness: profileCompleteness,
        }
      );

      if (!seekerSuccess) {
        throw new Error(
          seekerError?.message || "Failed to update job seeker profile"
        );
      }

      toast({
        title: "Profile updated successfully!",
        description: "Your changes have been saved",
      });

      // Navigate back to profile page
      navigate("/candidate-profile");
    } catch (err) {
      console.error("Error updating profile:", err);

      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || !jobSeekerProfile) {
    return (
      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>Profile Not Found</CardTitle>
          <CardDescription>
            Please complete your profile setup first.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => navigate("/profile-setup")}>
            Set Up Profile
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Edit Your Profile</h1>

      <Tabs
        defaultValue="basic-info"
        className="w-full"
        onValueChange={(value) => {
          // Set active tab and log the change
          setActiveTab(value);
          console.log("Tab changed to:", value);
        }}
      >
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="basic-info" onClick={(e) => e.stopPropagation()}>
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="preferences" onClick={(e) => e.stopPropagation()}>
            Preferences
          </TabsTrigger>
          <TabsTrigger value="details" onClick={(e) => e.stopPropagation()}>
            Professional Details
          </TabsTrigger>
          <TabsTrigger value="work" onClick={(e) => e.stopPropagation()}>
            Work Experience
          </TabsTrigger>
          <TabsTrigger value="education" onClick={(e) => e.stopPropagation()}>
            Education
          </TabsTrigger>
        </TabsList>

        {/* Only render the form for non-experience tabs */}
        {activeTab !== "work" && activeTab !== "education" && (
          <Form {...form}>
            <form
              onSubmit={(e) => {
                // Add console logging to see when form is submitted
                console.log("Form submitted");
                form.handleSubmit(onSubmit)(e);
              }}
            >
              <TabsContent value="basic-info">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Update your personal and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your full name as you'd like employers to see it
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="headline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Headline</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Senior Software Engineer"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A brief professional title or summary
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="San Francisco, CA" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your current or preferred work location
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Preferences</CardTitle>
                    <CardDescription>
                      Tell employers what you're looking for
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="desired_role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desired Role</FormLabel>
                          <FormControl>
                            <Input placeholder="Software Engineer" {...field} />
                          </FormControl>
                          <FormDescription>
                            The specific role you're seeking
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="open_to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Open To</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Remote, Hybrid, On-site"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Your preferred work arrangements
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salary_expectation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salary Expectation</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="$80,000 - $120,000"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Your expected salary range
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Details</CardTitle>
                    <CardDescription>
                      Share more about your experience and background
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell employers a bit about yourself, your experience, and what you're looking for"
                              {...field}
                              className="min-h-[120px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="years_of_experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="5"
                              {...field}
                              min="0"
                              max="50"
                            />
                          </FormControl>
                          <FormDescription>
                            Total years of professional experience
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Bachelor's in Computer Science, University of Washington"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Your highest level of education
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="mt-8 flex justify-end">
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* Render experience tabs without being wrapped in a form */}
        <TabsContent value="work" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Work Experience</h2>
            <p className="text-gray-500">
              Add your work experience to showcase your professional journey
            </p>
          </div>

          {loadingExperiences ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <ExperienceList
              experiences={experiences}
              type="work"
              onUpdate={fetchExperiences}
              isEditable={true}
            />
          )}
        </TabsContent>

        <TabsContent value="education" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Education</h2>
            <p className="text-gray-500">
              Add your educational background and achievements
            </p>
          </div>

          {loadingExperiences ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <ExperienceList
              experiences={experiences}
              type="education"
              onUpdate={fetchExperiences}
              isEditable={true}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditJobSeekerProfile;
