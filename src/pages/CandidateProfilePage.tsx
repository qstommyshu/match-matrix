
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CandidateProfile from '@/components/profile/CandidateProfile';

const CandidateProfilePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        <CandidateProfile />
      </main>
      <Footer />
    </div>
  );
};

export default CandidateProfilePage;
