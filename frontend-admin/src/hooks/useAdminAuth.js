import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const parseToken = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      token: params.get('token'),
      userId: params.get('userId'),
      username: params.get('username'),
      role: params.get('role')
    };
  }, []);

  const checkTokenExpiration = useCallback((token) => {
    if (!token) return true;

    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return true;

      const payload = JSON.parse(atob(tokenParts[1]));
      const expiration = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiration;
    } catch (error) {
      console.error('Token validation error:', error);
      return true;
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminUser');
    setAdminUser(null);
    setIsAuthenticated(false);
    window.location.href = 'http://localhost:3000/';
  }, []);

  // Thiết lập kiểm tra token định kỳ
  useEffect(() => {
    const checkTokenAndLogout = () => {
      const storedUser = localStorage.getItem('adminUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (checkTokenExpiration(userData.access_token)) {
          console.log('Token expired, logging out...');
          handleLogout();
        }
      }
    };

    // Kiểm tra ngay lập tức
    checkTokenAndLogout();

    // Thiết lập interval kiểm tra mỗi phút
    const intervalId = setInterval(checkTokenAndLogout, 30000);

    return () => clearInterval(intervalId);
  }, [checkTokenExpiration, handleLogout]);

  // Khởi tạo authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Kiểm tra token trong URL
        const { token, userId, username, role } = parseToken();
        
        if (token && role === 'admin') {
          // Kiểm tra token hết hạn trước khi lưu
          if (checkTokenExpiration(token)) {
            handleLogout();
            return;
          }

          const adminData = {
            access_token: token,
            user_id: userId,
            username: username,
            role: role
          };
          localStorage.setItem('adminUser', JSON.stringify(adminData));
          setAdminUser(adminData);
          setIsAuthenticated(true);
          
          // Xóa params và điều hướng đến overview
          navigate('/overview', { replace: true });
        } else {
          // Kiểm tra localStorage nếu không có token trong URL
          const storedUser = localStorage.getItem('adminUser');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.role === 'admin' && !checkTokenExpiration(userData.access_token)) {
              setAdminUser(userData);
              setIsAuthenticated(true);
            } else {
              handleLogout();
            }
          } else {
            handleLogout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [navigate, parseToken, checkTokenExpiration, handleLogout]);

  const getAuthHeader = useCallback(() => {
    const storedUser = localStorage.getItem('adminUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (!checkTokenExpiration(userData.access_token)) {
        return {
          'Authorization': `Bearer ${userData.access_token}`
        };
      }
    }
    return {};
  }, [checkTokenExpiration]);

  return {
    isAuthenticated,
    isLoading,
    adminUser,
    logout: handleLogout,
    getAuthHeader
  };
};