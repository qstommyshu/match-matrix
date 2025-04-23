import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/lib/ProfileContext";
import { createJob, updateJob, Job } from "@/lib/database";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// Schema for job posting form validation
const postJobSchema = z
  .object({
    title: z
      .string()
      .min(5, { message: "Job title must be at least 5 characters" }),
    description: z
      .string()
      .min(20, { message: "Description must be at least 20 characters" }),
    location: z.string().optional(),
    remote: z.boolean().default(false),
    job_type: z.string().optional(),
    salary_min: z.coerce.number().positive().optional().nullable(),
    salary_max: z.coerce.number().positive().optional().nullable(),
    experience_level: z.string().optional(),
  })
  .refine(
    (data) =>
      !data.salary_min ||
      !data.salary_max ||
      data.salary_max >= data.salary_min,
    {
      message: "Maximum salary must be greater than or equal to minimum salary",
      path: ["salary_max"], // Point error to max salary field
    }
  );

type PostJobFormValues = z.infer<typeof postJobSchema>;

// Add props for editing
interface PostJobFormProps {
  jobId?: string; // ID of the job being edited
  initialData?: Partial<Job>; // Initial data for editing
}

export const PostJobForm: React.FC<PostJobFormProps> = ({
  jobId,
  initialData,
}) => {
  const navigate = useNavigate();
  const { profile } = useProfile(); // Get profile to extract employer_id
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!jobId; // Determine if we are editing

  const form = useForm<PostJobFormValues>({
    resolver: zodResolver(postJobSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      remote: initialData?.remote || false,
      job_type: initialData?.job_type || "",
      salary_min: initialData?.salary_min ?? null,
      salary_max: initialData?.salary_max ?? null,
      experience_level: initialData?.experience_level || "",
    },
  });

  // Reset form if initialData changes (e.g., fetched after mount)
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        description: initialData.description || "",
        location: initialData.location || "",
        remote: initialData.remote || false,
        job_type: initialData.job_type || "",
        salary_min: initialData.salary_min ?? null,
        salary_max: initialData.salary_max ?? null,
        experience_level: initialData.experience_level || "",
      });
    }
  }, [initialData, form]);

  async function onSubmit(data: PostJobFormValues) {
    if (!profile || profile.type !== "employer") {
      toast({
        title: "Error",
        description: "Invalid user type.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEditing && jobId) {
        // Update existing job
        const updateData = {
          title: data.title,
          description: data.description,
          location: data.location || null,
          remote: data.remote,
          job_type: data.job_type || null,
          salary_min: data.salary_min,
          salary_max: data.salary_max,
          experience_level: data.experience_level || null,
        };
        const { job, error } = await updateJob(jobId, updateData);
        if (error) throw error;
        toast({
          title: "Job Updated Successfully!",
          description: `"${job?.title}" has been updated.`,
        });
        // Navigate back to job detail or dashboard
        navigate(`/jobs/${jobId}`); // Or /dashboard
      } else {
        // Create new job
        const jobData = {
          employer_id: profile.id,
          title: data.title,
          description: data.description,
          location: data.location || null,
          remote: data.remote,
          job_type: data.job_type || null,
          salary_min: data.salary_min,
          salary_max: data.salary_max,
          experience_level: data.experience_level || null,
          status: "open",
        };
        const { job, error } = await createJob(jobData);
        if (error) throw error;
        toast({
          title: "Job Posted Successfully!",
          description: `"${job?.title}" has been listed.`,
        });
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error saving job:", err);
      toast({
        title: isEditing ? "Error Updating Job" : "Error Posting Job",
        description:
          err instanceof Error ? err.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Senior Software Engineer"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the role, responsibilities, and qualifications..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use Markdown for formatting if needed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., San Francisco, CA or Remote"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Leave blank if fully remote (check box below).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remote Option */}
          <FormField
            control={form.control}
            name="remote"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow mt-6 md:mt-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Remote Position</FormLabel>
                  <FormDescription>
                    Check this if the job can be done fully remotely.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Job Type */}
          <FormField
            control={form.control}
            name="job_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Experience Level */}
          <FormField
            control={form.control}
            name="experience_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Entry-level">Entry-level</SelectItem>
                    <SelectItem value="Mid-level">Mid-level</SelectItem>
                    <SelectItem value="Senior-level">Senior-level</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Director">Director</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Salary Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="salary_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Salary (Annual)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder="e.g., 80000"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        field.onChange(value === "" ? null : Number(value));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salary_max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Salary (Annual)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder="e.g., 120000"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        field.onChange(value === "" ? null : Number(value));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* TODO: Add Skills Section Here (potentially using a multi-select component) */}
        {/* For now, skills need to be added/managed after job creation */}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
              {isEditing ? "Saving..." : "Posting..."}
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Post Job Listing"
          )}
        </Button>
      </form>
    </Form>
  );
};
