import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useProfile } from "../../lib/ProfileContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "../ui/use-toast";

const employerProfileSchema = z.object({
  company_name: z
    .string()
    .min(2, { message: "Company name must be at least 2 characters" }),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  website: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
  company_description: z
    .string()
    .max(500, {
      message: "Company description cannot exceed 500 characters",
    })
    .optional(),
});

type EmployerProfileFormValues = z.infer<typeof employerProfileSchema>;

interface EmployerProfileFormProps {
  initialData?: {
    companyName?: string;
    company_name?: string;
    industry?: string;
    email?: string;
    [key: string]: unknown;
  };
}

export function EmployerProfileForm({
  initialData = {},
}: EmployerProfileFormProps) {
  const navigate = useNavigate();
  const { createUserProfile, createEmployer, profile } = useProfile();

  // Get company name and industry from initialData or profile
  const companyName = initialData.companyName || initialData.company_name || "";
  const industry = initialData.industry || "";

  const form = useForm<EmployerProfileFormValues>({
    resolver: zodResolver(employerProfileSchema),
    defaultValues: {
      company_name: companyName,
      industry: industry || "",
      company_size: "",
      website: "",
      company_description: "",
    },
  });

  async function onSubmit(data: EmployerProfileFormValues) {
    try {
      // Create the base profile if it doesn't exist yet
      if (!profile) {
        const { success, error } = await createUserProfile({
          type: "employer",
          full_name: "", // This will be updated separately
        });

        if (!success) {
          throw error || new Error("Failed to create base profile");
        }
      }

      // Create the employer profile
      const { success, error } = await createEmployer({
        company_name: data.company_name,
        industry: data.industry || null,
        company_size: data.company_size || null,
        website: data.website || null,
        company_description: data.company_description || null,
      });

      if (!success) {
        throw error || new Error("Failed to create employer profile");
      }

      toast({
        title: "Profile created successfully",
        description: "You're ready to start using the platform",
      });

      // Navigate to the employer dashboard
      navigate("/company-profile");
    } catch (err) {
      console.error("Error creating profile:", err);
      toast({
        title: "Error creating profile",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name*</FormLabel>
              <FormControl>
                <Input placeholder="Enter your company name" {...field} />
              </FormControl>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="hospitality">Hospitality</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501-1000">501-1000 employees</SelectItem>
                  <SelectItem value="1001+">1001+ employees</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Website</FormLabel>
              <FormControl>
                <Input placeholder="https://www.example.com" {...field} />
              </FormControl>
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
                  placeholder="Tell us about your company"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Create Profile
        </Button>
      </form>
    </Form>
  );
}
