import React from 'react';
import { Sprout, Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Sprout className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold">Nomagro</span>
            </div>
            <p className="text-gray-300 text-sm">
              Empowering African agriculture through AI-powered predictions and smart farming solutions.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-green-500 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-green-500 cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-gray-400 hover:text-green-500 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-300 hover:text-green-500 transition-colors">Home</Link>
              <Link to="/about" className="block text-gray-300 hover:text-green-500 transition-colors">About Us</Link>
              <Link to="/blog" className="block text-gray-300 hover:text-green-500 transition-colors">Blog</Link>
              <Link to="/login" className="block text-gray-300 hover:text-green-500 transition-colors">Login</Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Our Services</h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>Flood & Drought Prediction</p>
              <p>Crop Recommendations</p>
              <p>Weather Risk Systems</p>
              <p>Market Intelligence</p>
              <p>Price Prediction</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-green-500" />
                <span className="text-gray-300 text-sm">info@nomagro.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-500" />
                <span className="text-gray-300 text-sm">+233 50 123 4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-green-500" />
                <span className="text-gray-300 text-sm">Accra, Ghana</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Nomagro. All rights reserved. Empowering African Agriculture.
          </p>
        </div>
      </div>
    </footer>
  );
}