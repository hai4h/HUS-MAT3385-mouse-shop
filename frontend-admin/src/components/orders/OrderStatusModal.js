import React, { useState } from 'react';

const OrderStatusModal = ({ order, onClose, onSave }) => {
  const [status, setStatus] = useState(order.status);

  const statusOptions = [
    { value: 'pending', label: 'Chờ xác nhận' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'shipped', label: 'Đang giao' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'cancelled', label: 'Đã hủy' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(order.order_id, status);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Cập nhật trạng thái đơn hàng #{order.order_id}</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Trạng thái</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="form-select"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Hủy
            </button>
            <button type="submit" className="save-button">
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderStatusModal;