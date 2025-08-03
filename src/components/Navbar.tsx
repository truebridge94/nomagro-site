import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sprout, Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Sprout className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-800">Nomagro</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/about') ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              About
            </Link>
            <Link
              to="/blog"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/blog') ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Blog
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard') ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-green-600'
                  }`}
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-green-600 hover:bg-green-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/') ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-green-600'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/about') ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-green-600'
              }`}
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              to="/blog"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/blog') ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-green-600'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive('/dashboard') ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-green-600'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="px-3 py-2 text-sm text-gray-600">
                  Welcome, {user.name}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-green-600 hover:bg-green-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}