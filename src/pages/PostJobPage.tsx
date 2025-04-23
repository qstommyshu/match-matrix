import React from "react";
import { PostJobForm } from "@/components/jobs/PostJobForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const PostJobPage: React.FC = () => {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Post a New Job</CardTitle>
          <CardDescription>
            Fill out the details below to list a new job opening.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostJobForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJobPage;
