import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

let toastShown = false;

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (!isLoggedIn && !toastShown) {
      toast.error('You need to log in to access this page');
      toastShown = true;
      setTimeout(() => { toastShown = false; }, 2000);
    }
  }, [isLoggedIn]);

  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute; 