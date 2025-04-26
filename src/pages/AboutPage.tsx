import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Users, Briefcase, BrainCircuit, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto py-24 px-4 space-y-12">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          Welcome to Match<span className="font-normal">Matrix</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          The intelligent platform connecting talented job seekers with
          innovative employers. We leverage AI to streamline the hiring process,
          making it faster and more effective for everyone.
        </p>
      </section>

      {/* How it Works Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* For Job Seekers */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-neon-blue" />
                For Job Seekers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Create your professional profile, highlighting your skills and
                experience. Our platform helps you find relevant job openings
                that match your expertise.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Build a comprehensive profile showcasing your talents.</li>
                <li>Search and browse relevant job opportunities.</li>
                <li>Apply to jobs with a streamlined process.</li>
                <li>
                  Track the status of your applications (Coming Soon feature
                  integration).
                </li>
                <li>
                  <span className="font-semibold text-neon-purple">
                    Upgrade to Pro:
                  </span>{" "}
                  Unlock Power Matches (AI-driven job recommendations &
                  auto-apply), verified skill assessments, and daily active
                  status checks.
                </li>
              </ul>
              <Link to="/register" className="inline-block mt-4">
                <Button variant="outline">Get Started</Button>
              </Link>
            </CardContent>
          </Card>

          {/* For Employers */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-neon-purple" />
                For Employers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Showcase your company culture and post job openings to attract
                top talent. Manage your hiring pipeline efficiently with our
                smart tools.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Create a compelling company profile.</li>
                <li>Post detailed job descriptions.</li>
                <li>Receive applications from matched candidates.</li>
                <li>
                  View applicant profiles and manage application stages
                  (Applied, Screening, Interview, etc.).
                </li>
                <li>
                  Utilize AI-powered summaries for quick applicant insights.
                </li>
                <li>
                  Use batch actions to efficiently manage multiple applications.
                </li>
              </ul>
              <Link to="/register" className="inline-block mt-4">
                <Button variant="outline">Find Talent</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Key Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <BrainCircuit className="h-10 w-10 mx-auto mb-3 text-neon-purple" />
            <h3 className="text-lg font-semibold mb-1">AI-Powered Matching</h3>
            <p className="text-sm text-muted-foreground">
              Our intelligent algorithms connect the right candidates with the
              right jobs based on skills, experience, and preferences.
            </p>
          </div>
          <div className="text-center p-4">
            <Zap className="h-10 w-10 mx-auto mb-3 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-1">Power Matches (Pro)</h3>
            <p className="text-sm text-muted-foreground">
              Pro job seekers get top matches automatically identified and even
              auto-applied, saving time and effort.
            </p>
          </div>
          <div className="text-center p-4">
            <UserCheck className="h-10 w-10 mx-auto mb-3 text-neon-blue" />
            <h3 className="text-lg font-semibold mb-1">
              Efficient Applicant Tracking
            </h3>
            <p className="text-sm text-muted-foreground">
              Employers can easily manage applications, track stages, view
              profiles, and utilize AI summaries to streamline hiring decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-center pt-8">
        <h2 className="text-2xl font-bold mb-4">Ready to Find Your Match?</h2>
        <p className="text-muted-foreground mb-6">
          Join MatchMatrix today and experience the future of recruitment.
        </p>
        <div className="space-x-4">
          <Link to="/register">
            <Button
              size="lg"
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity"
            >
              Sign Up Now
            </Button>
          </Link>
          <Link to="/jobs">
            <Button size="lg" variant="outline">
              Browse Jobs
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
