import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import "../../styles/desktop/UserSidebar.scss"

class UserSidebar extends Component {
  state = {
    loading: false,
    error: null
  };

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

  handleAccountRedirect = () => {
    this.props.onClose(); // Close the sidebar first
    window.location.href = '/account';
  };

  render() {
    const { onClose, onLogout, user } = this.props;
    const { loading, error } = this.state;
    const isAdmin = user?.role === 'admin';

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
              <div className="info-section">
                <h3>Thông tin cơ bản</h3>
                <div className="info-item">
                  <label>Username:</label>
                  <span>{user?.username}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{user?.email}</span>
                </div>
                <div className="info-item">
                  <label>Họ tên:</label>
                  <span>{user?.full_name}</span>
                </div>
                {isAdmin && (
                  <div className="info-item">
                    <label>Role:</label>
                    <span>Administrator</span>
                  </div>
                )}
              </div>

              <div className="info-section">
                <h3>Thông tin liên hệ</h3>
                <div className="info-item">
                  <label>Số điện thoại:</label>
                  <span>{user?.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className="info-item">
                  <label>Địa chỉ:</label>
                  <span>{user?.address || 'Chưa cập nhật'}</span>
                </div>
              </div>
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
          <button 
            className="account-button"
            onClick={this.handleAccountRedirect}
          >
            Quản lý tài khoản
          </button>
          <button className="logout-button" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }
}

export default UserSidebar;