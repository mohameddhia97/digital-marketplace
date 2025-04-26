import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiSave, FiLink, FiAlignLeft, FiImage } from 'react-icons/fi';
import { AuthContext } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    customUrl: '',
    email: '',
    avatarUrl: '',
  });
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Set initial form data from user object
  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.profile?.bio || '',
        customUrl: user.profile?.customUrl || '',
        email: user.email || '',
        avatarUrl: user.profile?.avatar || '',
      });
      
      setLoading(false);
    }
  }, [user]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Update profile data
      await userAPI.updateProfile({
        bio: formData.bio,
        customUrl: formData.customUrl,
        email: formData.email,
        avatar: formData.avatarUrl
      });
      
      toast.success('Profile updated successfully');
      navigate(`/profile/${user.username}`);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner size="large" />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-dark-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-dark-700">
          <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Avatar URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Profile Avatar URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiImage className="text-gray-500" />
              </div>
              <input
                type="text"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="https://example.com/your-image.jpg"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter the URL of an image to use as your avatar
            </p>
            
            {/* Avatar Preview */}
            {formData.avatarUrl && (
              <div className="mt-3 flex justify-center">
                <div className="relative">
                  <img
                    src={formData.avatarUrl}
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-dark-700"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/images/default-avatar.png';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Your email address"
            />
          </div>
          
          {/* Custom URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Custom URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLink className="text-gray-500" />
              </div>
              <input
                type="text"
                name="customUrl"
                value={formData.customUrl}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="your-unique-url"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This will be used for your profile URL: /profile/your-unique-url
            </p>
          </div>
          
          {/* Bio */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Bio
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-2 pointer-events-none">
                <FiAlignLeft className="text-gray-500" />
              </div>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="5"
                className="w-full pl-10 pr-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Max 500 characters
            </p>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <Button
              type="button"
              variant="secondary"
              className="mr-3"
              onClick={() => navigate(`/profile/${user.username}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<FiSave />}
              isLoading={saving}
              disabled={saving}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;