import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle, Zap, User, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const PricingPage: React.FC = () => {
  return (
    <div className="container mx-auto py-24 px-4 space-y-12">
      {/* Header Section */}
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue">
          Pricing Plans
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Choose the plan that best suits your needs. Get started for free or
          unlock advanced features with our Pro plan.
        </p>
      </section>

      {/* Pricing Cards Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Job Seeker - Free */}
        <Card className="border-gray-300 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-6 w-6" />
              Job Seeker
            </CardTitle>
            <CardDescription>
              Essential tools to find your next job.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <p className="text-3xl font-bold">Free</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Profile Creation & Management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Job Search & Browsing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Standard Job Applications</span>
              </li>
              {/* Add more free features if applicable */}
            </ul>
          </CardContent>
          <div className="p-6 pt-0 mt-auto">
            <Link to="/register">
              <Button className="w-full" variant="outline">
                Get Started
              </Button>
            </Link>
          </div>
        </Card>

        {/* Job Seeker - Pro */}
        <Card className="border-neon-purple ring-2 ring-neon-purple flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-neon-purple text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            Most Popular
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              Job Seeker Pro
            </CardTitle>
            <CardDescription>
              Supercharge your job search with AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <p className="text-3xl font-bold">
              $19{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / month
              </span>
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>All Free Features, plus:</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                <span>Power Matches (AI Recommendations)</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                <span>Auto-Apply to Power Matches</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                <span>Manual Power Match Trigger</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Verified Skill Assessments (Coming Soon)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Daily Active Status Check-in</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Priority Support (Example)</span>
              </li>
            </ul>
          </CardContent>
          <div className="p-6 pt-0 mt-auto">
            <Link to="/dashboard">
              {" "}
              {/* Or link to upgrade page */}
              <Button className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity">
                Upgrade Now
              </Button>
            </Link>
          </div>
        </Card>

        {/* Employer - Free */}
        <Card className="border-gray-300 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-6 w-6" />
              Employer
            </CardTitle>
            <CardDescription>
              Find the perfect candidates for your roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <p className="text-3xl font-bold">Contact Sales</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Company Profile Creation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Job Posting</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Applicant Viewing & Management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Application Stage Tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>AI Applicant Summaries</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Batch Application Actions</span>
              </li>
              {/* Add more employer features if applicable */}
            </ul>
          </CardContent>
          <div className="p-6 pt-0 mt-auto">
            <Link to="/register">
              <Button className="w-full" variant="outline">
                Find Talent
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Call to Action/FAQ Section (Optional) */}
      <section className="text-center pt-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Need More Information?</h2>
        <p className="text-muted-foreground mb-6">
          Contact us if you have specific requirements or questions about
          enterprise solutions.
        </p>
        {/* Add Link to contact page or FAQ */}
        <Button variant="ghost">Contact Sales</Button>
      </section>
    </div>
  );
};
