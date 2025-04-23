import React from "react";
import { useProfile } from "@/lib/ProfileContext";
import EditJobSeekerProfile from "@/components/profile/EditJobSeekerProfile";
import EditEmployerProfile from "@/components/profile/EditEmployerProfile";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

const EditProfilePage = () => {
  const { profile, loading, isJobSeeker, isEmployer } = useProfile();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (isJobSeeker()) {
      return <EditJobSeekerProfile />;
    }

    if (isEmployer()) {
      return <EditEmployerProfile />;
    }

    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">No Profile Found</h2>
        <p>Please complete your profile setup first.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">{renderContent()}</main>
      <Footer />
    </div>
  );
};

export default EditProfilePage;
