// SessionExpiredModal.js
import React from 'react';
import './SessionExpiredModal.scss';

const SessionExpiredModal = ({ onClose }) => {
  console.log('Rendering SessionExpiredModal');
  
  return (
    <div className="session-modal-overlay">
      <div className="session-modal">
        <div className="session-modal-content">
          <h2>Phiên làm việc đã hết hạn</h2>
          <p>Vui lòng đăng nhập lại để tiếp tục.</p>
          <button 
            className="session-modal-button"
            onClick={onClose}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;