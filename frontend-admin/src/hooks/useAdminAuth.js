import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [showSessionTimeout, setShowSessionTimeout] = useState(false);
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
      const expiration = payload.exp * 1000;
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
    window.location.href = 'http://localhost:3000';
  }, []);

  const handleSessionTimeout = useCallback(() => {
      setShowSessionTimeout(true);  // Chỉ hiển thị modal
  }, []);

  // Thêm hàm mới để xử lý khi người dùng xác nhận modal
  const handleSessionTimeoutConfirm = useCallback(() => {
      localStorage.removeItem('adminUser');
      setAdminUser(null);
      setIsAuthenticated(false);
      setShowSessionTimeout(false);
      window.location.href = 'http://localhost:3000?adminLogout=true';
  }, []);

  // Thiết lập kiểm tra token định kỳ
  useEffect(() => {
    const checkTokenAndNotify = () => {
      const storedUser = localStorage.getItem('adminUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (checkTokenExpiration(userData.access_token)) {
          console.log('Token expired, showing notification...');
          handleSessionTimeout();
        }
      }
    };

    // Kiểm tra ngay lập tức
    checkTokenAndNotify();

    // Thiết lập interval kiểm tra mỗi phút
    const intervalId = setInterval(checkTokenAndNotify, 5000);

    return () => clearInterval(intervalId);
  }, [checkTokenExpiration, handleSessionTimeout]);

  // Khởi tạo authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { token, userId, username, role } = parseToken();
        
        if (token && role === 'admin') {
          if (checkTokenExpiration(token)) {
            handleSessionTimeout();
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
          navigate('/overview', { replace: true });
        } else {
          const storedUser = localStorage.getItem('adminUser');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.role === 'admin' && !checkTokenExpiration(userData.access_token)) {
              setAdminUser(userData);
              setIsAuthenticated(true);
            } else {
              handleSessionTimeout();
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
  }, [navigate, parseToken, checkTokenExpiration, handleSessionTimeout]);

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
    showSessionTimeout,
    setShowSessionTimeout,
    handleSessionTimeoutConfirm,
    getAuthHeader
  };
};