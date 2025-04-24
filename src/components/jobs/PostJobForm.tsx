import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/lib/ProfileContext";
import { createJob, updateJob, Job, getSkills, Skill } from "@/lib/database";
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
import { Loader2, Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

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
    status: z.enum(["open", "closed"]).optional(),
    required_skills: z.array(z.string()).optional().default([]),
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
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const isEditing = !!jobId; // Determine if we are editing

  // Fetch available skills
  useEffect(() => {
    const fetchSkills = async () => {
      setIsLoadingSkills(true);
      try {
        const { skills, error } = await getSkills();
        if (error) throw error;
        setAvailableSkills(skills || []);
      } catch (error) {
        console.error("Failed to fetch skills:", error);
        toast({
          title: "Error",
          description: "Could not load skills for selection.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingSkills(false);
      }
    };
    fetchSkills();
  }, []);

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
      status: initialData?.status === "closed" ? "closed" : "open",
      required_skills: initialData?.required_skills || [],
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
        status: initialData.status === "closed" ? "closed" : "open",
        required_skills: initialData.required_skills || [],
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
          status: data.status || "open",
          required_skills: data.required_skills || [],
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
          required_skills: data.required_skills || [],
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

        {/* Required Skills */}
        <FormField
          control={form.control}
          name="required_skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required Skills</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between h-auto min-h-10",
                        !field.value?.length && "text-muted-foreground"
                      )}
                    >
                      <div className="flex flex-wrap gap-1">
                        {field.value?.length > 0
                          ? field.value.map((skillName) => (
                              <Badge
                                variant="secondary"
                                key={skillName}
                                className="mr-1 mb-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newValue = field.value.filter(
                                    (s) => s !== skillName
                                  );
                                  field.onChange(newValue);
                                }}
                              >
                                {skillName}
                                <X className="ml-1 h-3 w-3" />
                              </Badge>
                            ))
                          : "Select required skills..."}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search skills..." />
                      <CommandList>
                        <CommandEmpty>
                          {isLoadingSkills
                            ? "Loading skills..."
                            : "No skills found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {availableSkills.map((skill) => (
                            <CommandItem
                              key={skill.id}
                              value={skill.name}
                              onSelect={() => {
                                const currentValue = field.value || [];
                                const isSelected = currentValue.includes(
                                  skill.name
                                );
                                if (isSelected) {
                                  field.onChange(
                                    currentValue.filter((s) => s !== skill.name)
                                  );
                                } else {
                                  field.onChange([...currentValue, skill.name]);
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value?.includes(skill.name)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {skill.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormDescription>
                Select the key skills required for this role.
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
                  <FormLabel>Remote Option</FormLabel>
                  <FormDescription>
                    Check if this job can be performed fully remotely.
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
                  defaultValue={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Min Salary */}
          <FormField
            control={form.control}
            name="salary_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Salary ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 80000"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? null : Number(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Max Salary */}
          <FormField
            control={form.control}
            name="salary_max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Salary ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 120000"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? null : Number(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Experience Level */}
        <FormField
          control={form.control}
          name="experience_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience Level</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={String(field.value || "")}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select required experience level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="entry-level">Entry-level</SelectItem>
                  <SelectItem value="mid-level">Mid-level</SelectItem>
                  <SelectItem value="senior-level">Senior-level</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status - Only show when editing */}
        {isEditing && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={String(field.value || "open")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Set to "Closed" to hide the listing from job seekers.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isEditing ? "Update Job" : "Post Job"}
        </Button>
      </form>
    </Form>
  );
};
