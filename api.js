import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for adding token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
  getMe: () => api.get('/auth/me')
};

// User API calls
export const userAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (userData) => api.put('/users/profile', userData),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  giveVouch: (userId) => api.post(`/users/${userId}/vouch`),
  giveRep: (userId) => api.post(`/users/${userId}/rep`)
};

// Post API calls
export const postAPI = {
  getPosts: (params) => api.get('/posts', { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (postData) => api.post('/posts', postData),
  updatePost: (id, postData) => api.put(`/posts/${id}`, postData),
  deletePost: (id) => api.delete(`/posts/${id}`),
  likePost: (id) => api.post(`/posts/${id}/like`),
  addReply: (id, content) => api.post(`/posts/${id}/replies`, { content }),
  likeReply: (postId, replyId) => api.post(`/posts/${postId}/replies/${replyId}/like`)
};

// Category API calls
export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  getCategory: (slug) => api.get(`/categories/${slug}`),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`)
};

// Admin API calls
export const adminAPI = {
    getDashboardStats: () => api.get('/admin/stats'),
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
    banUser: (userId, reason) => api.put(`/admin/users/${userId}/ban`, { reason }),
    unbanUser: (userId) => api.put(`/admin/users/${userId}/unban`),
    getPosts: (params) => api.get('/admin/posts', { params }),
    getCategories: () => api.get('/admin/categories'),
    createCategory: (categoryData) => api.post('/admin/categories', categoryData),
    updateCategory: (id, categoryData) => api.put(`/admin/categories/${id}`, categoryData),
    deleteCategory: (id) => api.delete(`/admin/categories/${id}`)
};

export default api;