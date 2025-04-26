import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiUser, FiMessageSquare, FiCheckCircle, FiPlus, FiEdit, FiHeart, FiClock } from 'react-icons/fi';
import { AuthContext } from '../contexts/AuthContext';
import { userAPI, postAPI } from '../services/api';
import Button from '../components/common/Button';
import PostCard from '../components/common/PostCard';
import Spinner from '../components/common/Spinner';
import moment from 'moment';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vouchLoading, setVouchLoading] = useState(false);
  const [repLoading, setRepLoading] = useState(false);

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

  // Check if profile belongs to current user
  const isOwnProfile = isAuthenticated && currentUser?.username === username;

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await userAPI.getProfile(username);
        setUser(res.data.user);
        
        // Fetch user's posts
        const postsRes = await postAPI.getPosts({ author: res.data.user._id });
        setPosts(postsRes.data.posts || []);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  // Handle giving a vouch
  const handleVouch = async () => {
    if (!isAuthenticated || isOwnProfile) return;
    
    setVouchLoading(true);
    try {
      const res = await userAPI.giveVouch(user._id);
      setUser({
        ...user,
        vouches: res.data.vouches
      });
    } catch (err) {
      console.error('Error giving vouch:', err);
    } finally {
      setVouchLoading(false);
    }
  };

  // Handle giving reputation
  const handleRep = async () => {
    if (!isAuthenticated || isOwnProfile) return;
    
    setRepLoading(true);
    try {
      const res = await userAPI.giveRep(user._id);
      setUser({
        ...user,
        reputation: res.data.reputation
      });
    } catch (err) {
      console.error('Error giving rep:', err);
    } finally {
      setRepLoading(false);
    }
  };

  // Get user role display and color
  const getRoleBadge = (role) => {
    const roleConfig = {
      owner: { color: 'bg-red-900 text-red-300', label: 'Owner' },
      admin: { color: 'bg-purple-900 text-purple-300', label: 'Admin' },
      moderator: { color: 'bg-blue-900 text-blue-300', label: 'Moderator' },
      trusted: { color: 'bg-green-900 text-green-300', label: 'Trusted' },
      user: { color: 'bg-gray-900 text-gray-300', label: 'User' }
    };
    
    const config = roleConfig[role] || roleConfig.user;
    
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return <Spinner size="large" />;
  }

  if (error || !user) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error || 'User not found'}</p>
        <Button
          to="/"
          variant="primary"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="bg-dark-800 rounded-xl overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary-900 to-dark-800"></div>
        
        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end -mt-12 mb-6">
            {/* Avatar */}
            <div className="flex-shrink-0 mr-5">
              <div className="relative">
                <img
                  src={getAvatarUrl(user)}
                  alt={user.username}
                  className="w-24 h-24 rounded-full border-4 border-dark-800 object-cover"
                />
                {user.isActive && (
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-800"></div>
                )}
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-grow mt-4 md:mt-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                {getRoleBadge(user.role)}
              </div>
              <div className="flex flex-wrap items-center text-sm text-gray-400 gap-3">
                <div className="flex items-center">
                  <FiClock className="mr-1" />
                  <span>Joined {moment(user.createdAt).format('MMMM YYYY')}</span>
                </div>
                <div className="flex items-center">
                  <FiMessageSquare className="mr-1" />
                  <span>{user.postCount} Posts</span>
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="mr-1" />
                  <span>{user.vouches?.received?.length || 0} Vouches</span>
                </div>
                <div className="flex items-center">
                  <FiHeart className="mr-1" />
                  <span>{user.reputation} Rep</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              {isOwnProfile ? (
                <Button
                  to="/settings/profile"
                  variant="secondary"
                  size="sm"
                  icon={<FiEdit />}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleVouch}
                    variant="secondary"
                    size="sm"
                    icon={<FiCheckCircle />}
                    isLoading={vouchLoading}
                    disabled={!isAuthenticated || vouchLoading}
                  >
                    Vouch
                  </Button>
                  <Button
                    onClick={handleRep}
                    variant="secondary"
                    size="sm"
                    icon={<FiHeart />}
                    isLoading={repLoading}
                    disabled={!isAuthenticated || repLoading}
                  >
                    +Rep
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Bio */}
          {user.profile.bio && (
            <div className="bg-dark-700 p-4 rounded-lg mb-6">
              <p className="text-gray-300 whitespace-pre-line">{user.profile.bio}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Content Tabs */}
      <div className="mt-8">
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-dark-700 mb-6">
          <button
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'posts'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'vouches'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('vouches')}
          >
            Vouches
          </button>
          <button
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'activity'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
        </div>
        
        {/* Tab Content */}
        <div>
          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <>
              {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="bg-dark-800 rounded-lg p-10 text-center">
                  <FiMessageSquare className="mx-auto text-4xl text-gray-600 mb-4" />
                  <p className="text-gray-400 mb-4">No posts yet.</p>
                  {isOwnProfile && (
                    <Button 
                      to="/create-post" 
                      variant="primary" 
                      icon={<FiPlus />}
                    >
                      Create New Post
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
          
          {/* Vouches Tab */}
          {activeTab === 'vouches' && (
            <div className="bg-dark-800 rounded-lg p-6">
              {user.vouches?.received?.length > 0 ? (
                <ul className="divide-y divide-dark-700">
                  {user.vouches.received.map((vouch) => (
                    <li key={vouch._id} className="py-4 flex items-center">
                      <img
                        src={vouch.profile?.avatar || '/assets/images/default-avatar.png'}
                        alt={vouch.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="ml-3">
                        <Link to={`/profile/${vouch.username}`} className="text-white hover:text-primary-500 font-medium">
                          {vouch.username}
                        </Link>
                        <p className="text-gray-500 text-sm">
                          {moment(vouch.date).fromNow()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <FiCheckCircle className="mx-auto text-4xl text-gray-600 mb-4" />
                  <p className="text-gray-400">No vouches yet.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="bg-dark-800 rounded-lg p-6">
              <div className="text-center py-6">
                <FiUser className="mx-auto text-4xl text-gray-600 mb-4" />
                <p className="text-gray-400">Activity feed coming soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;