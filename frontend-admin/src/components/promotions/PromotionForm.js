import React, { useState, useEffect } from 'react';

const PromotionForm = ({ promotion, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    start_date: '',
    end_date: '',
    min_order_value: '',
    max_discount_amount: '',
    usage_limit: '',
    is_active: true
  });

  useEffect(() => {
    if (promotion) {
      // Convert dates to local datetime-local format
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
      };

      setFormData({
        name: promotion.name,
        description: promotion.description || '',
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
        start_date: formatDate(promotion.start_date),
        end_date: formatDate(promotion.end_date),
        min_order_value: promotion.min_order_value || '',
        max_discount_amount: promotion.max_discount_amount || '',
        usage_limit: promotion.usage_limit || '',
        is_active: promotion.is_active
      });
    }
  }, [promotion]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert form data to proper format
    const formattedData = {
      ...formData,
      discount_value: parseFloat(formData.discount_value),
      min_order_value: formData.min_order_value ? parseFloat(formData.min_order_value) : null,
      max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString()
    };

    onSave(formattedData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="promotion-form-overlay">
      <div className="promotion-form-modal">
        <div className="form-header">
          <h2>{promotion ? 'Edit Promotion' : 'Add New Promotion'}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="promotion-form">
          <div className="form-group">
            <label>Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter promotion name"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter promotion description"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type*</label>
              <select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
                required
              >
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed Amount</option>
              </select>
            </div>

            <div className="form-group">
              <label>Value*</label>
              <input
                type="number"
                name="discount_value"
                value={formData.discount_value}
                onChange={handleChange}
                required
                min="0"
                max={formData.discount_type === 'percentage' ? "100" : undefined}
                step="0.01"
                placeholder={formData.discount_type === 'percentage' ? "Enter percentage" : "Enter amount"}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Minimum Order Value</label>
              <input
                type="number"
                name="min_order_value"
                value={formData.min_order_value}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Enter minimum order value"
              />
            </div>

            <div className="form-group">
              <label>Maximum Discount Amount</label>
              <input
                type="number"
                name="max_discount_amount"
                value={formData.max_discount_amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Enter maximum discount"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date*</label>
              <input
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date*</label>
              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                min={formData.start_date}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Usage Limit</label>
            <input
              type="number"
              name="usage_limit"
              value={formData.usage_limit}
              onChange={handleChange}
              min="0"
              placeholder="Enter maximum number of uses"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              Active
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              {promotion ? 'Update' : 'Create'} Promotion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromotionForm;