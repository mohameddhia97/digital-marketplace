import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import Spinner from './Spinner';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, hasRole } = useContext(AuthContext);

  if (loading) {
    return <Spinner />;
  }

  if (!isAuthenticated || !hasRole(['admin', 'owner'])) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminRoute;