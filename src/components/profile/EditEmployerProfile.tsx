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

const employerFormSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters" }),
  company_name: z
    .string()
    .min(2, { message: "Company name must be at least 2 characters" }),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  website: z.string().optional(),
  company_description: z.string().optional(),
  location: z.string().optional(),
});

type EmployerFormValues = z.infer<typeof employerFormSchema>;

export const EditEmployerProfile = () => {
  const {
    profile,
    employerProfile,
    updateUserProfile,
    updateEmployer,
    loading,
  } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<EmployerFormValues>({
    resolver: zodResolver(employerFormSchema),
    defaultValues: {
      full_name: "",
      company_name: "",
      industry: "",
      company_size: "",
      website: "",
      company_description: "",
      location: "",
    },
  });

  useEffect(() => {
    if (profile && employerProfile) {
      // Set form values from existing profile
      form.reset({
        full_name: profile.full_name || "",
        company_name: employerProfile.company_name || "",
        industry: employerProfile.industry || "",
        company_size: employerProfile.company_size || "",
        website: employerProfile.website || "",
        company_description: employerProfile.company_description || "",
        location: employerProfile.location || "",
      });
    }
  }, [profile, employerProfile, form]);

  const onSubmit = async (data: EmployerFormValues) => {
    if (!profile || !employerProfile) {
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
      const totalFields = 7; // Count of all editable fields

      if (data.full_name) completedFields++;
      if (data.company_name) completedFields++;
      if (data.industry) completedFields++;
      if (data.company_size) completedFields++;
      if (data.website) completedFields++;
      if (data.company_description) completedFields++;
      if (data.location) completedFields++;

      const profileCompleteness = Math.round(
        (completedFields / totalFields) * 100
      );

      // Update employer profile
      const { success: employerSuccess, error: employerError } =
        await updateEmployer({
          company_name: data.company_name,
          industry: data.industry || null,
          company_size: data.company_size || null,
          website: data.website || null,
          company_description: data.company_description || null,
          location: data.location || null,
          profile_completeness: profileCompleteness,
        });

      if (!employerSuccess) {
        throw new Error(
          employerError?.message || "Failed to update employer profile"
        );
      }

      toast({
        title: "Profile updated successfully!",
        description: "Your changes have been saved",
      });

      // Navigate back to profile page
      navigate("/company-profile");
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

  if (!profile || !employerProfile) {
    return (
      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>Profile Not Found</CardTitle>
          <CardDescription>
            Please complete your company profile setup first.
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
      <h1 className="text-2xl font-bold mb-6">Edit Company Profile</h1>

      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="company-details">Company Details</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="basic-info">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update your company's basic information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your name as the company representative
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="TechCorp" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of your company
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Software Development"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The industry your company operates in
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Size</FormLabel>
                        <FormControl>
                          <Input placeholder="10-50" {...field} />
                        </FormControl>
                        <FormDescription>
                          The approximate number of employees
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="company-details">
              <Card>
                <CardHeader>
                  <CardTitle>Company Details</CardTitle>
                  <CardDescription>
                    Share more information about your company
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your company's website URL
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
                          Your company's primary location
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your company, its mission, and what makes it unique..."
                            {...field}
                            className="min-h-[150px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Tell potential candidates about your company
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <div className="mt-8 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/company-profile")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default EditEmployerProfile;
