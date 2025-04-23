
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Mock data
const candidateData = {
  id: "1",
  fullName: "Alex Johnson",
  headline: "Senior Software Engineer",
  yearsOfExperience: 8,
  skills: ["JavaScript", "React", "Node.js", "TypeScript", "GraphQL", "AWS"],
  workExperience: [
    {
      title: "Senior Software Engineer",
      company: "TechCorp",
      location: "San Francisco, CA",
      startDate: "2020-03",
      endDate: null,
      isCurrentRole: true,
      description: "Leading development of microservices architecture and mentoring junior developers."
    },
    {
      title: "Software Engineer",
      company: "InnovateTech",
      location: "Seattle, WA",
      startDate: "2018-01",
      endDate: "2020-02",
      isCurrentRole: false,
      description: "Developed and maintained front-end React applications."
    }
  ],
  education: [
    {
      degree: "Master of Science in Computer Science",
      institution: "Stanford University",
      location: "Stanford, CA",
      startDate: "2016-09",
      endDate: "2018-06"
    },
    {
      degree: "Bachelor of Science in Computer Engineering",
      institution: "University of Washington",
      location: "Seattle, WA",
      startDate: "2012-09",
      endDate: "2016-06"
    }
  ],
  profileCompleteness: 85
};

const CandidateProfile = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Profile header */}
      <div className="glass mb-8 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {candidateData.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="absolute bottom-0 right-0 h-6 w-6 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold">{candidateData.fullName}</h1>
              <p className="text-gray-600">{candidateData.headline}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="text-sm text-gray-600">Profile Completeness</div>
              <div className="flex items-center gap-2">
                <Progress value={candidateData.profileCompleteness} className="h-2 w-40" />
                <span className="text-sm font-medium">{candidateData.profileCompleteness}%</span>
              </div>
            </div>
            
            <Button className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity">
              Edit Profile
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Skills & Info */}
        <div className="space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Experience</h3>
                <p className="text-base">{candidateData.yearsOfExperience} years</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="text-base">San Francisco, CA</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Open to</h3>
                <p className="text-base">Remote, Hybrid, On-site</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Skills
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  Update Skills
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {candidateData.skills.map((skill, i) => (
                  <div 
                    key={i} 
                    className="px-3 py-1 bg-neon-purple/10 text-neon-purple text-sm rounded-full"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Job Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Desired Role</h3>
                <p className="text-base">Senior Software Engineer</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Salary Expectation</h3>
                <p className="text-base">$120,000 - $150,000</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Work Model</h3>
                <p className="text-base">Remote or Hybrid</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Experience & Education */}
        <div className="col-span-1 lg:col-span-2">
          <Tabs defaultValue="experience" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            </TabsList>
            
            <TabsContent value="experience">
              <Card className="glass-card border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Work Experience</CardTitle>
                    <CardDescription>Your professional journey so far</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">Add Experience</Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {candidateData.workExperience.map((exp, i) => (
                    <div key={i} className="border-l-2 border-neon-purple pl-4 pb-4">
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-lg">{exp.title}</h3>
                        <div className="text-sm text-gray-500">
                          {new Date(exp.startDate).toLocaleDateString('en-US', {year: 'numeric', month: 'short'})} - {
                            exp.isCurrentRole 
                              ? "Present" 
                              : new Date(exp.endDate!).toLocaleDateString('en-US', {year: 'numeric', month: 'short'})
                          }
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <span>{exp.company}</span>
                        <span className="mx-2">•</span>
                        <span>{exp.location}</span>
                      </div>
                      <p className="mt-2 text-gray-700">{exp.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="education">
              <Card className="glass-card border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Education</CardTitle>
                    <CardDescription>Your academic background</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">Add Education</Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {candidateData.education.map((edu, i) => (
                    <div key={i} className="border-l-2 border-neon-blue pl-4 pb-4">
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-lg">{edu.degree}</h3>
                        <div className="text-sm text-gray-500">
                          {new Date(edu.startDate).toLocaleDateString('en-US', {year: 'numeric', month: 'short'})} - {
                            new Date(edu.endDate).toLocaleDateString('en-US', {year: 'numeric', month: 'short'})
                          }
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <span>{edu.institution}</span>
                        <span className="mx-2">•</span>
                        <span>{edu.location}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="portfolio">
              <Card className="glass-card border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Portfolio & Projects</CardTitle>
                    <CardDescription>Showcase your work and achievements</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">Add Project</Button>
                </CardHeader>
                <CardContent className="py-6">
                  <div className="text-center p-10 border-2 border-dashed rounded-lg">
                    <h3 className="font-medium text-lg mb-2">No projects added yet</h3>
                    <p className="text-gray-500 mb-4">Showcase your work by adding projects, code repositories, or case studies.</p>
                    <Button>Add Your First Project</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
