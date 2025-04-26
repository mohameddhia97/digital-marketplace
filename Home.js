import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiFilter, FiPlus } from 'react-icons/fi';
import { AuthContext } from '../contexts/AuthContext';
import { postAPI, categoryAPI } from '../services/api';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import PostCard from '../components/common/PostCard';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  // Fetch posts and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch posts with params
        const params = {
          sortBy: sortBy,
          category: activeCategory !== 'all' ? activeCategory : undefined,
          limit: 10
        };
        
        const postsRes = await postAPI.getPosts(params);
        setPosts(postsRes.data.posts || []);
        
        // Fetch categories
        const categoriesRes = await categoryAPI.getCategories();
        setCategories(categoriesRes.data.categories || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeCategory, sortBy]);

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Toggle filters on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (loading) {
    return <Spinner size="large" />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="primary"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-dark-800 to-primary-900 rounded-xl p-8 mb-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold text-white mb-4">
            Digital Marketplace & Community
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            Buy, sell, and discuss digital goods and services in our secure marketplace. Join our community of creators and entrepreneurs.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              to="/category/digital-goods" 
              variant="primary" 
              size="lg"
            >
              Browse Digital Goods
            </Button>
            {isAuthenticated && (
              <Button 
                to="/create-post" 
                variant="secondary" 
                size="lg" 
                icon={<FiPlus />}
              >
                Create Post
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar with Filters */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Filters</h2>
              <button
                className="lg:hidden flex items-center text-gray-400 hover:text-white"
                onClick={toggleFilters}
              >
                <FiFilter className="mr-1" />
                <span>{showFilters ? 'Hide' : 'Show'}</span>
              </button>
            </div>

            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {/* Categories */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Categories</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      className={`block w-full text-left px-3 py-2 rounded-md ${
                        activeCategory === 'all'
                          ? 'bg-primary-700 text-white'
                          : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                      }`}
                      onClick={() => handleCategoryChange('all')}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map((category) => (
                    <li key={category._id}>
                      <button
                        className={`block w-full text-left px-3 py-2 rounded-md ${
                          activeCategory === category._id
                            ? 'bg-primary-700 text-white'
                            : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                        }`}
                        onClick={() => handleCategoryChange(category._id)}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sort By */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full px-3 py-2 rounded-md bg-dark-700 text-white border border-dark-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="latest">Latest</option>
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Price</h3>
                <ul className="space-y-2">
                  <li>
                    <label className="flex items-center text-gray-300">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-primary-600 rounded border-dark-600 bg-dark-700 focus:ring-primary-500"
                      />
                      <span className="ml-2">Free</span>
                    </label>
                  </li>
                  <li>
                    <label className="flex items-center text-gray-300">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-primary-600 rounded border-dark-600 bg-dark-700 focus:ring-primary-500"
                      />
                      <span className="ml-2">Paid</span>
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="lg:col-span-3">
          {/* Section Title */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {activeCategory === 'all' ? 'Latest Posts' : 'Category Posts'}
            </h2>
            <Link
              to="/search"
              className="text-primary-500 hover:text-primary-400 flex items-center"
            >
              View All <FiChevronRight className="ml-1" />
            </Link>
          </div>

          {/* Posts */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-dark-800 rounded-lg p-10 text-center">
              <p className="text-gray-400 mb-4">No posts found in this category.</p>
              {isAuthenticated && (
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
        </div>
      </div>
    </div>
  );
};

export default Home;