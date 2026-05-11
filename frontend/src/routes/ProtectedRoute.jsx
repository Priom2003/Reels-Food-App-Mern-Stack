import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Check if user is authenticated by making a request to a protected endpoint
    axios.get("${import.meta.env.VITE_API_URL}/api/auth/check", { withCredentials: true })
      .then(() => {
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === null) {
    // Still checking authentication, show loading or blank screen
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // User is not authenticated, redirect to login
    return <Navigate to="/" replace />;
  }

  // User is authenticated, show the protected component
  return children;
};

export default ProtectedRoute;
