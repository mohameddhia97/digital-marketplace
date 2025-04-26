import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { AuthContext } from '../contexts/AuthContext';
import { postAPI, categoryAPI } from '../services/api';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import PostCard from '../components/common/PostCard';

const Category = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useContext(AuthContext);
  
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch category and posts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch category by slug
        const categoryRes = await categoryAPI.getCategory(slug);
        setCategory(categoryRes.data.category);
        
        // Fetch posts in this category
        const params = {
          category: categoryRes.data.category._id,
          sortBy: sortBy
        };
        const postsRes = await postAPI.getPosts(params);
        setPosts(postsRes.data.posts || []);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load category. It may not exist or has been removed.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, sortBy]);

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

  if (error || !category) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error || 'Category not found'}</p>
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
    <div className="pb-10">
      {/* Category Header */}
      <div className="bg-dark-800 rounded-xl p-8 mb-8 flex">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold text-white mb-3">{category.name}</h1>
          <p className="text-gray-300 mb-6">{category.description}</p>
          
          {isAuthenticated && (
            <Button 
              to="/create-post" 
              variant="primary" 
              icon={<FiPlus />}
              state={{ preSelectedCategory: category._id }}
            >
              Create Post in {category.name}
            </Button>
          )}
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
              Posts in {category.name}
            </h2>
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
                  state={{ preSelectedCategory: category._id }}
                >
                  Create First Post
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;