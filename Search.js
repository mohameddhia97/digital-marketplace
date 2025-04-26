import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { postAPI } from '../services/api';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import PostCard from '../components/common/PostCard';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch search results
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!initialQuery.trim()) return;
      
      setLoading(true);
      setError(null);
      try {
        const params = {
          q: initialQuery,
          sortBy: sortBy
        };
        const res = await postAPI.getPosts(params);
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error('Error searching posts:', err);
        setError('Failed to load search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [initialQuery, sortBy]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Toggle filters on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="pb-10">
      {/* Search Header */}
      <div className="bg-dark-800 rounded-xl p-6 mb-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">Search Posts</h1>
          
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-500" size={20} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 rounded-lg bg-dark-700 border border-dark-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search for posts, keywords, tags..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={!searchQuery.trim()}
                >
                  Search
                </Button>
              </div>
            </div>
          </form>
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
                  <option value="relevance">Most Relevant</option>
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

        {/* Search Results */}
        <div className="lg:col-span-3">
          {/* Loading State */}
          {loading ? (
            <Spinner size="large" />
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
              >
                Try Again
              </Button>
            </div>
          ) : initialQuery ? (
            <>
              {/* Results Count */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Search Results for "{initialQuery}"
                </h2>
                <p className="text-gray-400 mt-1">
                  Found {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                </p>
              </div>

              {/* Results List */}
              {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="bg-dark-800 rounded-lg p-10 text-center">
                  <p className="text-gray-400">No posts found matching your search.</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-dark-800 rounded-lg p-10 text-center">
              <p className="text-gray-400">Enter a search term to find posts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;