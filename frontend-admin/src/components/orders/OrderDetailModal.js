import React from 'react';

const OrderDetailModal = ({ order, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Chi tiết đơn hàng #{order.order_id}</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="detail-section">
            <h4>Thông tin khách hàng</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Địa chỉ:</span>
                <span className="value">{order.shipping_address}</span>
              </div>
              {order.note && (
                <div className="info-item">
                  <span className="label">Ghi chú:</span>
                  <span className="value">{order.note}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="detail-section">
            <h4>Thông tin thanh toán</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Tổng tiền:</span>
                <span className="value">${order.total_amount}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="info-item">
                  <span className="label">Giảm giá:</span>
                  <span className="value">-${order.discount_amount}</span>
                </div>
              )}
              {order.coupon_discount > 0 && (
                <div className="info-item">
                  <span className="label">Mã giảm giá:</span>
                  <span className="value">-${order.coupon_discount}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="detail-section">
            <h4>Lịch sử đơn hàng</h4>
            <div className="timeline">
              <div className="timeline-item">
                <span className="time">{new Date(order.order_date).toLocaleString()}</span>
                <span className="event">Đơn hàng được tạo</span>
              </div>
              <div className="timeline-item">
                <span className="time">{new Date(order.updated_at).toLocaleString()}</span>
                <span className="event">Cập nhật lần cuối</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;