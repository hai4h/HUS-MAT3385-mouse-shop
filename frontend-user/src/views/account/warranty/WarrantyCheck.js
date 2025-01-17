import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../services/axiosConfig';
import '../../../styles/desktop/WarrantyCheck.scss'

import WarrantyDetailsModal from './WarrantyDetailsModal';

const WarrantyCheck = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [warrantyDetails, setWarrantyDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedProductForClaim, setSelectedProductForClaim] = useState(null);
  const [claimDescription, setClaimDescription] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [existingClaims, setExistingClaims] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchWarrantyClaims();
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

  const fetchWarrantyClaims = async () => {
    try {
      const response = await axiosInstance.get('/warranties/claims/user');
      setExistingClaims(response.data);
    } catch (error) {
      console.error('Error fetching warranty claims:', error);
    }
  };

  const handleOrderSelect = async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedOrder(null);
      setWarrantyDetails(null);
  
      const [orderResponse, orderDetailsResponse] = await Promise.all([
        axiosInstance.get(`/orders/${orderId}`),
        axiosInstance.get(`/orders/details/${orderId}`)
      ]);
  
      const orderDetails = orderResponse.data;
      const orderItems = orderDetailsResponse.data;
  
      const warranties = await Promise.all(
        orderItems.map(async (item) => {
          try {
            const response = await axiosInstance.get(`/warranties/policies/${item.product_id}`);
            return {
              productId: item.product_id,
              orderDetailId: item.order_detail_id,
              warrantyInfo: {
                ...response.data,
                product_name: item.product_name
              },
              status: calculateWarrantyStatus(orderDetails.order_date, response.data.warranty_period)
            };
          } catch (error) {
            return {
              productId: item.product_id,
              orderDetailId: item.order_detail_id,
              warrantyInfo: null,
              status: null,
              product_name: item.product_name
            };
          }
        })
      );
  
      setSelectedOrder(orderDetails);
      setWarrantyDetails(warranties);
      setShowWarrantyModal(true);
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

  const handleWarrantyClaim = async () => {
    if (!selectedProductForClaim) return;

    if (claimDescription.trim().length < 10) {
      alert('Mô tả vấn đề phải có ít nhất 10 ký tự');
      return;
    }

    try {
      setClaimSubmitting(true);
      
      await axiosInstance.post('/warranties/claims', {
        order_detail_id: selectedProductForClaim.orderDetailId,
        issue_description: claimDescription,
        resolution_notes: resolutionNotes || '',
        status: 'pending'
      });

      // Reset states
      setShowClaimModal(false);
      setSelectedProductForClaim(null);
      setClaimDescription('');
      setResolutionNotes('');
      
      // Refresh warranty claims
      await fetchWarrantyClaims();
      
      // Show success message
      alert('Yêu cầu bảo hành đã được gửi thành công');
      
      // Switch to claims tab
      setActiveTab('claims');
    } catch (error) {
      console.error('Error submitting warranty claim:', error);
      alert(error.response?.data?.detail || 'Không thể gửi yêu cầu bảo hành. Vui lòng thử lại.');
    } finally {
      setClaimSubmitting(false);
    }
  };

  const openClaimModal = (product) => {
    setSelectedProductForClaim(product);
    setShowClaimModal(true);
    setClaimDescription('');
    setResolutionNotes('');
  };

  const renderStatusBadge = (status) => {
    const statusColors = {
      'pending': { text: 'Chờ xử lý', color: 'bg-yellow-200 text-yellow-800' },
      'processing': { text: 'Đang xử lý', color: 'bg-blue-200 text-blue-800' },
      'completed': { text: 'Hoàn thành', color: 'bg-green-200 text-green-800' },
      'rejected': { text: 'Từ chối', color: 'bg-red-200 text-red-800' }
    };
    
    const statusInfo = statusColors[status] || { text: status, color: 'bg-gray-200 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div className="warranty-section">
      {showWarrantyModal && warrantyDetails && (
        <WarrantyDetailsModal
          warrantyDetails={warrantyDetails}
          onClose={() => setShowWarrantyModal(false)}
          openClaimModal={openClaimModal}
        />
      )}
      <h3 className="section-subtitle">Tra cứu bảo hành</h3>

      {/* Tab Navigation */}
      <div className="warranty-tabs">
        <button
          className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Đơn hàng
        </button>
        <button
          className={`tab-button ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          Yêu cầu bảo hành
        </button>
      </div>

      {/* Orders Tab Content */}
      {activeTab === 'current' && (
        <>
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
          </div>
        </>
      )}

      {/* Warranty Claims Tab Content */}
      
      {activeTab === 'claims' && (
        <div className="warranty-claims-section">
          {existingClaims.length === 0 ? (
            <div className="no-claims-message">
              Bạn chưa có yêu cầu bảo hành nào
            </div>
          ) : (
            <div className="warranty-claims-grid">
              {existingClaims.map((claim) => (
                <div key={claim.claim_id} className="warranty-claim-item">
                  <div className="claim-header">
                    <h5 className="claim-product-name">{claim.product_name}</h5>
                    {renderStatusBadge(claim.status)}
                  </div>
                  <div className="claim-details">
                    <div className="detail-row">
                      <span className="label">Ngày yêu cầu:</span>
                      <span className="value">
                        {new Date(claim.claim_date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Mô tả vấn đề:</span>
                      <span className="value">{claim.issue_description}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Warranty Claim Modal */}
      {showClaimModal && (
        <div className="warranty-claim-modal-overlay">
          <div className="warranty-claim-modal">
            <div className="warranty-claim-modal-header">
              <h3>Yêu cầu bảo hành</h3>
              <button 
                className="close-button" 
                onClick={() => setShowClaimModal(false)}
              >
                ×
              </button>
            </div>
            <div className="warranty-claim-modal-body">
              <p>Sản phẩm: {selectedProductForClaim.productName}</p>
              <div className="form-group">
                <label>Mô tả vấn đề (bắt buộc):</label>
                <textarea
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                  placeholder="Chi tiết về sự cố của sản phẩm (ít nhất 10 ký tự)..."
                  required
                  minLength={10}
                />
              </div>
              <div className="form-group">
                <label>Ghi chú bổ sung (tùy chọn):</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Thêm thông tin chi tiết về vấn đề (tuỳ chọn)..."
                />
              </div>
              <div className="warranty-claim-actions">
                <button 
                  className="cancel-button"
                  onClick={() => setShowClaimModal(false)}
                  disabled={claimSubmitting}
                >
                  Hủy
                </button>
                <button 
                  className="submit-button"
                  onClick={handleWarrantyClaim}
                  disabled={claimDescription.trim().length < 10 || claimSubmitting}
                >
                  {claimSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarrantyCheck;