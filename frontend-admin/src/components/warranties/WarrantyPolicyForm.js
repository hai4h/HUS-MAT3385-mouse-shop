import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosConfig';

const WarrantyPolicyForm = ({ policy, onSave, onClose }) => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '',
    warranty_period: '',
    warranty_type: '',
    warranty_description: '',
    warranty_conditions: ''
  });

  useEffect(() => {
    fetchProducts();
    if (policy) {
      setFormData({
        product_id: policy.product_id,
        warranty_period: policy.warranty_period,
        warranty_type: policy.warranty_type,
        warranty_description: policy.warranty_description,
        warranty_conditions: policy.warranty_conditions || ''
      });
    }
  }, [policy]);

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="warranty-form-overlay">
      <div className="warranty-form-modal">
        <div className="form-header">
          <h2>{policy ? 'Edit Warranty Policy' : 'Add New Warranty Policy'}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="warranty-form">
          <div className="form-group">
            <label>Product</label>
            <select
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product.product_id} value={product.product_id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Warranty Period (months)</label>
            <input
              type="number"
              name="warranty_period"
              value={formData.warranty_period}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Warranty Type</label>
            <input
              type="text"
              name="warranty_type"
              value={formData.warranty_type}
              onChange={handleChange}
              required
              placeholder="e.g. Manufacturer Warranty"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="warranty_description"
              value={formData.warranty_description}
              onChange={handleChange}
              required
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Conditions</label>
            <textarea
              name="warranty_conditions"
              value={formData.warranty_conditions}
              onChange={handleChange}
              rows="3"
              placeholder="Optional warranty conditions"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              {policy ? 'Update' : 'Create'} Policy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WarrantyPolicyForm;