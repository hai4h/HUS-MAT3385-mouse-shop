// src/components/ProtectedRoute.jsx
import React from 'react';
// import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import MainLayout from './MainLayout';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = 'http://localhost:3000';
    return null;
  }

  return <MainLayout>{children}</MainLayout>;
};