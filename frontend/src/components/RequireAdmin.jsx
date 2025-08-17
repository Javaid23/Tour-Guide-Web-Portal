import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

const RequireAdmin = ({ children }) => {
  const { user, isLoading } = useAuth();

  console.log('RequireAdmin - user:', user, 'isLoading:', isLoading);

  if (isLoading) {
    console.log('RequireAdmin - still loading auth...');
    return <div>Loading...</div>;
  }
  
  if (!user) {
    console.log('RequireAdmin - no user, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  if (user.role !== "admin") {
    console.log('RequireAdmin - user role is not admin:', user.role, 'redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  console.log('RequireAdmin - admin access granted, rendering children');
  return children;
};

export default RequireAdmin;
