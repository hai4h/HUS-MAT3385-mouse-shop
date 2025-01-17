import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axiosInstance from '../services/axiosConfig';
import authService from '../services/authService';
import { authEvents } from '../services/authEvents';
import SessionExpiredModal from '../components/auth/SessionExpiredModal';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  const initialize = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem('adminUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
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

  useEffect(() => {
    const handleSessionExpired = () => {
      setShowSessionExpiredModal(true);
    };

    authEvents.on('sessionExpired', handleSessionExpired);

    return () => {
      authEvents.off('sessionExpired', handleSessionExpired);
    };
  }, []);

  const handleSessionExpiredConfirm = () => {
    setShowSessionExpiredModal(false);
    logout();
  };

  const logout = useCallback(() => {
    authService.logout();
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
      <SessionExpiredModal
        isOpen={showSessionExpiredModal}
        onConfirm={handleSessionExpiredConfirm}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};