import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { FiMenu, FiX, FiSearch, FiUser, FiLogOut, FiLogIn, FiPlus, FiHome, FiSettings } from 'react-icons/fi';
import Button from '../common/Button';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  // Helper function to get the correct avatar URL
  const getAvatarUrl = (user) => {
    if (!user || !user.profile) return '/assets/images/default-avatar.png';
    
    // Check if avatar is stored in MongoDB (indicated by mongodb:// prefix)
    if (user.profile.avatar && user.profile.avatar.startsWith('mongodb://')) {
      return `/api/users/${user._id}/avatar`;
    }
    
    // Otherwise return the regular avatar URL
    return user.profile.avatar || '/assets/images/default-avatar.png';
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  // Check if page is scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('#navbar-menu')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-dark-900/95 backdrop-blur-sm shadow-md' : 'bg-dark-900'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-500">RYZE</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
            <Link to="/category/digital-goods" className="text-gray-300 hover:text-white">Digital Goods</Link>
            <Link to="/category/services" className="text-gray-300 hover:text-white">Services</Link>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dark-800 text-white rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 w-40 lg:w-56"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </form>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button 
                  to="/create-post" 
                  variant="primary" 
                  size="sm"
                  icon={<FiPlus />}
                >
                  New Post
                </Button>
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
                    <img 
                      src={getAvatarUrl(user)}
                      alt={user?.username}
                      className="w-8 h-8 rounded-full object-cover border border-dark-700"
                    />
                    <span>{user?.username}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-dark-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link 
                      to={`/profile/${user?.username}`} 
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 flex items-center"
                    >
                      <FiUser className="mr-2" /> Profile
                    </Link>
                    
                    {user?.role === 'admin' || user?.role === 'owner' ? (
                      <Link 
                        to="/admin" 
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 flex items-center"
                      >
                        <FiSettings className="mr-2" /> Admin Dashboard
                      </Link>
                    ) : null}
                    
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 flex items-center"
                    >
                      <FiLogOut className="mr-2" /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Button to="/login" variant="ghost" size="sm" icon={<FiLogIn />}>
                  Login
                </Button>
                <Button to="/register" variant="primary" size="sm">
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div id="navbar-menu" className="md:hidden bg-dark-800 pt-2 pb-4 px-4">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dark-700 text-white rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </form>

          {/* Mobile Nav Links */}
          <nav className="space-y-3">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-gray-300 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <FiHome /> <span>Home</span>
            </Link>
            <Link 
              to="/category/digital-goods" 
              className="block text-gray-300 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Digital Goods
            </Link>
            <Link 
              to="/category/services" 
              className="block text-gray-300 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
          </nav>

          {/* Mobile User Actions */}
          <div className="mt-6 pt-6 border-t border-dark-600">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <img 
                    src={getAvatarUrl(user)}
                    alt={user?.username}
                    className="w-8 h-8 rounded-full object-cover border border-dark-700"
                  />
                  <span className="text-white">{user?.username}</span>
                </div>
                
                <Link 
                  to="/create-post"
                  className="flex items-center space-x-2 text-primary-500 hover:text-primary-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiPlus /> <span>New Post</span>
                </Link>
                
                <Link 
                  to={`/profile/${user?.username}`} 
                  className="flex items-center space-x-2 text-gray-300 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiUser /> <span>Profile</span>
                </Link>
                
                {user?.role === 'admin' || user?.role === 'owner' ? (
                  <Link 
                    to="/admin" 
                    className="flex items-center space-x-2 text-gray-300 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiSettings /> <span>Admin Dashboard</span>
                  </Link>
                ) : null}
                
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white"
                >
                  <FiLogOut /> <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full py-2 text-center bg-dark-700 hover:bg-dark-600 text-white rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full py-2 text-center bg-primary-600 hover:bg-primary-700 text-white rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;