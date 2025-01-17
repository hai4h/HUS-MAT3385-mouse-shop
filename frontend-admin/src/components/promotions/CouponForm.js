import React, { useState, useEffect } from 'react';

const CouponForm = ({ coupon, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '',
    max_discount_amount: '',
    start_date: '',
    end_date: '',
    total_usage_limit: '',
    user_usage_limit: 1,
    is_active: true,
    category_restrictions: []
  });

  const [categoryRestriction, setCategoryRestriction] = useState({
    category: 'brand',
    category_value: ''
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        name: coupon.name,
        description: coupon.description || '',
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order_value: coupon.min_order_value || '',
        max_discount_amount: coupon.max_discount_amount || '',
        start_date: coupon.start_date,
        end_date: coupon.end_date,
        total_usage_limit: coupon.total_usage_limit || '',
        user_usage_limit: coupon.user_usage_limit,
        is_active: coupon.is_active,
        category_restrictions: coupon.category_restrictions || []
      });
    }
  }, [coupon]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddRestriction = () => {
    if (categoryRestriction.category_value) {
      setFormData(prev => ({
        ...prev,
        category_restrictions: [
          ...prev.category_restrictions,
          { ...categoryRestriction }
        ]
      }));
      setCategoryRestriction({
        category: 'brand',
        category_value: ''
      });
    }
  };

  const handleRemoveRestriction = (index) => {
    setFormData(prev => ({
      ...prev,
      category_restrictions: prev.category_restrictions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{coupon ? 'Edit Coupon' : 'Add New Coupon'}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="coupon-form">
          <div className="form-group">
            <label>Code*</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              pattern="[A-Z0-9]+"
              title="Only uppercase letters and numbers allowed"
            />
          </div>

          <div className="form-group">
            <label>Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
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
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Total Usage Limit</label>
              <input
                type="number"
                name="total_usage_limit"
                value={formData.total_usage_limit}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Usage Limit Per User*</label>
              <input
                type="number"
                name="user_usage_limit"
                value={formData.user_usage_limit}
                onChange={handleChange}
                required
                min="1"
              />
            </div>
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

          <div className="category-restrictions">
            <h3>Category Restrictions</h3>
            
            <div className="form-row">
              <div className="form-group">
                <select
                  value={categoryRestriction.category}
                  onChange={(e) => setCategoryRestriction(prev => ({
                    ...prev,
                    category: e.target.value
                  }))}
                >
                  <option value="brand">Brand</option>
                </select>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  value={categoryRestriction.category_value}
                  onChange={(e) => setCategoryRestriction(prev => ({
                    ...prev,
                    category_value: e.target.value
                  }))}
                  placeholder="Enter value"
                />
              </div>

              <button
                type="button"
                onClick={handleAddRestriction}
                className="add-restriction-button"
              >
                Add
              </button>
            </div>

            <div className="restrictions-list">
              {formData.category_restrictions.map((restriction, index) => (
                <div key={index} className="restriction-item">
                  <span>{restriction.category}: {restriction.category_value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRestriction(index)}
                    className="remove-restriction-button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              {coupon ? 'Update' : 'Create'} Coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponForm;