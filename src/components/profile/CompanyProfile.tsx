
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
const companyData = {
  id: "1",
  companyName: "TechCorp",
  industry: "Software Development",
  companySize: "50-200",
  location: "San Francisco, CA",
  description: "TechCorp is a cutting-edge software development company specializing in AI-powered solutions for enterprise clients. Founded in 2015, we've been helping businesses transform their operations through innovative technology.",
  logoUrl: null,
  websiteUrl: "https://techcorp.example.com",
  benefits: [
    "Flexible Work Schedule",
    "Remote Work Options",
    "Health Insurance",
    "401(k) Matching",
    "Professional Development Budget",
    "Unlimited PTO"
  ],
  team: {
    engineering: 40,
    product: 15,
    marketing: 10,
    sales: 20,
    other: 15
  },
  activeJobs: [
    {
      id: "job-1",
      title: "Senior Software Engineer",
      location: "Remote",
      department: "Engineering",
      type: "Full-time",
      postedDate: "2023-04-10"
    },
    {
      id: "job-2",
      title: "Product Manager",
      location: "San Francisco, CA",
      department: "Product",
      type: "Full-time",
      postedDate: "2023-04-05"
    },
    {
      id: "job-3",
      title: "DevOps Engineer",
      location: "Remote",
      department: "Engineering",
      type: "Full-time",
      postedDate: "2023-04-12"
    }
  ],
  profileCompleteness: 75
};

const CompanyProfile = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Company header */}
      <div className="glass mb-8 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {companyData.logoUrl ? (
                <img 
                  src={companyData.logoUrl} 
                  alt={companyData.companyName} 
                  className="h-20 w-20 rounded-xl object-cover"
                />
              ) : (
                <div className="h-20 w-20 bg-gradient-to-r from-neon-purple to-neon-blue rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                  {companyData.companyName[0]}
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-2xl font-bold">{companyData.companyName}</h1>
              <p className="text-gray-600">{companyData.industry} • {companyData.location}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="text-sm text-gray-600">Profile Completeness</div>
              <div className="flex items-center gap-2">
                <Progress value={companyData.profileCompleteness} className="h-2 w-40" />
                <span className="text-sm font-medium">{companyData.profileCompleteness}%</span>
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
        {/* Left column - Company Info */}
        <div className="space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Company Size</h3>
                <p className="text-base">{companyData.companySize} employees</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Website</h3>
                <a href={companyData.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-neon-purple hover:underline">
                  {companyData.websiteUrl.replace(/(^\w+:|^)\/\//, '')}
                </a>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="text-base">{companyData.location}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Employee Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {companyData.benefits.map((benefit, i) => (
                  <div 
                    key={i} 
                    className="px-3 py-1 bg-neon-blue/10 text-neon-blue text-sm rounded-full"
                  >
                    {benefit}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Team Composition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(companyData.team).map(([department, percentage]) => (
                <div key={department}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{department}</span>
                    <span>{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Description & Jobs */}
        <div className="col-span-1 lg:col-span-2">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="jobs">Open Positions</TabsTrigger>
              <TabsTrigger value="culture">Culture</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about">
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle>About {companyData.companyName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {companyData.description}
                  </p>
                  
                  <div className="mt-8">
                    <h3 className="font-semibold text-lg mb-4">Why Join Us?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex gap-3 p-4 rounded-lg bg-gray-50">
                        <div className="text-neon-purple">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Innovation</h4>
                          <p className="text-sm text-gray-600">Work on cutting-edge projects that push boundaries</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 p-4 rounded-lg bg-gray-50">
                        <div className="text-neon-blue">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Learning & Growth</h4>
                          <p className="text-sm text-gray-600">Continuous learning opportunities and career advancement</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 p-4 rounded-lg bg-gray-50">
                        <div className="text-neon-green">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Collaborative Culture</h4>
                          <p className="text-sm text-gray-600">Work with talented individuals in a supportive environment</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 p-4 rounded-lg bg-gray-50">
                        <div className="text-neon-pink">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Competitive Compensation</h4>
                          <p className="text-sm text-gray-600">Above-market salary and comprehensive benefits</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="jobs">
              <Card className="glass-card border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Open Positions</CardTitle>
                    <CardDescription>Current job opportunities at {companyData.companyName}</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity">
                    Post New Job
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {companyData.activeJobs.map((job) => (
                      <div key={job.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <div className="text-sm bg-neon-purple/10 text-neon-purple px-2 py-1 rounded">
                            {job.type}
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <span>{job.department}</span>
                          <span className="mx-2">•</span>
                          <span>{job.location}</span>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Posted {new Date(job.postedDate).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}
                          </div>
                          <div className="space-x-2">
                            <Button variant="outline" size="sm">View Applications</Button>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="culture">
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle>Company Culture</CardTitle>
                  <CardDescription>What it's like to work at {companyData.companyName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-10 border-2 border-dashed rounded-lg">
                    <h3 className="font-medium text-lg mb-2">Showcase your company culture</h3>
                    <p className="text-gray-500 mb-4">Add photos, videos, and testimonials from your team members to give candidates a glimpse of your workplace culture.</p>
                    <Button>Add Culture Content</Button>
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

export default CompanyProfile;
