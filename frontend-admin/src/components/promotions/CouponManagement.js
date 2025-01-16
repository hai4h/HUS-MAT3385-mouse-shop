import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import axiosInstance from '../../services/axiosConfig';
import CouponForm from './CouponForm';

const CouponManagement = ({ onShowToast }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/coupons/');
      setCoupons(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch coupons');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (coupon) => {
    setSelectedCoupon(coupon);
    setShowForm(true);
  };

  const handleSave = async (couponData) => {
    try {
      if (selectedCoupon) {
        await axiosInstance.put(
          `/coupons/${selectedCoupon.coupon_id}`, 
          couponData
        );
        onShowToast('Cập nhật mã giảm giá thành công');
      } else {
        await axiosInstance.post('/coupons/', couponData);
        onShowToast('Tạo mã giảm giá mới thành công');
      }
      
      fetchCoupons();
      setShowForm(false);
      setSelectedCoupon(null);
    } catch (error) {
      console.error('Error saving coupon:', error);
      onShowToast('Có lỗi xảy ra. Vui lòng thử lại');
    }
  };

  if (loading) {
    return <div className="loading-state">Loading coupons...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="coupons-section">
      <div className="section-header">
        <h2 className="section-title">Coupons</h2>
        <button 
          className="create-button"
          onClick={() => setShowForm(true)}
        >
          <Plus className="button-icon" />
          <span>Add Coupon</span>
        </button>
      </div>

      <div className="coupons-list">
        <table className="coupons-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Value</th>
              <th>Min Order</th>
              <th>Max Discount</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.coupon_id}>
                <td>{coupon.code}</td>
                <td>{coupon.name}</td>
                <td>{coupon.discount_type}</td>
                <td>
                  {coupon.discount_type === 'percentage' 
                    ? `${coupon.discount_value}%`
                    : `$${coupon.discount_value}`}
                </td>
                <td>${coupon.min_order_value || '-'}</td>
                <td>${coupon.max_discount_amount || '-'}</td>
                <td>{new Date(coupon.start_date).toLocaleDateString()}</td>
                <td>{new Date(coupon.end_date).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${coupon.is_active ? 'active' : 'inactive'}`}>
                    {coupon.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-button edit"
                      onClick={() => handleEdit(coupon)}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <CouponForm
          coupon={selectedCoupon}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setSelectedCoupon(null);
          }}
        />
      )}
    </div>
  );
};

export default CouponManagement;