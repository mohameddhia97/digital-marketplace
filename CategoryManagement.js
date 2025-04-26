import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiX, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { FiFolder } from 'react-icons/fi';
import { adminAPI, categoryAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'folder'
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getCategories();
      setCategories(res.data.categories);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input change for new/edited category
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (editingCategory) {
      setEditingCategory({
        ...editingCategory,
        [name]: value
      });
    } else {
      setNewCategory({
        ...newCategory,
        [name]: value
      });
    }
    
    // Auto-generate slug from name if slug field is not manually edited
    if (name === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/-+/g, '-');     // Replace multiple - with single -
      
      if (editingCategory) {
        setEditingCategory({
          ...editingCategory,
          name: value,
          slug
        });
      } else {
        setNewCategory({
          ...newCategory,
          name: value,
          slug
        });
      }
    }
  };

  // Add new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.name || !newCategory.slug) {
      toast.error('Name and slug are required');
      return;
    }
    
    try {
      const res = await adminAPI.createCategory(newCategory);
      setCategories([...categories, res.data.category]);
      setNewCategory({
        name: '',
        slug: '',
        description: '',
        icon: 'folder'
      });
      setIsAddingCategory(false);
      toast.success('Category created successfully');
    } catch (err) {
      console.error('Error creating category:', err);
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  // Start editing a category
  const handleEditClick = (category) => {
    setEditingCategory(category);
    setIsAddingCategory(false);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  // Save edited category
  const handleSaveEdit = async () => {
    if (!editingCategory.name || !editingCategory.slug) {
      toast.error('Name and slug are required');
      return;
    }
    
    try {
      const res = await adminAPI.updateCategory(editingCategory._id, editingCategory);
      
      // Update local state
      setCategories(categories.map(category => 
        category._id === editingCategory._id ? res.data.category : category
      ));
      
      setEditingCategory(null);
      toast.success('Category updated successfully');
    } catch (err) {
      console.error('Error updating category:', err);
      toast.error(err.response?.data?.message || 'Failed to update category');
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? All posts in this category will become uncategorized.')) {
      try {
        await adminAPI.deleteCategory(categoryId);
        setCategories(categories.filter(category => category._id !== categoryId));
        toast.success('Category deleted successfully');
      } catch (err) {
        console.error('Error deleting category:', err);
        toast.error('Failed to delete category');
      }
    }
  };

  if (loading && categories.length === 0) {
    return <Spinner size="large" />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Category Management</h1>
        <div className="flex space-x-3">
          <Button 
            variant="primary"
            icon={<FiPlus />}
            onClick={() => {
              setIsAddingCategory(!isAddingCategory);
              setEditingCategory(null);
            }}
          >
            {isAddingCategory ? 'Cancel' : 'Add Category'}
          </Button>
          <Button 
            variant="secondary"
            icon={<FiRefreshCw />}
            onClick={fetchCategories}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg mb-6">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Add Category Form */}
      {isAddingCategory && (
        <div className="bg-dark-800 p-6 rounded-lg mb-6 border border-dark-600">
          <h2 className="text-xl font-semibold text-white mb-4">Add New Category</h2>
          <form onSubmit={handleAddCategory}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={newCategory.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={newCategory.slug}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="category-slug"
                />
                <p className="text-xs text-gray-500 mt-1">Used in URLs. Auto-generated from name.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Icon
                </label>
                <input
                  type="text"
                  name="icon"
                  value={newCategory.icon}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Icon name"
                />
                <p className="text-xs text-gray-500 mt-1">Default: folder</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newCategory.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Category description"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                className="mr-3"
                onClick={() => setIsAddingCategory(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={<FiPlus />}
              >
                Add Category
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Category List */}
      <div className="bg-dark-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {categories.length > 0 ? (
                categories.map(category => (
                  <tr key={category._id} className={`${editingCategory && editingCategory._id === category._id ? 'bg-dark-700/80' : 'hover:bg-dark-700/50'}`}>
                    {editingCategory && editingCategory._id === category._id ? (
                      <>
                        <td className="px-4 py-4">
                          <input
                            type="text"
                            name="name"
                            value={editingCategory.name}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="text"
                            name="slug"
                            value={editingCategory.slug}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="text"
                            name="description"
                            value={editingCategory.description}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <select
                            name="isActive"
                            value={editingCategory.isActive.toString()}
                            onChange={(e) => setEditingCategory({
                              ...editingCategory,
                              isActive: e.target.value === 'true'
                            })}
                            className="px-2 py-1 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="text-green-500 hover:text-green-400"
                              title="Save"
                            >
                              <FiCheck size={18} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-red-500 hover:text-red-400"
                              title="Cancel"
                            >
                              <FiX size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <span className="text-primary-500 mr-2">
                              <FiFolder size={16} />
                            </span>
                            <span className="text-sm font-medium text-white">{category.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-300">{category.slug}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-300 truncate max-w-xs">{category.description || '-'}</div>
                        </td>
                        <td className="px-4 py-4">
                          {category.isActive ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900 text-red-300">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => handleEditClick(category)}
                              className="text-blue-500 hover:text-blue-400"
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="text-red-500 hover:text-red-400"
                              title="Delete"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                    {loading ? 'Loading categories...' : 'No categories found.'}
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

export default CategoryManagement;