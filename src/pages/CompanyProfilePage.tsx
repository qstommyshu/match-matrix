
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CompanyProfile from '@/components/profile/CompanyProfile';

const CompanyProfilePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        <CompanyProfile />
      </main>
      <Footer />
    </div>
  );
};

export default CompanyProfilePage;
