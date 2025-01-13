import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../services/axiosConfig';
import './WarrantyCheck.scss'

const WarrantyCheck = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [warrantyDetails, setWarrantyDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/orders/');
      setOrders(response.data);
    } catch (error) {
      setError('Không thể tải danh sách đơn hàng');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSelect = async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Reset states
      setSelectedOrder(null);
      setWarrantyDetails(null);

      // Fetch order details
      const orderResponse = await axiosInstance.get(`/orders/${orderId}`);
      setSelectedOrder(orderResponse.data);

      // Get warranty policies for products in the order
      const orderDetails = orderResponse.data;
      const productIds = orderDetails.products.split(',').map(p => p.trim());
      
      const warrantyPromises = productIds.map(async productId => {
        try {
          const response = await axiosInstance.get(`/warranties/policies/${productId}`);
          const warrantyInfo = response.data;
          
          // Calculate warranty status for each product
          const status = calculateWarrantyStatus(orderDetails.order_date, warrantyInfo.warranty_period);
          
          return {
            productId,
            warrantyInfo,
            status
          };
        } catch (error) {
          return {
            productId,
            warrantyInfo: null,
            status: null
          };
        }
      });

      const warranties = await Promise.all(warrantyPromises);
      setWarrantyDetails(warranties);

    } catch (error) {
      setError('Không thể tải thông tin bảo hành');
      console.error('Error fetching warranty details:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWarrantyStatus = (orderDate, warrantyPeriod) => {
    const purchaseDate = new Date(orderDate);
    const warrantyEnd = new Date(purchaseDate.setMonth(purchaseDate.getMonth() + warrantyPeriod));
    const today = new Date();
    
    return {
      isValid: today <= warrantyEnd,
      endDate: warrantyEnd.toLocaleDateString('vi-VN')
    };
  };

  return (
    <div className="warranty-section">
      <h3 className="section-subtitle">Tra cứu bảo hành</h3>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="warranty-content">
        <div className="orders-section">
          <h4 className="section-subtitle">Chọn đơn hàng</h4>
          <div className="orders-grid">
            {orders.map(order => (
              <button
                key={order.order_id}
                onClick={() => handleOrderSelect(order.order_id)}
                className="order-select-button"
              >
                <div className="order-header">
                  <span className="order-id">Đơn hàng #{order.order_id}</span>
                  <span className="order-date">
                    {new Date(order.order_date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="order-products">
                  {order.products}
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedOrder && warrantyDetails && (
          <div className="warranty-details-section">
            <h4 className="section-subtitle">Thông tin bảo hành</h4>
              <div className="warranty-cards">
                {warrantyDetails.map(({ productId, warrantyInfo, status }) => {
                  return (
                    <div key={productId} className="warranty-card">
                      {warrantyInfo ? (
                        <>
                          <div className="warranty-header">
                            <div className="product-info">
                              <h5 className="product-name">{warrantyInfo.product_name}</h5>
                              <p className="warranty-type">{warrantyInfo.warranty_type}</p>
                            </div>
                            <span className={`warranty-status ${status.isValid ? 'valid' : 'expired'}`}>
                              {status.isValid ? 'Còn bảo hành' : 'Hết bảo hành'}
                            </span>
                          </div>
                          
                          <div className="warranty-details">
                            <div className="detail-row">
                              <span className="label">Thời hạn:</span>
                              <span className="value">{warrantyInfo.warranty_period} tháng</span>
                            </div>
                            <div className="detail-row">
                              <span className="label">Ngày hết hạn:</span>
                              <span className="value">{status.endDate}</span>
                            </div>
                          </div>

                          {warrantyInfo.warranty_conditions && (
                            <div className="warranty-conditions">
                              <p className="conditions-title">Điều kiện bảo hành:</p>
                              <p className="conditions-content">{warrantyInfo.warranty_conditions}</p>
                            </div>
                          )}

                          <div className="warranty-actions">
                            <button 
                              className={`warranty-button ${!status.isValid ? 'disabled' : ''}`}
                              disabled={!status.isValid}
                            >
                              Yêu cầu bảo hành
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="warranty-header no-warranty">
                          <div className="product-info">
                            <h5 className="product-name">
                              {selectedOrder.products.split(',')[warrantyDetails.indexOf({ productId, warrantyInfo, status })]}
                            </h5>
                            <p className="warranty-message">Sản phẩm chưa được kích hoạt bảo hành</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarrantyCheck;