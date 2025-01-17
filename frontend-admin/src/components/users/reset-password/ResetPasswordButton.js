import React from 'react';
import { Key } from 'lucide-react';
import axiosInstance from '../../../services/axiosConfig';

const ResetPasswordButton = ({ userId, username, onSuccess, onError }) => {
  const handleResetPassword = async () => {
    if (!window.confirm(`Are you sure you want to reset password for user ${username}?`)) {
      return;
    }

    try {
      const response = await axiosInstance.post(`/users/${userId}/reset-password`);
      onSuccess(response.data);
    } catch (error) {
      console.error('Error resetting password:', error);
      onError('Failed to reset password');
    }
  };

  return (
    <button 
      className="action-button reset-password"
      onClick={handleResetPassword}
      title="Reset Password"
    >
      <Key size={16} />
    </button>
  );
};

export default ResetPasswordButton;