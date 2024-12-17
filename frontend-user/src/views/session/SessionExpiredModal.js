import React from 'react';
import './SessionExpiredModal.scss';

const SessionExpiredModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Phiên làm việc đã hết hạn</h2>
        <p>Vui lòng đăng nhập lại để tiếp tục.</p>
        <button className="confirm-button" onClick={onClose}>
          Xác nhận
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;