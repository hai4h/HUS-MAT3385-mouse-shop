import React, { useState, useEffect } from 'react';
import { Sliders } from 'lucide-react';
import '../../styles/mobile/MobileProductFilters.scss';

const MobileProductFilters = ({
  filters,
  onFilterChange,
  priceRange,
  onPriceChange,
  handleStockFilter,
  brands,
  handSizes,
  gripStyles,
  userPreferences,
  onPreferenceFilterChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const toggleFilters = () => {
    if (isOpen) {
      // Start closing
      setIsOpen(false);
      
      // Remove from DOM after animation completes
      const timer = setTimeout(() => {
        setIsVisible(false);
        clearTimeout(timer);
      }, 300); // Match the CSS transition duration
    } else {
      // Open filters
      setIsVisible(true);
      
      // Slight delay to trigger CSS transition
      const timer = setTimeout(() => {
        setIsOpen(true);
        clearTimeout(timer);
      }, 10);
    }
  };

  // Optional: Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      toggleFilters();
    }
  };

  return (
    <div className="mobile-filters-container">
      <button
        className="mobile-filters-toggle"
        onClick={toggleFilters}
      >
        <Sliders size={24} />
      </button>

      {isVisible && (
        <div
          className="mobile-filters-overlay"
          onClick={handleOverlayClick}
        >
          <div
            className={`mobile-filters-sidebar ${isOpen ? 'open' : 'closed'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-filters-header">
              <h3>Bộ lọc</h3>
              <button
                className="mobile-filters-close"
                onClick={toggleFilters}
              >
                ×
              </button>
            </div>

            <div className="mobile-filters-content">
              {/* Preference Filter Section */}
              {userPreferences && Object.keys(userPreferences).length > 0 && (
                <div className="filter-section">
                  <h3>Gợi ý cho bạn</h3>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.usePreferences}
                      onChange={onPreferenceFilterChange}
                    />
                    <span className="checkbox-text">Sản phẩm phù hợp với bạn</span>
                  </label>
                </div>
              )}

              {/* Stock Filter */}
              <div className="filter-section">
                <h3>Tình trạng</h3>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={handleStockFilter}
                  />
                  <span className="checkbox-text">Còn hàng</span>
                </label>
              </div>

              {/* Price Range Filter */}
              <div className="filter-section">
                <h3>Giá (USD)</h3>
                <div className="price-inputs">
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => onPriceChange('min', e.target.value)}
                    placeholder="Min"
                    min="0"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => onPriceChange('max', e.target.value)}
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>

              {/* Hand Size Filter */}
              <div className="filter-section">
                <h3>Kích thước tay</h3>
                {handSizes.map((size) => (
                  <label key={size} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.handSize.includes(size)}
                      onChange={() => onFilterChange('handSize', size)}
                    />
                    <span className="checkbox-text">
                      {size === 'small' ? 'Nhỏ' :
                       size === 'medium' ? 'Trung bình' :
                       size === 'large' ? 'Lớn' : size}
                    </span>
                  </label>
                ))}
              </div>

              {/* Grip Style Filter */}
              <div className="filter-section">
                <h3>Kiểu cầm</h3>
                {gripStyles.map((style) => (
                  <label key={style} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.gripStyle.includes(style)}
                      onChange={() => onFilterChange('gripStyle', style)}
                    />
                    <span className="checkbox-text">
                      {style === 'palm' ? 'Palm Grip' :
                       style === 'claw' ? 'Claw Grip' :
                       style === 'fingertip' ? 'Fingertip Grip' : style}
                    </span>
                  </label>
                ))}
              </div>

              {/* Brand Filter */}
              <div className="filter-section">
                <h3>Thương hiệu</h3>
                {brands.map((brand) => (
                  <label key={brand} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.brand.includes(brand)}
                      onChange={() => onFilterChange('brand', brand)}
                    />
                    <span className="checkbox-text">{brand}</span>
                  </label>
                ))}
              </div>

              {/* Connection Type Filter */}
              <div className="filter-section">
                <h3>Kết nối</h3>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.isWireless}
                    onChange={() => onFilterChange('isWireless')}
                  />
                  <span className="checkbox-text">Không dây</span>
                </label>
              </div>
            </div>

            <div className="mobile-filters-actions">
              <button onClick={toggleFilters}>
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileProductFilters;