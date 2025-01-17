import React from 'react';

const SessionExpiredModal = ({ isOpen, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Phiên đăng nhập hết hạn
        </h3>
        
        <p className="text-gray-600 mb-6">
          Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.
        </p>

        <div className="flex justify-end">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;