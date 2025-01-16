import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Products from './pages/products';
import PrivateRoute from './components/PrivateRoute';
import Orders from './pages/orders';
import Users from './pages/users';

import './styles/layout/admin.scss';

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, initialize } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initialize().finally(() => setIsLoading(false));
  }, [initialize]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
      />
      
      <Route 
        path="/" 
        element={
          isAuthenticated ? <AdminLayout /> : <Navigate to="/login" />
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/users" element={<Users />} />
      </Route>
    </Routes>
  );
};

export default App;