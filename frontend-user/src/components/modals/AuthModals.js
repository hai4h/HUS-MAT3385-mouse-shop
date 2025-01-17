// AuthModals.js
import React, { useState } from 'react';
import './Modals.scss';

export const ChangeEmailModal = ({ isOpen, onClose, onSubmit }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSubmit({ currentPassword, newEmail });
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="auth-modal-overlay">
            <div className="auth-modal-content">
                <div className="auth-modal-header">
                    <h3 className="auth-modal-title">Thay đổi email</h3>
                    <button onClick={onClose} className="auth-modal-close">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="auth-modal-body">
                        {error && <div className="error-message">{error}</div>}
                        
                        <div className="form-group">
                            <label>Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email mới</label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-modal-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cancel-button"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="confirm-button"
                        >
                            Xác nhận
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const ChangePasswordModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu mới không khớp');
            return;
        }
        try {
            await onSubmit({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="auth-modal-overlay">
            <div className="auth-modal-content">
                <div className="auth-modal-header">
                    <h3 className="auth-modal-title">Đổi mật khẩu</h3>
                    <button onClick={onClose} className="auth-modal-close">&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="auth-modal-body">
                        {error && <div className="error-message">{error}</div>}
                        
                        <div className="form-group">
                            <label>Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    currentPassword: e.target.value
                                })}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Mật khẩu mới</label>
                            <input
                                type="password"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    newPassword: e.target.value
                                })}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    confirmPassword: e.target.value
                                })}
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-modal-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cancel-button"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="confirm-button"
                        >
                            Xác nhận
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};