import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import AuthProvider from './contexts/AuthContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import Category from './pages/Category';
import Search from './pages/Search';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/Admin/Dashboard';
import EditProfile from './pages/EditProfile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-dark-900">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-6">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/search" element={<Search />} />
              
              {/* Private Routes */}
              <Route path="/create-post" element={
                <PrivateRoute>
                  <CreatePost />
                </PrivateRoute>
              } />
              <Route path="/edit-post/:id" element={
                <PrivateRoute>
                  <EditPost />
                </PrivateRoute>
              } />
              <Route path="/settings/profile" element={
                <PrivateRoute>
                  <EditProfile />
                </PrivateRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'dark-toast',
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #2b2b2b'
            },
            duration: 4000
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;