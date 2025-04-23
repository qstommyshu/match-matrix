
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue">
            Match<span className="font-normal">Matrix</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-neon-purple transition-colors">
            Home
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-neon-purple transition-colors">
            How it Works
          </Link>
          <Link to="/pricing" className="text-sm font-medium hover:text-neon-purple transition-colors">
            Pricing
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" className="text-sm">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button className="text-sm bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
