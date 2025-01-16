import React, { useState } from 'react';

const UserEditModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    phone: user.phone || '',
    address: user.address || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(user.user_id, formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Chỉnh sửa thông tin người dùng</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Họ tên</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Địa chỉ</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-input"
              rows={3}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Hủy
            </button>
            <button type="submit" className="save-button">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;