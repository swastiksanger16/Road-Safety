import React, { useEffect, useState } from 'react';
import { MapPin, Shield, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  const currentPage = location.pathname;

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md'
          : 'bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link
            to="/"
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <MapPin className="h-8 w-8 text-blue-600" />
              <Shield className="h-4 w-4 text-orange-500 absolute -top-1 -right-1" />
            </div>
            <span className="font-extrabold text-xl sm:text-2xl text-gray-900 block">
              Satraksha
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center space-x-3">
            {currentPage !== '/login' && (
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 hover:bg-gray-50 rounded-lg"
              >
                Login
              </Link>
            )}
            {currentPage !== '/signup' && (
              <Link
                to="/signup"
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Sign Up
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="sm:hidden mt-2 space-y-2 pb-4">
            {currentPage !== '/login' && (
              <Link
                to="/login"
                className="block px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 hover:bg-gray-50 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
            {currentPage !== '/signup' && (
              <Link
                to="/signup"
                className="block px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 mx-4"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
