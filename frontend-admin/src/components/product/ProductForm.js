import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ProductForm = ({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    // Product basic info
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    hand_size: '', // small, medium, large
    grip_style: '', // palm, claw, fingertip
    is_wireless: false,
    brand: '',
    is_active: true,

    // Technical specs
    dpi: '',
    weight_g: '',
    length_mm: '',
    width_mm: '',
    height_mm: '',
    sensor_type: '',
    polling_rate: '',
    switch_type: '',
    switch_durability: '',
    connectivity: '',
    battery_life: '',
    cable_type: '',
    rgb_lighting: false,
    programmable_buttons: '',
    memory_profiles: ''
  });

  // Dropdown options
  const handSizes = ['small', 'medium', 'large'];
  const gripStyles = ['palm', 'claw', 'fingertip'];

  useEffect(() => {
    if (product) {
      // Merge product data and technical specs with correct field mapping
      const formattedData = {
        // Basic product info
        name: product.name || '',
        description: product.description || '',
        price: String(product.price) || '',
        stock_quantity: String(product.stock_quantity) || '',
        hand_size: product.hand_size || '',
        grip_style: product.grip_style || '',
        is_wireless: product.is_wireless || false,
        brand: product.brand || '',
        is_active: product.is_active ?? true,
  
        // Technical specs - map the fields directly from product object
        dpi: product.dpi || '',
        weight_g: product.weight_g || '',
        length_mm: product.length_mm || '',
        width_mm: product.width_mm || '',
        height_mm: product.height_mm || '',
        sensor_type: product.sensor_type || '',
        polling_rate: product.polling_rate || '',
        switch_type: product.switch_type || '',
        switch_durability: product.switch_durability || '',
        connectivity: product.connectivity || '',
        battery_life: product.battery_life || '',
        cable_type: product.cable_type || '',
        rgb_lighting: product.rgb_lighting || false,
        programmable_buttons: product.programmable_buttons || '',
        memory_profiles: product.memory_profiles || ''
      };
  
      setFormData(formattedData);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Ensure all numeric values are converted to numbers
      const formattedData = {
        ...formData,
        price: Number(formData.price),
        stock_quantity: Number(formData.stock_quantity),
        dpi: Number(formData.dpi),
        weight_g: Number(formData.weight_g),
        length_mm: Number(formData.length_mm),
        width_mm: Number(formData.width_mm),
        height_mm: Number(formData.height_mm),
        polling_rate: Number(formData.polling_rate),
        switch_durability: Number(formData.switch_durability),
        battery_life: formData.is_wireless ? Number(formData.battery_life) : null,
        programmable_buttons: Number(formData.programmable_buttons)
      };

      // Create product object
      const product = {
        name: formattedData.name,
        description: formattedData.description,
        price: formattedData.price,
        stock_quantity: formattedData.stock_quantity,
        hand_size: formattedData.hand_size,
        grip_style: formattedData.grip_style,
        is_wireless: formattedData.is_wireless,
        brand: formattedData.brand,
        is_active: formattedData.is_active
      };

      // Create specs object
      const specs = {
        dpi: formattedData.dpi,
        weight_g: formattedData.weight_g,
        length_mm: formattedData.length_mm,
        width_mm: formattedData.width_mm,
        height_mm: formattedData.height_mm,
        sensor_type: formattedData.sensor_type,
        polling_rate: formattedData.polling_rate,
        switch_type: formattedData.switch_type,
        switch_durability: formattedData.switch_durability,
        connectivity: formattedData.connectivity,
        battery_life: formData.is_wireless ? formattedData.battery_life : null,
        cable_type: formattedData.cable_type,
        rgb_lighting: formattedData.rgb_lighting,
        programmable_buttons: formattedData.programmable_buttons,
        memory_profiles: formattedData.memory_profiles
      };

      // Log the data to verify structure
      console.log('Submitting product data:', { product, specs });

      // Call onSave with the structured data
      await onSave({ product, specs });
    } catch (error) {
      console.error('Error submitting form:', error);
      // Show error message to the user
      alert('Failed to submit product: ' + error.message);
    }
  };

  return (
    <div className="product-form-overlay">
        <div className="product-form-modal">
            <div className="form-header">
                <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
                <button className="close-button" onClick={onClose}>
                    <X />
                </button>
            </div>

        <form onSubmit={handleSubmit} className="product-form">
            <div className="form-grid">
            {/* Basic Information Section */}
            <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="form-group">
                <label htmlFor="name">Product Name*</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                </div>

                <div className="form-group">
                <label htmlFor="brand">Brand*</label>
                <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                />
                </div>

                <div className="form-row">
                <div className="form-group">
                    <label htmlFor="price">Price*</label>
                    <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="stock_quantity">Stock*</label>
                    <input
                    type="number"
                    id="stock_quantity"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    min="0"
                    required
                    />
                </div>
                </div>

                <div className="form-row">
                    <div className="form-group required">
                    <label htmlFor="hand_size">Hand Size</label>
                    <select
                        id="hand_size"
                        name="hand_size"
                        value={formData.hand_size}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Select hand size</option>
                        {handSizes.map(size => (
                        <option key={size} value={size}>
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                        </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="grip_style">Grip Style*</label>
                    <select
                    id="grip_style"
                    name="grip_style"
                    value={formData.grip_style}
                    onChange={handleChange}
                    required
                    >
                    <option value="">Select grip style</option>
                    {gripStyles.map(style => (
                        <option key={style} value={style}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                        </option>
                    ))}
                    </select>
                </div>
                </div>

                <div className="form-group">
                <label className="checkbox-label">
                    <input
                    type="checkbox"
                    name="is_wireless"
                    checked={formData.is_wireless}
                    onChange={handleChange}
                    />
                    Wireless
                </label>
                </div>

                <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
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
            </div>

            {/* Technical Specifications Section */}
            <div className="form-section">
            <h3>Technical Specifications</h3>

            {/* Sensor & Performance */}
            <div className="form-row">
                <div className="form-group">
                <label htmlFor="dpi">DPI*</label>
                <input
                    type="number"
                    id="dpi"
                    name="dpi"
                    value={formData.dpi}
                    onChange={handleChange}
                    required
                />
                </div>

                <div className="form-group">
                <label htmlFor="polling_rate">Polling Rate (Hz)*</label>
                <input
                    type="number"
                    id="polling_rate"
                    name="polling_rate"
                    value={formData.polling_rate}
                    onChange={handleChange}
                    required
                />
                </div>

                <div className="form-group">
                <label htmlFor="sensor_type">Sensor Type*</label>
                <input
                    type="text"
                    id="sensor_type"
                    name="sensor_type"
                    value={formData.sensor_type}
                    onChange={handleChange}
                    required
                />
                </div>
            </div>

            {/* Physical Dimensions */}
            <div className="form-row">
                <div className="form-group">
                <label htmlFor="weight_g">Weight (g)*</label>
                <input
                    type="number"
                    id="weight_g"
                    name="weight_g"
                    value={formData.weight_g}
                    onChange={handleChange}
                    step="0.01"
                    required
                />
                </div>

                <div className="form-group">
                <label htmlFor="length_mm">Length (mm)*</label>
                <input
                    type="number"
                    id="length_mm"
                    name="length_mm"
                    value={formData.length_mm}
                    onChange={handleChange}
                    step="0.01"
                    required
                />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                <label htmlFor="width_mm">Width (mm)*</label>
                <input
                    type="number"
                    id="width_mm"
                    name="width_mm"
                    value={formData.width_mm}
                    onChange={handleChange}
                    step="0.01"
                    required
                />
                </div>

                <div className="form-group">
                <label htmlFor="height_mm">Height (mm)*</label>
                <input
                    type="number"
                    id="height_mm"
                    name="height_mm"
                    value={formData.height_mm}
                    onChange={handleChange}
                    step="0.01"
                    required
                />
                </div>
            </div>

            {/* Switches & Buttons */}
            <div className="form-row">
                <div className="form-group">
                <label htmlFor="switch_type">Switch Type*</label>
                <input
                    type="text"
                    id="switch_type"
                    name="switch_type"
                    value={formData.switch_type}
                    onChange={handleChange}
                    required
                />
                </div>

                <div className="form-group">
                <label htmlFor="switch_durability">Switch Durability (clicks)*</label>
                <input
                    type="number"
                    id="switch_durability"
                    name="switch_durability"
                    value={formData.switch_durability}
                    onChange={handleChange}
                    required
                />
                </div>

                <div className="form-group">
                <label htmlFor="programmable_buttons">Programmable Buttons*</label>
                <input
                    type="number"
                    id="programmable_buttons"
                    name="programmable_buttons"
                    value={formData.programmable_buttons}
                    onChange={handleChange}
                    required
                />
                </div>
            </div>

            {/* Connectivity */}
            <div className="form-row">
                <div className="form-group">
                <label htmlFor="connectivity">Connectivity Type*</label>
                <input
                    type="text"
                    id="connectivity"
                    name="connectivity"
                    value={formData.connectivity}
                    onChange={handleChange}
                    required
                />
                </div>

                <div className="form-group">
                <label htmlFor="cable_type">Cable Type*</label>
                <input
                    type="text"
                    id="cable_type"
                    name="cable_type"
                    value={formData.cable_type}
                    onChange={handleChange}
                    required
                />
                </div>
            </div>

            {/* Wireless Specific Fields */}
            {formData.is_wireless && (
                <div className="form-row">
                <div className="form-group">
                    <label htmlFor="battery_life">Battery Life (hours)*</label>
                    <input
                    type="number"
                    id="battery_life"
                    name="battery_life"
                    value={formData.battery_life}
                    onChange={handleChange}
                    required={formData.is_wireless}
                    />
                </div>
                </div>
            )}

            {/* Additional Features */}
            <div className="form-row">
                <div className="form-group">
                <label htmlFor="memory_profiles">Memory Profiles*</label>
                <input
                    type="text"
                    id="memory_profiles"
                    name="memory_profiles"
                    value={formData.memory_profiles}
                    onChange={handleChange}
                    required
                />
                </div>

                <div className="form-group">
                <label className="checkbox-label">
                    <input
                    type="checkbox"
                    name="rgb_lighting"
                    checked={formData.rgb_lighting}
                    onChange={handleChange}
                    />
                    RGB Lighting
                </label>
                </div>
            </div>
            </div>
            </div>

            <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
                Cancel
            </button>
            <button type="submit" className="save-button">
                {product ? 'Update Product' : 'Create Product'}
            </button>
            </div>
        </form>
        </div>
    </div>
  );
};

export default ProductForm;