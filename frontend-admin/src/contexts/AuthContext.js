import React, { createContext, useContext, useState, useCallback } from 'react';
import axiosInstance from '../services/axiosConfig';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const initialize = useCallback(async () => {
    try {
      // Get token from URL if present
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const userId = params.get('userId');
      const username = params.get('username');
      const role = params.get('role');

      // Expand condition to include all cases of admin login
      if (token && userId && username && (role === 'admin' || role === 'administrator')) {
        // Store auth data
        const userData = { 
          access_token: token, 
          user_id: userId, 
          username, 
          role 
        };
        localStorage.setItem('adminUser', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        
        // Set token for future requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return true;
      }

      // Check local storage
      const storedUser = localStorage.getItem('adminUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Additional check to ensure admin role
        if (userData.role === 'admin' || userData.role === 'administrator') {
          setUser(userData);
          setIsAuthenticated(true);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${userData.access_token}`;
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Auth initialization error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    // Gọi phương thức logout từ AuthService
    authService.logout();
    
    // Các thao tác với state của context
    setUser(null);
    setIsAuthenticated(false);
    delete axiosInstance.defaults.headers.common['Authorization'];
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      initialize,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};