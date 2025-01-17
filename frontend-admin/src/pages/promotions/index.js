import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosConfig';
import { Plus } from 'lucide-react';

import Toast from '../../components/common/Toast';
import PromotionForm from '../../components/promotions/PromotionForm';
import CouponManagement from '../../components/promotions/CouponManagement';

import '../../styles/pages/promotions.scss';

const Promotions = () => {
  const [activeTab, setActiveTab] = useState('promotions'); // 'promotions' or 'coupons'
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (activeTab === 'promotions') {
      fetchPromotions();
    }
  }, [activeTab]);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/promotions/');
      setPromotions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch promotions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (promotion) => {
    setSelectedPromotion(promotion);
    setShowForm(true);
  };

  const handleSave = async (promotionData) => {
    try {
      if (selectedPromotion) {
        await axiosInstance.put(
          `/promotions/${selectedPromotion.promotion_id}`, 
          promotionData
        );
        showToastMessage('Cập nhật khuyến mãi thành công');
      } else {
        await axiosInstance.post('/promotions/', promotionData);
        showToastMessage('Tạo khuyến mãi mới thành công');
      }
      
      fetchPromotions();
      setShowForm(false);
      setSelectedPromotion(null);
    } catch (error) {
      console.error('Error saving promotion:', error);
      showToastMessage('Có lỗi xảy ra. Vui lòng thử lại');
    }
  };

  const renderPromotionsTab = () => {
    if (loading) {
      return <div className="loading-state">Loading promotions...</div>;
    }

    if (error) {
      return <div className="error-state">{error}</div>;
    }

    return (
      <>
        <div className="section-header">
          <button 
            className="create-button"
            onClick={() => setShowForm(true)}
          >
            <Plus className="button-icon" />
            <span>Add Promotion</span>
          </button>
        </div>

        <div className="promotions-list">
          <table className="promotions-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Value</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => (
                <tr key={promotion.promotion_id}>
                  <td>{promotion.name}</td>
                  <td>{promotion.discount_type}</td>
                  <td>
                    {promotion.discount_type === 'percentage' 
                      ? `${promotion.discount_value}%`
                      : `$${promotion.discount_value}`}
                  </td>
                  <td>{new Date(promotion.start_date).toLocaleDateString()}</td>
                  <td>{new Date(promotion.end_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${promotion.is_active ? 'active' : 'inactive'}`}>
                      {promotion.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-button edit"
                        onClick={() => handleEdit(promotion)}
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
          <PromotionForm
            promotion={selectedPromotion}
            onSave={handleSave}
            onClose={() => {
              setShowForm(false);
              setSelectedPromotion(null);
            }}
          />
        )}
      </>
    );
  };

  return (
    <div className="promotions-page">
      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onHide={() => setShowToast(false)}
      />

      <div className="page-header">
        <h1 className="page-title">Marketing Management</h1>
        
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'promotions' ? 'active' : ''}`}
            onClick={() => setActiveTab('promotions')}
          >
            Promotions
          </button>
          <button
            className={`tab ${activeTab === 'coupons' ? 'active' : ''}`}
            onClick={() => setActiveTab('coupons')}
          >
            Coupons
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'promotions' ? (
          renderPromotionsTab()
        ) : (
          <CouponManagement onShowToast={showToastMessage} />
        )}
      </div>
    </div>
  );
};

export default Promotions;