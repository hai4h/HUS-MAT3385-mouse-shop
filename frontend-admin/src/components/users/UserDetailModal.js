import React from 'react';

const UserDetailModal = ({ user, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Thông tin người dùng</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="detail-section">
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Username:</span>
                <span className="value">{user.username}</span>
              </div>
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{user.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Họ tên:</span>
                <span className="value">{user.full_name}</span>
              </div>
              <div className="info-item">
                <span className="label">Số điện thoại:</span>
                <span className="value">{user.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="info-item">
                <span className="label">Địa chỉ:</span>
                <span className="value">{user.address || 'Chưa cập nhật'}</span>
              </div>
              <div className="info-item">
                <span className="label">Vai trò:</span>
                <span className={`role-badge ${user.role}`}>{user.role}</span>
              </div>
              <div className="info-item">
                <span className="label">Ngày tạo:</span>
                <span className="value">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose} className="close-button">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;