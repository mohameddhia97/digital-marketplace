import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiTrash2, FiEye, FiRefreshCw, FiSearch, FiFilter } from 'react-icons/fi';
import { adminAPI, postAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  // Fetch posts from API
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPosts();
      setPosts(res.data.posts);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for filter
  const fetchCategories = async () => {
    try {
      const res = await adminAPI.getCategories();
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle category filter change
  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Handle post deletion
  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await postAPI.deletePost(postId);
        setPosts(posts.filter(post => post._id !== postId));
        toast.success('Post deleted successfully');
      } catch (err) {
        console.error('Error deleting post:', err);
        toast.error('Failed to delete post');
      }
    }
  };

  // Filter posts based on search term and filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || post.category._id === categoryFilter;
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'free' && post.isFree) ||
      (statusFilter === 'paid' && !post.isFree) ||
      (statusFilter === 'sold' && post.isSold);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && posts.length === 0) {
    return <Spinner size="large" />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Post Management</h1>
        <Button 
          variant="primary"
          icon={<FiRefreshCw />}
          onClick={fetchPosts}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg mb-6">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-dark-800 p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-10 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-500" size={18} />
            </div>
          </div>

          {/* Category Filter */}
          <div className="md:w-48">
            <select
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-dark-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Author</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <tr key={post._id} className="hover:bg-dark-700/50">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-white truncate max-w-xs">{post.title}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={post.author.profile?.avatar || '/assets/images/default-avatar.png'}
                          alt={post.author.username}
                          className="h-6 w-6 rounded-full mr-2"
                        />
                        <div className="text-sm text-gray-300">{post.author.username}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-dark-600 text-gray-300">
                        {post.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{formatDate(post.createdAt)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {post.isSold ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900 text-yellow-300">
                          Sold
                        </span>
                      ) : post.isFree ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">
                          Free
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900 text-blue-300">
                          ${post.price}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <Link
                          to={`/post/${post._id}`}
                          className="text-gray-400 hover:text-white"
                        >
                          <FiEye size={16} />
                        </Link>
                        <Link
                          to={`/edit-post/${post._id}`}
                          className="text-blue-500 hover:text-blue-400"
                        >
                          <FiEdit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                    {loading ? 'Loading posts...' : 'No posts found matching your search criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PostManagement;