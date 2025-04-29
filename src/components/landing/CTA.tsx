import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden relative">
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/90 to-neon-blue/90 z-0"></div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/4"></div>

          {/* Content */}
          <div className="relative z-10 px-8 md:px-16 py-16 md:py-20 text-center text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Find Your Perfect Match?
            </h2>

            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Join thousands of professionals and companies already using Match
              Matrix to connect talent with opportunity.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-white text-neon-purple hover:bg-white/90 transition-opacity"
                >
                  Create Your Profile
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  className="bg-white text-neon-purple hover:bg-white/90 transition-opacity"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTA;
