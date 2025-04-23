
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      {/* Background decoration - animated circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-20 w-96 h-96 rounded-full bg-neon-purple/10 blur-3xl animate-float"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-neon-blue/10 blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue">
              Perfect Match
            </span>
            <br /> for Your Career
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Match Matrix uses advanced algorithms to connect the right talent with the right opportunities. Find your perfect career match today.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity">
                Find Your Match
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-neon-purple text-neon-purple hover:bg-neon-purple/10 transition-colors">
                How It Works
              </Button>
            </Link>
          </div>
          
          {/* Floating cards - animated */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 relative animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="glass-card p-6 animate-float" style={{ animationDelay: '0s' }}>
              <div className="w-12 h-12 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">For Job Seekers</h3>
              <p className="text-gray-600 text-sm">Discover opportunities that match your skills, experience, and career goals.</p>
            </div>
            
            <div className="glass-card p-6 animate-float" style={{ animationDelay: '0.3s', animationDuration: '3.5s' }}>
              <div className="w-12 h-12 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">For Companies</h3>
              <p className="text-gray-600 text-sm">Find the perfect candidates that align with your company's needs and culture.</p>
            </div>
            
            <div className="glass-card p-6 animate-float" style={{ animationDelay: '0.6s', animationDuration: '4s' }}>
              <div className="w-12 h-12 rounded-full bg-neon-green/20 text-neon-green flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Matching</h3>
              <p className="text-gray-600 text-sm">Our advanced algorithms ensure precise matches based on multiple factors.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
