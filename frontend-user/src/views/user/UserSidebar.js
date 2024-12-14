// UserSidebar.js
import React, { Component } from 'react';
import authService from '../../services/authService';
import './UserSidebar.scss';

class UserSidebar extends Component {
  state = {
    userInfo: null,
    loading: true,
    error: null
  };

  async componentDidMount() {
    try {
      const userInfo = await authService.getCurrentUserInfo();
      this.setState({ userInfo, loading: false });
    } catch (error) {
      this.setState({ 
        error: 'Failed to load user information', 
        loading: false 
      });
    }
  }

  handleAdminRedirect = () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.access_token) {
      const params = new URLSearchParams({
        token: currentUser.access_token,
        userId: currentUser.user_id,
        username: currentUser.username,
        role: currentUser.role
      }).toString();
      window.location.href = `http://localhost:3001?${params}`;
    }
  };

  render() {
    const { onClose, onLogout } = this.props;
    const { userInfo, loading, error } = this.state;
    const currentUser = authService.getCurrentUser();
    const isAdmin = currentUser?.role === 'admin';

    return (
      <div className="user-sidebar">
        <div className="user-sidebar-header">
          <h2>Thông tin tài khoản</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="user-info">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <>
              <div className="info-item">
                <label>Username:</label>
                <span>{userInfo?.username}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{userInfo?.email}</span>
              </div>
              <div className="info-item">
                <label>Họ tên:</label>
                <span>{userInfo?.full_name}</span>
              </div>
              {isAdmin && (
                <div className="info-item">
                  <label>Role:</label>
                  <span>Administrator</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="user-actions">
          {isAdmin && (
            <button 
              className="admin-button"
              onClick={this.handleAdminRedirect}
            >
              Trang Quản trị
            </button>
          )}
          <button className="logout-button" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }
}

export default UserSidebar;