import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../services/axiosConfig';
import './CheckoutModal.scss'

const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  appliedCoupon,
  originalTotal,
  promotionDiscount,
  couponDiscount,
  finalTotal,
  user,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasDefaultInfo = user?.phone && user?.address;

  const [useDefaultInfo, setUseDefaultInfo] = useState(hasDefaultInfo);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    note: ''
  });

  useEffect(() => {
    if (user && hasDefaultInfo && useDefaultInfo) {
      setShippingInfo(prev => ({
        ...prev,
        fullName: user.full_name || '',
        phone: user.phone || '',
        address: user.address || ''
      }));
    } else if (!useDefaultInfo) {
      setShippingInfo(prev => ({
        ...prev,
        fullName: user?.full_name || '',
        phone: '',
        address: ''
      }));
    }
  }, [user, hasDefaultInfo, useDefaultInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateShippingInfo = () => {
    if (!shippingInfo.fullName.trim()) return "Vui lòng nhập họ tên";
    if (!shippingInfo.phone.trim()) return "Vui lòng nhập số điện thoại";
    if (!shippingInfo.address.trim()) return "Vui lòng nhập địa chỉ";
    return null;
  };

  const handleNextStep = () => {
    if (currentStep === 2) {
      const validationError = validateShippingInfo();
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    setError(null);
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setError(null);
    setCurrentStep(prev => prev - 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
  
    const validationError = validateShippingInfo();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }
    
    try {
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));
  
      const orderData = {
        items: orderItems,
        shipping_address: `${shippingInfo.fullName}, ${shippingInfo.phone}, ${shippingInfo.address}`,
        note: shippingInfo.note || ''
      };

      if (appliedCoupon) {
        orderData.coupon_id = appliedCoupon.coupon_id;
      }
  
      await axiosInstance.post('/orders/', orderData);
      handleNextStep();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setLoading(false);
    setError(null);
    setUseDefaultInfo(hasDefaultInfo);
    setShippingInfo({
      fullName: user?.full_name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      note: ''
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="checkout-modal active">
        <div className="checkout-modal-content">
          <button className="close-button" onClick={onClose}>×</button>
          
          <div className="steps-indicator">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Xác nhận đơn hàng</span>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Thông tin vận chuyển</span>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Hoàn tất</span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="step-content">
            {currentStep === 1 && (
              <div className="order-confirmation">
                <h3>Xác nhận đơn hàng</h3>
                <div className="order-items">
                  {cartItems.map(item => (
                    <div key={item.cart_item_id} className="order-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                      </div>
                      <span className="item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Tạm tính:</span>
                    <span>${originalTotal.toFixed(2)}</span>
                  </div>
                  {promotionDiscount > 0 && (
                    <div className="summary-row discount">
                      <span>Giảm giá khuyến mãi:</span>
                      <span>-${promotionDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="summary-row discount">
                      <span>Giảm giá mã giảm giá:</span>
                      <span>-${couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span>Tổng cộng:</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="shipping-info">
                <h3>Thông tin vận chuyển</h3>
                
                {hasDefaultInfo && (
                  <div className="default-info-section">
                    <div className="use-default-toggle">
                      <input
                        type="checkbox"
                        id="useDefault"
                        checked={useDefaultInfo}
                        onChange={() => setUseDefaultInfo(!useDefaultInfo)}
                      />
                      <label htmlFor="useDefault">
                        Sử dụng thông tin từ tài khoản
                      </label>
                    </div>
                    
                    {useDefaultInfo && (
                      <div className="default-info-preview">
                        <div className="preview-item">
                          <span className="label">Họ tên:</span>
                          <span className="value">{user.full_name}</span>
                        </div>
                        <div className="preview-item">
                          <span className="label">Số điện thoại:</span>
                          <span className="value">{user.phone}</span>
                        </div>
                        <div className="preview-item">
                          <span className="label">Địa chỉ:</span>
                          <span className="value">{user.address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(!hasDefaultInfo || !useDefaultInfo) && (
                  <div className={`manual-info-form ${useDefaultInfo ? 'hidden' : ''}`}>
                    <div className="form-group">
                      <label>Họ tên:</label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleInputChange}
                        placeholder="Nhập họ tên người nhận"
                      />
                    </div>
                    <div className="form-group">
                      <label>Số điện thoại:</label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div className="form-group">
                      <label>Địa chỉ:</label>
                      <textarea
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        placeholder="Nhập địa chỉ giao hàng"
                        rows="3"
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Ghi chú:</label>
                  <textarea
                    name="note"
                    value={shippingInfo.note}
                    onChange={handleInputChange}
                    placeholder="Ghi chú thêm (không bắt buộc)"
                    rows="2"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="order-success">
                <div className="success-icon">✓</div>
                <h3>Đặt hàng thành công!</h3>
                <p>Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ sớm liên hệ với bạn.</p>
              </div>
            )}
          </div>

          <div className="checkout-modal-actions">
            {currentStep !== 3 ? (
              <>
                {currentStep > 1 && (
                  <button 
                    className="back-button"
                    onClick={handlePrevStep}
                    disabled={loading}
                  >
                    Quay lại
                  </button>
                )}
                <button
                  className="next-button"
                  onClick={currentStep === 2 ? handlePlaceOrder : handleNextStep}
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : currentStep === 2 ? 'Đặt hàng' : 'Tiếp tục'}
                </button>
              </>
            ) : (
              <button
                className="close-button-success"
                onClick={() => {
                  resetModal();
                  onClose();
                }}
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="checkout-modal-overlay active" onClick={onClose} />
    </>
  );
};

export default CheckoutModal;