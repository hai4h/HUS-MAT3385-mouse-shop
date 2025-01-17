import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosConfig';
import { Plus } from 'lucide-react';

import Toast from '../../components/common/Toast';
import WarrantyPolicyForm from '../../components/warranties/WarrantyPolicyForm';

import '../../styles/pages/warranties.scss';

const Warranties = () => {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchWarrantyData();
  }, []);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const fetchWarrantyData = async () => {
    try {
      setLoading(true);
      const [claimsResponse, policiesResponse] = await Promise.all([
        axiosInstance.get('/warranties/claims'),
        axiosInstance.get('/warranties/policies')
      ]);
      
      setClaims(claimsResponse.data);
      setPolicies(policiesResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch warranty data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (claimId, newStatus) => {
    try {
      await axiosInstance.patch(`/warranties/claims/${claimId}/status`, {
        status: newStatus
      });
      await fetchWarrantyData();
      showToastMessage('Cập nhật trạng thái thành công'); // Thêm thông báo
    } catch (error) {
      console.error('Error updating claim status:', error);
      showToastMessage('Có lỗi xảy ra khi cập nhật trạng thái'); // Thêm thông báo lỗi
    }
  };

  const handleSavePolicy = async (policyData) => {
    try {
      if (selectedPolicy) {
        await axiosInstance.put(
          `/warranty-policies/${selectedPolicy.warranty_id}`,
          policyData
        );
        showToastMessage('Cập nhật chính sách bảo hành thành công'); // Thêm thông báo
      } else {
        await axiosInstance.post('/warranties/policies', policyData);
        showToastMessage('Tạo chính sách bảo hành mới thành công'); // Thêm thông báo
      }
      
      await fetchWarrantyData();
      setShowPolicyForm(false);
      setSelectedPolicy(null);
    } catch (error) {
      console.error('Error saving warranty policy:', error);
      showToastMessage('Có lỗi xảy ra. Vui lòng thử lại'); // Thêm thông báo lỗi
    }
  };

  if (loading) {
    return <div className="loading-state">Loading warranty data...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="warranties-page">
      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onHide={() => setShowToast(false)}
      />
      
      {/* Warranty Claims Section */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Warranty Claims</h2>
        </div>
        
        <div className="claims-list">
          <table className="claims-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Claim Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.claim_id}>
                  <td>#{claim.claim_id}</td>
                  <td>{claim.product_name}</td>
                  <td>{claim.customer_name}</td>
                  <td>{claim.issue_description}</td>
                  <td>
                    <span className={`status-badge ${claim.status}`}>
                      {claim.status}
                    </span>
                  </td>
                  <td>{new Date(claim.claim_date).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <select
                        value={claim.status}
                        onChange={(e) => handleStatusUpdate(claim.claim_id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warranty Policies Section */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Warranty Policies</h2>
          <button 
            className="create-policy-button"
            onClick={() => setShowPolicyForm(true)}
          >
            <Plus className="button-icon" />
            <span>Add Policy</span>
          </button>
        </div>
        
        <div className="policies-list">
          <table className="policies-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Period</th>
                <th>Type</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr key={policy.warranty_id}>
                  <td>{policy.product_name}</td>
                  <td>{policy.warranty_period} months</td>
                  <td>{policy.warranty_type}</td>
                  <td>{policy.warranty_description}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-button edit"
                        onClick={() => {
                          setSelectedPolicy(policy);
                          setShowPolicyForm(true);
                        }}
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
      </div>

      {showPolicyForm && (
        <WarrantyPolicyForm
          policy={selectedPolicy}
          onSave={handleSavePolicy}
          onClose={() => {
            setShowPolicyForm(false);
            setSelectedPolicy(null);
          }}
        />
      )}
    </div>
  );
};

export default Warranties;