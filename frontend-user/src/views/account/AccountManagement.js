import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axiosInstance from '../../services/axiosConfig';
import authService from '../../services/authService';

import { ChangeEmailModal, ChangePasswordModal } from '../../components/modals/AuthModals';
import Toast from '../toast/Toast';
import SessionExpiredModal from '../session/SessionExpiredModal';
import WarrantyCheck from './warranty/WarrantyCheck';
import ReviewModal from '../../components/modals/ReviewModal';

import '../../styles/desktop/AccountManagement.scss';
import { RiHome9Line } from "react-icons/ri";

const AccountManagement = () => {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const [activeTab, setActiveTab] = useState('profile');
    const [userInfo, setUserInfo] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [showChangeEmail, setShowChangeEmail] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
    const [userPreferences, setUserPreferences] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        phone: '',
        address: '',
        hand_size: '',
        grip_style: '',
        usage_type: '',
        wireless_preferred: false
    });

    useEffect(() => {
        if (!showSessionExpiredModal) {
            fetchUserData();
            if (activeTab === 'orders') {
                fetchOrders();
            }
        }
    }, [activeTab, showSessionExpiredModal]);

    useEffect(() => {
        let tokenCheckInterval;
    
        const checkAndUpdateUserAuth = () => {
            console.log('Checking auth status...');
            const currentUser = authService.getCurrentUser();
            if (!currentUser) return;
    
            if (authService.isTokenExpired()) {
                console.log('Token expired, showing modal...');
                if (tokenCheckInterval) {
                    clearInterval(tokenCheckInterval);
                    tokenCheckInterval = null;
                }
                setShowSessionExpiredModal(true);
            }
        };
    
        checkAndUpdateUserAuth();
        tokenCheckInterval = setInterval(checkAndUpdateUserAuth, 30000);
    
        const handleFocus = () => {
            console.log('Window focused, checking auth...');
            checkAndUpdateUserAuth();
        };
        window.addEventListener('focus', handleFocus);
    
        const handleSessionExpired = () => {
            console.log('Session expired event received');
            if (tokenCheckInterval) {
                clearInterval(tokenCheckInterval);
            }
            setShowSessionExpiredModal(true);
        };
        window.addEventListener('sessionExpired', handleSessionExpired);
    
        return () => {
            if (tokenCheckInterval) {
                clearInterval(tokenCheckInterval);
            }
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('sessionExpired', handleSessionExpired);
        };
    }, []);

    const handleSessionExpired = () => {
        setShowSessionExpiredModal(true);
    };

    const handleModalConfirm = () => {
        setShowSessionExpiredModal(false);
        authService.logout();
        navigate('/', { replace: true });
        window.location.reload();
    };

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
    };

    const fetchUserData = async () => {
        try {
            setLoading(true);
            if (!currentUser || !currentUser.user_id) {
                throw new Error('No authenticated user found');
            }
            
            // Fetch user data như cũ
            const response = await axiosInstance.get(`/users/${currentUser.user_id}`);
            const userData = response.data;
    
            // Fetch preferences riêng
            try {
                const preferencesResponse = await axiosInstance.get(`/users/${currentUser.user_id}/preferences`);
                const preferences = preferencesResponse.data || {};
                
                // Thêm preferences vào formData mà không ảnh hưởng đến userData
                setFormData({
                    email: userData.email || '',
                    full_name: userData.full_name || '',
                    phone: userData.phone || '',
                    address: userData.address || '',
                    hand_size: preferences.hand_size || '',
                    grip_style: preferences.grip_style || '',
                    usage_type: preferences.usage_type || '',
                    wireless_preferred: preferences.wireless_preferred || false
                });
    
                // Lưu preferences riêng vào state nếu cần
                setUserPreferences(preferences);
            } catch (error) {
                console.error('Error fetching preferences:', error);
                // Nếu không lấy được preferences, vẫn set formData với thông tin user cơ bản
                setFormData({
                    email: userData.email || '',
                    full_name: userData.full_name || '',
                    phone: userData.phone || '',
                    address: userData.address || '',
                    hand_size: '',
                    grip_style: '',
                    usage_type: '',
                    wireless_preferred: false
                });
            }
    
            // Set userInfo với dữ liệu gốc
            setUserInfo(userData);
    
        } catch (error) {
            if (error.message === 'Session expired') {
                return;
            }
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await axiosInstance.get('/orders/');
            setOrders(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Update user info
            await axiosInstance.put(`/users/${userInfo.user_id}`, {
                full_name: formData.full_name,
                phone: formData.phone,
                address: formData.address
            });
    
            // Update preferences
            await axiosInstance.put(`/users/${userInfo.user_id}/preferences`, {
                hand_size: formData.hand_size,
                grip_style: formData.grip_style,
                usage_type: formData.usage_type,
                wireless_preferred: formData.wireless_preferred
            });
    
            showToastMessage('Cập nhật thông tin thành công');
            setEditing(false);
            await fetchUserData();
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Không thể cập nhật thông tin';
            setError(errorMessage);
            showToastMessage(errorMessage);
        }
    };

    const handleChangeEmail = async ({ currentPassword, newEmail }) => {
        try {
            await axiosInstance.post('/users/change-email', {
                current_password: currentPassword,
                new_email: newEmail
            });
            await fetchUserData();
            showToastMessage('Email đã được cập nhật thành công');
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Không thể thay đổi email');
        }
    };
    
    const handleChangePassword = async ({ currentPassword, newPassword }) => {
        try {
            await axiosInstance.post('/users/change-password', {
                current_password: currentPassword,
                new_password: newPassword
            });
            showToastMessage('Mật khẩu đã được cập nhật thành công');
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Không thể thay đổi mật khẩu');
        }
    };
    
    const renderProfileForm = () => {
        return (
            <form onSubmit={handleSubmit}>
                <div className="info-grid">
                    <div className="form-group">
                        <label>Họ tên</label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>
    
                    <div className="form-group col-span-2">
                        <label>Địa chỉ</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows="3"
                            className="form-input"
                        ></textarea>
                    </div>
    
                    {/* User Preferences */}
                    <div className="form-group">
                        <label>Kích thước tay</label>
                        <select
                            name="hand_size"
                            value={formData.hand_size || ''}
                            onChange={handleInputChange}
                            className="form-input"
                        >
                            <option value="">Chọn kích thước</option>
                            <option value="small">Nhỏ</option>
                            <option value="medium">Trung bình</option>
                            <option value="large">Lớn</option>
                        </select>
                    </div>
    
                    <div className="form-group">
                        <label>Kiểu cầm chuột</label>
                        <select
                            name="grip_style"
                            value={formData.grip_style || ''}
                            onChange={handleInputChange}
                            className="form-input"
                        >
                            <option value="">Chọn kiểu cầm</option>
                            <option value="palm">Palm Grip</option>
                            <option value="claw">Claw Grip</option>
                            <option value="fingertip">Fingertip Grip</option>
                        </select>
                    </div>
    
                    <div className="form-group">
                        <label>Mục đích sử dụng</label>
                        <select
                            name="usage_type"
                            value={formData.usage_type || ''}
                            onChange={handleInputChange}
                            className="form-input"
                        >
                            <option value="">Chọn mục đích</option>
                            <option value="gaming">Gaming</option>
                            <option value="office">Văn phòng</option>
                            <option value="general">Đa dụng</option>
                        </select>
                    </div>
    
                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="wireless_preferred"
                                checked={formData.wireless_preferred || false}
                                onChange={(e) => handleInputChange({
                                    target: {
                                        name: 'wireless_preferred',
                                        value: e.target.checked
                                    }
                                })}
                            />
                            <span>Ưu tiên chuột không dây</span>
                        </label>
                    </div>
                </div>
    
                {error && <div className="error-message">{error}</div>}
    
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => {
                            setEditing(false);
                            setError(null);
                            fetchUserData();
                        }}
                        className="cancel-button"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="submit-button"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </form>
        );
    };

    const renderProfileInfo = () => {
        return (
            <>
                <div className="info-grid">
                    <div className="info-item">
                        <div className="info-label">Email</div>
                        <div className="info-value">{userInfo?.email}</div>
                        <div className="info-action">
                            <button 
                                className="action-button"
                                onClick={() => setShowChangeEmail(true)}
                            >
                                Thay đổi email
                            </button>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-label">Mật khẩu</div>
                        <div className="info-value">••••••••</div>
                        <div className="info-action">
                            <button 
                                className="action-button"
                                onClick={() => setShowChangePassword(true)}
                            >
                                Đổi mật khẩu
                            </button>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-label">Họ tên</div>
                        <div className="info-value">
                            {userInfo?.full_name || 'Chưa cập nhật'}
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-label">Số điện thoại</div>
                        <div className={`info-value ${!userInfo?.phone && 'empty'}`}>
                            {userInfo?.phone || 'Chưa cập nhật'}
                        </div>
                    </div>

                    <div className="info-item col-span-2">
                        <div className="info-label">Địa chỉ</div>
                        <div className={`info-value ${!userInfo?.address && 'empty'}`}>
                            {userInfo?.address || 'Chưa cập nhật'}
                        </div>
                    </div>
                </div>

                <button
                    className="edit-button"
                    onClick={() => setEditing(true)}
                >
                    Chỉnh sửa thông tin
                </button>
            </>
        );
    };

    const renderProfile = () => {
        return (
            <>
                <div className="card-header">
                    <h1 className="section-title">Thông tin cá nhân</h1>
                </div>
                <div className="card-body">
                    <div className="profile-section">
                        {editing ? renderProfileForm() : renderProfileInfo()}
                    </div>
                </div>
            </>
        );
    };
    
    const renderOrders = () => {
        const handleCancelOrder = async (orderId) => {
            if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
                return;
            }
        
            setCancelLoading(true);
            try {
                await axiosInstance.patch(`/orders/${orderId}/cancel`);
                await fetchOrders();
                showToastMessage('Đã hủy đơn hàng thành công');
            } catch (error) {
                showToastMessage('Không thể hủy đơn hàng. Vui lòng thử lại.');
            } finally {
                setCancelLoading(false);
            }
        };

        return (
            <>
                <div className="card-header">
                    <h1 className="section-title">Đơn hàng của tôi</h1>
                </div>
                <div className="card-body">
                    {orders.length === 0 ? (
                        <div className="empty-orders">
                            <div className="empty-icon">📦</div>
                            <p className="empty-text">Bạn chưa có đơn hàng nào</p>
                        </div>
                    ) : (
                        <div className="orders-grid">
                            {orders.map(order => (
                                <div key={order.order_id} className="order-card">
                                    <div className="order-header">
                                        <div>
                                            <span className="order-id">Đơn hàng #{order.order_id}</span>
                                            <span className="order-date">
                                                {new Date(order.order_date).toLocaleDateString('vi-VN', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <span className={`status-badge ${order.status}`}>
                                            {order.status === 'pending' ? 'Chờ xác nhận' :
                                            order.status === 'processing' ? 'Đang xử lý' :
                                            order.status === 'shipped' ? 'Đang giao' :
                                            order.status === 'delivered' ? 'Đã giao' :
                                            order.status === 'cancelled' ? 'Đã hủy' : 
                                            order.status}
                                        </span>
                                    </div>
                                    <div className="order-products">
                                        <h4>Sản phẩm:</h4>
                                        <p>{order.products}</p>
                                    </div>
                                    <div className="order-total">
                                        <span>Tổng tiền:</span>
                                        <span className="amount">
                                            ${Number(order.total_amount).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="order-actions">
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelOrder(order.order_id)}
                                                className="cancel-order-button"
                                                disabled={cancelLoading}
                                            >
                                                {cancelLoading ? 'Đang hủy...' : 'Hủy đơn hàng'}
                                            </button>
                                        )}
                                        
                                        {order.status === 'delivered' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder({
                                                        order_id: order.order_id,
                                                        product_name: order.products // Tên sản phẩm từ order
                                                    });
                                                    setShowReviewModal(true);
                                                }}
                                                className="review-order-button"
                                            >
                                                Đánh giá sản phẩm
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedOrder && showReviewModal && (
                    <ReviewModal
                        isOpen={showReviewModal}
                        onClose={() => {
                            setShowReviewModal(false);
                            setSelectedOrder(null);
                        }}
                        orderDetail={selectedOrder}
                        onReviewSubmitted={() => {
                            showToastMessage('Đã gửi đánh giá thành công');
                            fetchOrders();
                        }}
                    />
                )}
            </>
        );
    };

    const renderWarrantyCheck = () => {
        return (
            <>
                <div className="card-header">
                    <h1 className="section-title">Bảo hành</h1>
                </div>
                <div className="card-body">
                    <WarrantyCheck user={userInfo} />
                </div>
            </>
        );
    };

    const getStatusColor = (status) => {
        const colors = {
        'pending': 'bg-yellow-200 text-yellow-800',
        'processing': 'bg-blue-200 text-blue-800',
        'shipped': 'bg-purple-200 text-purple-800',
        'delivered': 'bg-green-200 text-green-800',
        'cancelled': 'bg-red-200 text-red-800'
        };
        return colors[status] || 'bg-gray-200 text-gray-800';
    };

    return (
        <div className="account-page">
            <Toast 
                message={toastMessage}
                isVisible={showToast}
                onHide={() => setShowToast(false)}
            />

            {showSessionExpiredModal && (
                <SessionExpiredModal onClose={handleModalConfirm} />
            )}

            <div className="sidebar">
                <button
                    className="home-button"
                    onClick={() => navigate('/')}
                >
                    <RiHome9Line />
                </button>

                <h2 className="nav-title">Quản lý tài khoản</h2>
                <nav className="nav-menu">
                    <div 
                        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>Thông tin cá nhân</span>
                    </div>

                    <div 
                        className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <span>Đơn hàng của tôi</span>
                    </div>

                    <div 
                        className={`nav-item ${activeTab === 'warranty' ? 'active' : ''}`}
                        onClick={() => setActiveTab('warranty')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        <span>Bảo hành</span>
                    </div>
                </nav>
            </div>

            <div className="main-content">
                <div className="content-card">
                    {activeTab === 'profile' ? renderProfile() : 
                    activeTab === 'orders' ? renderOrders() : 
                    renderWarrantyCheck()}
                </div>
            </div>

            <ChangeEmailModal 
                isOpen={showChangeEmail}
                onClose={() => setShowChangeEmail(false)}
                onSubmit={handleChangeEmail}
            />
            <ChangePasswordModal
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
                onSubmit={handleChangePassword}
            />
        </div>
    );
};

export default AccountManagement;