import { React, useState, useEffect } from 'react';
import { Filter, Search, X } from 'lucide-react';

const ProductFilters = ({ 
    filters, 
    onFilterChange, 
    onResetFilters, 
    products,
    onSearchIdChange 
  }) => {
    const handSizes = ['small', 'medium', 'large'];
    const gripStyles = ['palm', 'claw', 'fingertip'];
    const brands = ['Logitech', 'Razer', 'Zowie', 'Pulsar', 'Waizowl'];
    
    // State cho tìm kiếm theo ID
    const [searchId, setSearchId] = useState('');
    const [filteredProducts, setFilteredProducts] = useState(products);
  
    // Xử lý tìm kiếm theo ID
    useEffect(() => {
      if (!searchId) {
        // Nếu không có giá trị tìm kiếm, trả về toàn bộ sản phẩm
        onSearchIdChange(null);
        return;
      }
  
      // Tìm kiếm theo ID (chuyển đổi sang số để so sánh)
      const searchNumber = Number(searchId);
      
      if (!isNaN(searchNumber)) {
        const filtered = products.filter(product => 
          product.product_id === searchNumber
        );
        
        // Nếu tìm thấy, truyền sản phẩm đã lọc
        // Nếu không tìm thấy, truyền mảng rỗng
        onSearchIdChange(filtered);
      }
    }, [searchId, products, onSearchIdChange]);
  
    // Xóa giá trị tìm kiếm
    const clearSearch = () => {
      setSearchId('');
      onSearchIdChange(null);
    };

    return (
    <div className="product-filters">
        <div className="search-id-container">
            <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input 
                type="text" 
                placeholder="Search by Product ID" 
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="search-id-input"
            />
            {searchId && (
                <button 
                onClick={clearSearch} 
                className="clear-search-btn"
                >
                <X size={20} />
                </button>
            )}
            </div>
      </div>

      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>Hand Size</label>
            <select 
              value={filters.hand_size || ''} 
              onChange={(e) => onFilterChange('hand_size', e.target.value)}
            >
              <option value="">All</option>
              {handSizes.map(size => (
                <option key={size} value={size}>
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Grip Style</label>
            <select 
              value={filters.grip_style || ''} 
              onChange={(e) => onFilterChange('grip_style', e.target.value)}
            >
              <option value="">All</option>
              {gripStyles.map(style => (
                <option key={style} value={style}>
                  {style.charAt(0).toUpperCase() + style.slice(1)} Grip
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Brand</label>
            <select 
              value={filters.brand || ''} 
              onChange={(e) => onFilterChange('brand', e.target.value)}
            >
              <option value="">All</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-range">
              <input 
                type="number" 
                placeholder="Min" 
                value={filters.min_price || ''}
                onChange={(e) => onFilterChange('min_price', e.target.value)}
              />
              <span>-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={filters.max_price || ''}
                onChange={(e) => onFilterChange('max_price', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Connection</label>
            <select 
              value={filters.is_wireless === undefined ? '' : filters.is_wireless} 
              onChange={(e) => {
                const value = e.target.value === '' 
                  ? undefined 
                  : (e.target.value === 'true');
                onFilterChange('is_wireless', value);
              }}
            >
              <option value="">All</option>
              <option value="true">Wireless</option>
              <option value="false">Wired</option>
            </select>
          </div>

          <div className="filter-group">
            <button 
              className="reset-filters" 
              onClick={onResetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;