import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import jwt_decode from 'jwt-decode';

let toastShown = false;

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  let hasRole = true;

  if (requiredRole && token) {
    try {
      const decoded = jwt_decode(token);
      hasRole = decoded.role === requiredRole;
    } catch (e) {
      hasRole = false;
    }
  }

  useEffect(() => {
    if ((!isLoggedIn || !hasRole) && !toastShown) {
      toast.error('You need to log in with proper access to view this page');
      toastShown = true;
      setTimeout(() => { toastShown = false; }, 2000);
    }
  }, [isLoggedIn, hasRole]);

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!hasRole) return <Navigate to={requiredRole === 'admin' ? '/admin/login' : '/login'} replace />;
  return children;
};

export default ProtectedRoute;