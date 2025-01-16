import React, { useEffect } from 'react';
import './Toast.scss';

const Toast = ({ message, isVisible, onHide }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  return (
    <div className={`toast ${isVisible ? 'show' : ''}`}>
      <span className="toast-message">{message}</span>
    </div>
  );
};

export default Toast;