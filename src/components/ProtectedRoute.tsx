import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userRole === 'admin' && window.location.pathname !== '/admin-dashboard') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (userRole === 'user' && window.location.pathname !== '/user-dashboard') {
    return <Navigate to="/user-dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;