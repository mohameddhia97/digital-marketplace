import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiFileText, FiTag, FiSettings, FiBarChart2, FiMenu, FiX } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import Spinner from '../../components/common/Spinner';

// Import Admin Dashboard Components
import UserManagement from './UserManagement';
import PostManagement from './PostManagement';
import CategoryManagement from './CategoryManagement';
import Settings from './Settings';

// Overview component
const Overview = ({ stats }) => {
  // If stats are not available, show placeholder data
  const statData = stats || {
    totalUsers: 0,
    totalPosts: 0,
    newUsersToday: 0,
    newPostsToday: 0,
    activeUsers: 0,
    totalCategories: 0,
    totalReplies: 0
  };
  
  const statCards = [
    { title: 'Total Users', value: statData.totalUsers, icon: <FiUsers className="text-blue-500" size={24} /> },
    { title: 'Total Posts', value: statData.totalPosts, icon: <FiFileText className="text-green-500" size={24} /> },
    { title: 'New Today', value: statData.newUsersToday, icon: <FiUsers className="text-yellow-500" size={24} /> },
    { title: 'Posts Today', value: statData.newPostsToday, icon: <FiFileText className="text-red-500" size={24} /> },
    { title: 'Active Users', value: statData.activeUsers, icon: <FiUsers className="text-purple-500" size={24} /> },
    { title: 'Categories', value: statData.totalCategories, icon: <FiTag className="text-pink-500" size={24} /> }
  ];
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="bg-dark-800 p-6 rounded-lg border border-dark-700 hover:border-primary-500 transition-colors"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-dark-700">
                {stat.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
                <p className="text-white text-2xl font-bold">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-dark-800 rounded-lg border border-dark-700">
          <div className="px-6 py-4 border-b border-dark-700">
            <h2 className="text-lg font-medium text-white">Recent Users</h2>
          </div>
          <div className="p-6">
            <div className="bg-dark-700 p-10 rounded-md text-center">
              <p className="text-gray-400">User data will appear here</p>
            </div>
          </div>
        </div>
        
        {/* Recent Posts */}
        <div className="bg-dark-800 rounded-lg border border-dark-700">
          <div className="px-6 py-4 border-b border-dark-700">
            <h2 className="text-lg font-medium text-white">Recent Posts</h2>
          </div>
          <div className="p-6">
            <div className="bg-dark-700 p-10 rounded-md text-center">
              <p className="text-gray-400">Post data will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log('Fetching admin stats...');
        const res = await adminAPI.getDashboardStats();
        console.log('Stats received:', res.data);
        setStats(res.data.stats);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when changing routes on mobile
  const handleNavigation = (path) => {
    navigate(path);
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // Check if a route is active
  const isActive = (path) => {
    return location.pathname === `/admin${path}` || location.pathname === `/admin${path}/`;
  };

  if (loading && !stats) {
    return <Spinner size="large" />;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Mobile Sidebar Toggle Button */}
      <button
        className="md:hidden fixed bottom-4 right-4 z-20 p-3 rounded-full bg-primary-600 text-white shadow-lg"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`bg-dark-900 w-64 fixed inset-y-0 left-0 transform transition-transform duration-200 ease-in-out z-10 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ top: '4rem', height: 'calc(100vh - 4rem)' }}
      >
        <div className="p-4 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
        </div>

        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleNavigation('/admin')}
                className={`flex items-center w-full px-4 py-2.5 rounded-md ${
                  isActive('') ? 'bg-primary-700 text-white' : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                } transition-colors`}
              >
                <FiBarChart2 className="mr-3" />
                <span>Overview</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/admin/users')}
                className={`flex items-center w-full px-4 py-2.5 rounded-md ${
                  isActive('/users') ? 'bg-primary-700 text-white' : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                } transition-colors`}
              >
                <FiUsers className="mr-3" />
                <span>Users</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/admin/posts')}
                className={`flex items-center w-full px-4 py-2.5 rounded-md ${
                  isActive('/posts') ? 'bg-primary-700 text-white' : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                } transition-colors`}
              >
                <FiFileText className="mr-3" />
                <span>Posts</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/admin/categories')}
                className={`flex items-center w-full px-4 py-2.5 rounded-md ${
                  isActive('/categories') ? 'bg-primary-700 text-white' : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                } transition-colors`}
              >
                <FiTag className="mr-3" />
                <span>Categories</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/admin/settings')}
                className={`flex items-center w-full px-4 py-2.5 rounded-md ${
                  isActive('/settings') ? 'bg-primary-700 text-white' : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                } transition-colors`}
              >
                <FiSettings className="mr-3" />
                <span>Settings</span>
              </button>
            </li>
            <li className="mt-6 pt-6 border-t border-dark-700">
              <Link
                to="/"
                className="flex items-center w-full px-4 py-2.5 rounded-md text-gray-400 hover:bg-dark-800 hover:text-white transition-colors"
              >
                <FiHome className="mr-3" />
                <span>Back to Site</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-dark-900">
        <Routes>
          <Route path="/" element={<Overview stats={stats} />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/posts" element={<PostManagement />} />
          <Route path="/categories" element={<CategoryManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;