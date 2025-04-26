import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiCheck, FiX, FiUserPlus, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data.users);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle role filter change
  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  // Start editing a user
  const handleEditClick = (user) => {
    setEditingUser(user);
    setNewRole(user.role);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingUser(null);
    setNewRole('');
  };

  // Save user role change
  const handleSaveRole = async () => {
    try {
      await adminAPI.updateUserRole(editingUser._id, newRole);
      
      // Update local state
      setUsers(users.map(user => 
        user._id === editingUser._id ? { ...user, role: newRole } : user
      ));
      
      toast.success(`User role updated to ${newRole}`);
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user role:', err);
      toast.error('Failed to update user role');
    }
  };

  // Handle user ban/unban
  const handleBanUser = async (userId, isBanned) => {
    try {
      if (isBanned) {
        await adminAPI.unbanUser(userId);
        toast.success('User has been unbanned');
      } else {
        await adminAPI.banUser(userId, 'Admin action');
        toast.success('User has been banned');
      }
      
      // Refresh user list
      fetchUsers();
    } catch (err) {
      console.error('Error updating user ban status:', err);
      toast.error('Failed to update user status');
    }
  };

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
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

  if (loading && users.length === 0) {
    return <Spinner size="large" />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <Button 
          variant="primary"
          icon={<FiRefreshCw />}
          onClick={fetchUsers}
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
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-10 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-500" size={18} />
            </div>
          </div>

          {/* Role Filter */}
          <div className="sm:w-48">
            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="trusted">Trusted</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-dark-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-dark-700/50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={user.profile?.avatar || '/assets/images/default-avatar.png'}
                          alt={user.username}
                          className="h-8 w-8 rounded-full mr-3"
                        />
                        <div className="text-sm font-medium text-white">{user.username}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{user.email}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {editingUser && editingUser._id === user._id ? (
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="bg-dark-700 border border-dark-600 rounded px-2 py-1 text-sm text-white"
                        >
                          <option value="user">User</option>
                          <option value="trusted">Trusted</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                          <option value="owner">Owner</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.role === 'admin' ? 'bg-purple-900 text-purple-300' : 
                            user.role === 'moderator' ? 'bg-blue-900 text-blue-300' : 
                            user.role === 'trusted' ? 'bg-green-900 text-green-300' : 
                            user.role === 'owner' ? 'bg-red-900 text-red-300' : 
                            'bg-gray-700 text-gray-300'}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{formatDate(user.createdAt)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {user.isActive ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900 text-red-300">
                          Banned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingUser && editingUser._id === user._id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={handleSaveRole}
                            className="text-green-500 hover:text-green-400"
                          >
                            <FiCheck size={18} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-500 hover:text-red-400"
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="text-blue-500 hover:text-blue-400"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleBanUser(user._id, !user.isActive)}
                            className={`${user.isActive ? 'text-red-500 hover:text-red-400' : 'text-green-500 hover:text-green-400'}`}
                          >
                            {user.isActive ? <FiX size={16} /> : <FiCheck size={16} />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                    {loading ? 'Loading users...' : 'No users found matching your search criteria.'}
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

export default UserManagement;