import React, { useState } from "react";
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

const jobSeekerFormSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters" }),
  headline: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  years_of_experience: z.string().optional(),
  education: z.string().optional(),
});

type JobSeekerFormValues = z.infer<typeof jobSeekerFormSchema>;

interface JobSeekerProfileFormProps {
  initialData?: {
    fullName?: string;
    full_name?: string;
    email?: string;
    [key: string]: any;
  };
}

export const JobSeekerProfileForm: React.FC<JobSeekerProfileFormProps> = ({
  initialData = {},
}) => {
  const { profile, updateUserProfile, createSeeker } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Use data from initialData (registration) or profile (if exists)
  const fullName =
    initialData.fullName || initialData.full_name || profile?.full_name || "";

  const form = useForm<JobSeekerFormValues>({
    resolver: zodResolver(jobSeekerFormSchema),
    defaultValues: {
      full_name: fullName,
      headline: "",
      bio: "",
      location: "",
      years_of_experience: "",
      education: "",
    },
  });

  const onSubmit = async (data: JobSeekerFormValues) => {
    if (!profile) return;

    setIsSubmitting(true);

    try {
      // Update basic profile info
      if (!profile.full_name || profile.full_name !== data.full_name) {
        const { success: profileSuccess, error: profileError } =
          await updateUserProfile({
            full_name: data.full_name,
          });

        if (!profileSuccess) {
          throw new Error(
            profileError?.message || "Failed to update basic profile"
          );
        }
      }

      // Create job seeker profile
      const { success: seekerSuccess, error: seekerError } = await createSeeker(
        {
          headline: data.headline || null,
          bio: data.bio || null,
          location: data.location || null,
          years_of_experience: data.years_of_experience
            ? parseInt(data.years_of_experience)
            : null,
          education: data.education || null,
        }
      );

      if (!seekerSuccess) {
        throw new Error(
          seekerError?.message || "Failed to create job seeker profile"
        );
      }

      toast({
        title: "Profile created successfully!",
        description: "You can now start using Match Matrix",
      });

      // Navigate to job seeker dashboard
      navigate("/candidate-profile");
    } catch (err) {
      console.error("Error creating profile:", err);

      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to create profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border shadow-md">
      <CardHeader>
        <CardTitle>Job Seeker Profile</CardTitle>
        <CardDescription>
          Complete your profile to find job matches
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                    <Input placeholder="Senior Software Engineer" {...field} />
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

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco, CA" {...field} />
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
                      <Input type="number" min="0" placeholder="5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Bachelor's in Computer Science, Stanford University"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                "Complete Profile"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
