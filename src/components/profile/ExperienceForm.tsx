import React, { useEffect } from "react";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Experience } from "@/lib/database";
import { useAuth } from "@/lib/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Experience form schema
const experienceSchema = z
  .object({
    type: z.enum(["work", "education"], {
      required_error: "Type is required",
    }),
    title: z.string().min(1, "Title is required"),
    organization: z.string().min(1, "Organization is required"),
    location: z.string().optional(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().optional(),
    is_current: z.boolean().default(false),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      // If not current position and end_date is provided, make sure end_date is after start_date
      if (!data.is_current && data.end_date) {
        return new Date(data.end_date) >= new Date(data.start_date);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    }
  );

export type ExperienceFormValues = z.infer<typeof experienceSchema>;

type ExperienceFormProps = {
  experience?: Experience;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ExperienceFormValues) => Promise<void>;
  defaultType?: "work" | "education";
};

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  experience,
  isOpen,
  onClose,
  onSubmit,
  defaultType = "work",
}) => {
  const { user } = useAuth();
  const isEditing = !!experience;

  useEffect(() => {
    console.log("ExperienceForm rendered with isOpen:", isOpen);
  }, [isOpen]);

  // Initialize the form with existing experience data or defaults
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: experience
      ? {
          ...experience,
          // Convert date strings to YYYY-MM-DD format for input[type="date"]
          start_date: experience.start_date
            ? new Date(experience.start_date).toISOString().split("T")[0]
            : "",
          end_date: experience.end_date
            ? new Date(experience.end_date).toISOString().split("T")[0]
            : "",
        }
      : {
          type: defaultType,
          title: "",
          organization: "",
          location: "",
          start_date: new Date().toISOString().split("T")[0],
          end_date: "",
          is_current: false,
          description: "",
        },
  });

  // Watch is_current to conditionally render end_date field
  const isCurrent = form.watch("is_current");
  const experienceType = form.watch("type");

  // Clear end date when is_current is checked
  React.useEffect(() => {
    if (isCurrent) {
      form.setValue("end_date", "");
    }
  }, [isCurrent, form]);

  const handleSubmit = async (values: ExperienceFormValues) => {
    if (!user) {
      toast.error("You must be logged in to add experiences");
      return;
    }

    console.log("ExperienceForm handleSubmit values:", values);

    // Additional validation for required fields
    if (!values.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!values.organization.trim()) {
      toast.error("Organization is required");
      return;
    }

    if (!values.start_date) {
      toast.error("Start date is required");
      return;
    }

    // Validate end date if not current and provided
    if (!values.is_current && values.end_date) {
      const startDate = new Date(values.start_date);
      const endDate = new Date(values.end_date);

      if (endDate < startDate) {
        toast.error("End date must be after start date");
        return;
      }
    }

    try {
      // Ensure values are properly formatted
      const formattedValues = {
        ...values,
        // Convert empty strings to null for optional fields
        location: values.location || null,
        description: values.description || null,
        // Handle dates
        start_date: values.start_date,
        end_date: values.is_current ? null : values.end_date || null,
      };

      console.log("ExperienceForm formattedValues:", formattedValues);

      await onSubmit(formattedValues);
      toast.success("Experience saved successfully");
      form.reset();
      console.log("Calling onClose after successful submit");
      onClose();
    } catch (error) {
      console.error("Error submitting experience:", error);
      toast.error(
        "Failed to save experience: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div
            className="bg-background rounded-lg p-6 max-w-[500px] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? "Edit" : "Add"}{" "}
                {experienceType === "work" ? "Work" : "Education"} Experience
              </h2>
            </div>

            <FormProvider {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {experienceType === "work"
                          ? "Job Title"
                          : "Degree / Certificate"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            experienceType === "work"
                              ? "e.g. Software Engineer"
                              : "e.g. Bachelor of Science"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {experienceType === "work" ? "Company" : "Institution"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            experienceType === "work"
                              ? "e.g. Google"
                              : "e.g. Stanford University"
                          }
                          {...field}
                        />
                      </FormControl>
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
                        <Input
                          placeholder="e.g. San Francisco, CA"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!isCurrent && (
                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="is_current"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="leading-none">
                        <FormLabel>
                          {experienceType === "work"
                            ? "I currently work here"
                            : "I'm currently studying here"}
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            experienceType === "work"
                              ? "Describe your responsibilities and achievements..."
                              : "Describe your studies, achievements, etc..."
                          }
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onClose();
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSubmit(form.getValues());
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </FormProvider>
          </div>
        </div>
      )}
    </>
  );
};
