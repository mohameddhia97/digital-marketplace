import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-800 border-t border-dark-700">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-bold text-primary-500">RYZE</span>
            </Link>
            <p className="text-gray-400 mb-4">
              A modern marketplace for digital goods, services, and community discussions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <FiGithub size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <FiInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-medium mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/digital-goods" className="text-gray-400 hover:text-white transition-colors">
                  Digital Goods
                </Link>
              </li>
              <li>
                <Link to="/category/services" className="text-gray-400 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/category/tutorials" className="text-gray-400 hover:text-white transition-colors">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link to="/category/discussions" className="text-gray-400 hover:text-white transition-colors">
                  Discussions
                </Link>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-medium mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-dark-700 text-center">
          <p className="text-gray-500">
            &copy; {currentYear} RYZE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;