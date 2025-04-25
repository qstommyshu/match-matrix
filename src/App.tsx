import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import { ProfileProvider } from "./lib/ProfileContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Header from "./components/Header";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CandidateProfilePage from "./pages/CandidateProfilePage";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import { ProfileCompletion } from "./components/profile/ProfileCompletion";
import NotFound from "./pages/NotFound";
import { DashboardPage } from "./pages/DashboardPage";
import PostJobPage from "./pages/PostJobPage";
import EditJobPage from "./pages/EditJobPage";
import JobDetailPage from "./pages/JobDetailPage";
import JobSearchPage from "./pages/JobSearchPage";
import ManageJobsPage from "./pages/ManageJobsPage";
import ViewApplicantsPage from "./pages/ViewApplicantsPage";
import UserProfilePage from "./pages/UserProfilePage";
import ApplicationsPage from "./pages/ApplicationsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProfileProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Header />
            <main className="pt-20">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/profile-setup"
                  element={
                    <ProtectedRoute requireProfile={false}>
                      <ProfileCompletion />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/applications"
                  element={
                    <ProtectedRoute allowedRoles={["job_seeker"]}>
                      <ApplicationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate-profile"
                  element={
                    <ProtectedRoute>
                      <CandidateProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <CandidateProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/company-profile"
                  element={
                    <ProtectedRoute>
                      <CompanyProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-profile"
                  element={
                    <ProtectedRoute>
                      <EditProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-company-profile"
                  element={
                    <ProtectedRoute>
                      <EditProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs/:jobId"
                  element={
                    <ProtectedRoute>
                      <JobDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs/:jobId/applicants"
                  element={
                    <ProtectedRoute allowedRoles={["employer"]}>
                      <ViewApplicantsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-job/:jobId"
                  element={
                    <ProtectedRoute allowedRoles={["employer"]}>
                      <EditJobPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs"
                  element={
                    <ProtectedRoute>
                      <JobSearchPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post-job"
                  element={
                    <ProtectedRoute allowedRoles={["employer"]}>
                      <PostJobPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-jobs"
                  element={
                    <ProtectedRoute allowedRoles={["employer"]}>
                      <ManageJobsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-profile/:userId"
                  element={
                    <ProtectedRoute>
                      <UserProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </BrowserRouter>
        </TooltipProvider>
      </ProfileProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
