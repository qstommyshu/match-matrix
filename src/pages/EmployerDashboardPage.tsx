import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProfile } from "@/lib/ProfileContext";
import { useNavigate } from "react-router-dom";
import {
  Building,
  FilePlus,
  Users,
  Bell,
  Briefcase,
  Loader2,
} from "lucide-react";
import { getJobs, Job } from "@/lib/database";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export const EmployerDashboardPage: React.FC = () => {
  const { profile, employerProfile } = useProfile();
  const navigate = useNavigate();
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  useEffect(() => {
    if (profile?.id && profile.type === "employer") {
      const fetchPostedJobs = async () => {
        setIsLoadingJobs(true);
        try {
          const { jobs, error } = await getJobs({ employerId: profile.id });
          if (error) throw error;
          setPostedJobs(jobs || []);
        } catch (error) {
          console.error("Failed to fetch posted jobs:", error);
          toast({
            title: "Error",
            description: "Could not load your job postings.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingJobs(false);
        }
      };
      fetchPostedJobs();
    }
  }, [profile?.id, profile?.type]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold">
        Welcome, {employerProfile?.company_name || "Employer"}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Company Profile Card */}
        <Card className="md:col-span-1 glass-card">
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
            <CardDescription>Manage your company's details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/edit-company-profile")}
            >
              <Building className="mr-2 h-4 w-4" /> Edit Company Profile
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/company-profile")}
            >
              <Building className="mr-2 h-4 w-4" /> View Company Profile
            </Button>
            <Button
              variant="default"
              className="w-full"
              onClick={() => navigate("/post-job")}
            >
              <FilePlus className="mr-2 h-4 w-4" /> Post a New Job
            </Button>
          </CardContent>
        </Card>

        {/* Active Job Postings Card */}
        <Card className="md:col-span-2 glass-card">
          <CardHeader>
            <CardTitle>Active Job Postings</CardTitle>
            <CardDescription>
              Overview of your current listings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingJobs ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : postedJobs.length > 0 ? (
              postedJobs.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 glass-card-inner flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge
                        variant={
                          job.status === "open" ? "default" : "secondary"
                        }
                        className={
                          job.status === "open"
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                      >
                        {job.status}
                      </Badge>
                      <span>·</span>
                      <span>
                        Posted: {new Date(job.created_at).toLocaleDateString()}
                      </span>
                      {/* TODO: Add applicant count when available */}
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/edit-job/${job.id}`)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Briefcase className="mx-auto h-12 w-12 mb-4" />
                <p>You haven't posted any jobs yet.</p>
                <Button className="mt-4" onClick={() => navigate("/post-job")}>
                  Post Your First Job
                </Button>
              </div>
            )}
            {/* Optionally add a link to manage all jobs if list is long */}
            {postedJobs.length > 0 && (
              <div className="mt-4 text-center">
                <Button variant="link" onClick={() => navigate("/manage-jobs")}>
                  Manage All Jobs
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications Card (Placeholder) */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>
            Latest candidates applying to your jobs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Bell className="mx-auto h-12 w-12 mb-4" />
            <p>Notifications for new applications will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
