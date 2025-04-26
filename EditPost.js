import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiTag, FiDollarSign } from 'react-icons/fi';
import { AuthContext } from '../contexts/AuthContext';
import { postAPI, categoryAPI } from '../services/api';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

const EditPost = () => {
  const { id } = useParams();
  const { user, hasRole } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    price: 0,
    isFree: true
  });
  
  const [originalPost, setOriginalPost] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [errors, setErrors] = useState({});
  
  const { title, content, category, tags, price, isFree } = formData;

  // Fetch post and categories data
  useEffect(() => {
    const fetchData = async () => {
      setFetchingData(true);
      try {
        // Fetch post data
        const postRes = await postAPI.getPost(id);
        const post = postRes.data.post;
        setOriginalPost(post);
        
        // Check if user has permission to edit
        if (post.author._id !== user?._id && !hasRole(['admin', 'moderator', 'owner'])) {
          toast.error('You do not have permission to edit this post');
          navigate(`/post/${id}`);
          return;
        }
        
        // Fetch categories
        const categoriesRes = await categoryAPI.getCategories();
        setCategories(categoriesRes.data.categories || []);
        
        // Set form data from post
        setFormData({
          title: post.title,
          content: post.content,
          category: post.category._id,
          tags: post.tags ? post.tags.join(', ') : '',
          price: post.price || 0,
          isFree: post.isFree
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load post data');
        navigate('/');
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [id, user, hasRole, navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For checkboxes
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
      
      // If making the post free, reset price to 0
      if (name === 'isFree' && checked) {
        setFormData({
          ...formData,
          [name]: checked,
          price: 0
        });
      }
    } 
    // For regular inputs
    else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear any error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    if (!content.trim()) {
      newErrors.content = 'Content is required';
    } else if (content.length < 20) {
      newErrors.content = 'Content must be at least 20 characters';
    }
    
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!isFree && (!price || price <= 0)) {
      newErrors.price = 'Please enter a valid price';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare the tags array
    const tagsArray = tags.trim() 
      ? tags.split(',').map(tag => tag.trim().toLowerCase()) 
      : [];
    
    const postData = {
      title,
      content,
      category,
      tags: tagsArray,
      price: isFree ? 0 : parseFloat(price),
      isFree
    };
    
    setLoading(true);
    try {
      await postAPI.updatePost(id, postData);
      toast.success('Post updated successfully');
      navigate(`/post/${id}`);
    } catch (err) {
      console.error('Error updating post:', err);
      toast.error(err.response?.data?.message || 'Failed to update post');
      setLoading(false);
    }
  };

  if (fetchingData) {
    return <Spinner size="large" />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-dark-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-dark-700">
          <h1 className="text-2xl font-bold text-white">Edit Post</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-md bg-dark-700 border ${
                errors.title ? 'border-red-500' : 'border-dark-600'
              } text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
              placeholder="Enter a descriptive title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>
          
          {/* Category */}
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiTag className="text-gray-500" />
              </div>
              <select
                id="category"
                name="category"
                value={category}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 rounded-md bg-dark-700 border ${
                  errors.category ? 'border-red-500' : 'border-dark-600'
                } text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
          </div>
          
          {/* Content */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={content}
              onChange={handleChange}
              rows="8"
              className={`w-full px-3 py-2 rounded-md bg-dark-700 border ${
                errors.content ? 'border-red-500' : 'border-dark-600'
              } text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
              placeholder="Write your post content here..."
            ></textarea>
            {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
          </div>
          
          {/* Tags */}
          <div className="mb-6">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={tags}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-dark-700 border border-dark-600 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="e.g. design, software, template"
            />
            <p className="mt-1 text-xs text-gray-500">
              Add relevant tags to help users find your post
            </p>
          </div>
          
          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="isFree"
                name="isFree"
                checked={isFree}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-600 rounded bg-dark-700"
              />
              <label htmlFor="isFree" className="ml-2 block text-sm text-gray-300">
                This is a free post
              </label>
            </div>
            
            {!isFree && (
              <div className="mt-3">
                <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="text-gray-500" />
                  </div>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={price}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    className={`block w-full pl-10 pr-3 py-2 rounded-md bg-dark-700 border ${
                      errors.price ? 'border-red-500' : 'border-dark-600'
                    } text-white focus:outline-none focus:ring-1 focus:ring-primary-500`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <Button
              type="button"
              variant="secondary"
              className="mr-3"
              onClick={() => navigate(`/post/${id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<FiSave />}
              isLoading={loading}
              disabled={loading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;