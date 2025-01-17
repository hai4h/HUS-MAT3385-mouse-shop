import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

import '../../styles/pages/auth/Login.scss';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { initialize } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userData = await authService.login(username, password);
      if (userData.role !== 'admin') {
        setError('Unauthorized access');
        return;
      }

      // Khởi tạo lại context auth
      await initialize();
      
      // Reload page để cập nhật state
      window.location.href = '/';
    } catch (error) {
      setError(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm điều hướng về trang user
  const navigateToUserSite = () => {
    window.location.href = 'https://mou-x.azurewebsites.net/';
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Admin Login</h2>
          
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group password-group">
              <label className="form-label">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Thêm nút điều hướng về trang user */}
          <div className="user-site-link">
            <button 
              type="button"
              onClick={navigateToUserSite}
              className="user-site-button"
            >
              Về trang người dùng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;