import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const ResetPasswordModal = ({ tempPassword, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md">
        <div className="modal-header">
          <h3>Password Reset Successful</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        
        <div className="modal-body">
          <p className="mb-4 text-gray-600">
            A temporary password has been generated for the user. Please provide this to them securely:
          </p>
          
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <code className="flex-1 font-mono text-lg">{tempPassword}</code>
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              title={copied ? "Copied!" : "Copy to clipboard"}
            >
              {copied ? <Check className="text-green-500" size={20} /> : <Copy size={20} />}
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Make sure to communicate this password securely to the user. 
              They should change it upon their next login.
            </p>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            onClick={onClose}
            className="w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;