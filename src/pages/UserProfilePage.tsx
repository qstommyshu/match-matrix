import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getUserProfileById,
  Profile,
  JobSeekerProfile,
  EmployerProfile,
} from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Extended Profile type that includes joined tables
interface ProfileWithDetails extends Profile {
  job_seeker_profile: JobSeekerProfile | null;
  employer_profile: EmployerProfile | null;
}

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileWithDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError("User ID is required");
        setLoading(false);
        return;
      }

      try {
        const userData = await getUserProfileById(userId);
        if (!userData) {
          setError("User profile not found");
        } else {
          setProfile(userData as ProfileWithDetails);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500 text-lg">{error}</p>
        <Button variant="outline" onClick={handleBack}>
          Go Back
        </Button>
      </div>
    );
  }

  const isJobSeeker = profile?.job_seeker_profile !== null;
  const isEmployer = profile?.employer_profile !== null;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Button variant="outline" onClick={handleBack} className="mb-6">
        ← Back
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              {profile?.full_name || "Profile"}
            </CardTitle>
            {isJobSeeker && (
              <Badge variant="outline" className="bg-blue-50">
                Job Seeker
              </Badge>
            )}
            {isEmployer && (
              <Badge variant="outline" className="bg-green-50">
                Employer
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium text-lg mb-2">Contact Information</h3>
            <p className="text-gray-600">{profile?.email}</p>
          </div>

          {isJobSeeker && profile?.job_seeker_profile && (
            <>
              {profile.job_seeker_profile.headline && (
                <div>
                  <h3 className="font-medium text-lg mb-2">Headline</h3>
                  <p className="text-gray-600">
                    {profile.job_seeker_profile.headline}
                  </p>
                </div>
              )}

              {profile.job_seeker_profile.bio && (
                <div>
                  <h3 className="font-medium text-lg mb-2">About</h3>
                  <p className="text-gray-600">
                    {profile.job_seeker_profile.bio}
                  </p>
                </div>
              )}

              {profile.job_seeker_profile.years_of_experience && (
                <div>
                  <h3 className="font-medium text-lg mb-2">Experience</h3>
                  <p className="text-gray-600">
                    {profile.job_seeker_profile.years_of_experience} years
                  </p>
                </div>
              )}

              {profile.job_seeker_profile.education && (
                <div>
                  <h3 className="font-medium text-lg mb-2">Education</h3>
                  <p className="text-gray-600">
                    {profile.job_seeker_profile.education}
                  </p>
                </div>
              )}
            </>
          )}

          {isEmployer && profile?.employer_profile && (
            <>
              {profile.employer_profile.company_name && (
                <div>
                  <h3 className="font-medium text-lg mb-2">Company</h3>
                  <p className="text-gray-600">
                    {profile.employer_profile.company_name}
                  </p>
                </div>
              )}

              {profile.employer_profile.company_description && (
                <div>
                  <h3 className="font-medium text-lg mb-2">
                    Company Description
                  </h3>
                  <p className="text-gray-600">
                    {profile.employer_profile.company_description}
                  </p>
                </div>
              )}

              {profile.employer_profile.website && (
                <div>
                  <h3 className="font-medium text-lg mb-2">Website</h3>
                  <a
                    href={profile.employer_profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {profile.employer_profile.website}
                  </a>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;
