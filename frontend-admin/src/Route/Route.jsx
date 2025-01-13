// src/Route/Route.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Overview from '../app/Dashboard/Overview/Overview';
import Users from '../app/Dashboard/Users/Users';
import Product from '../app/Dashboard/Products/Product';
import Billing from '../app/Dashboard/Billing/Billing';
import NotFound from '../app/notfound/NotFound';
import { ProtectedRoute } from '../components/ProtectedRoute';

function AppRoute() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Navigate to="/overview" replace />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/overview" 
        element={
          <ProtectedRoute>
            <Overview />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/products" 
        element={
          <ProtectedRoute>
            <Product />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/users" 
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/billing" 
        element={
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoute;