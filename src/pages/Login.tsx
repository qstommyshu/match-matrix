import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginForm from '@/components/auth/LoginForm';
const Login = () => {
  return <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-16 px-4 flex items-center justify-center my-[70px]">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>
      <Footer />
    </div>;
};
export default Login;