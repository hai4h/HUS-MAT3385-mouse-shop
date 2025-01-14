import React from 'react';
import "../../../styles/desktop/ProductFilters.scss"

const ProductFilters = ({ 
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
  return (
    <div className="sidebar-filters">
      <div className="text-with-icon">
        <svg
          role="presentation"
          fill="none"
          focusable="false"
          strokeWidth="2"
          width="20"
          height="14"
          className="icon-subdued"
          viewBox="0 0 20 14"
        >
          <path
            d="M1 2C0.447715 2 0 2.44772 0 3C0 3.55228 0.447715 4 1 4V2ZM1 4H5V2H1V4Z"
            fill="currentColor"
          />
          <path
            d="M1 10C0.447715 10 0 10.4477 0 11C0 11.5523 0.447715 12 1 12V10ZM1 12H11V10H1V12Z"
            fill="currentColor"
          />
          <path
            d="M10 2H9V4H10V2ZM19 4C19.5523 4 20 3.55228 20 3C20 2.44772 19.5523 2 19 2V4ZM10 4H19V2H10V4Z"
            fill="currentColor"
          />
          <path
            d="M16 10H15V12H16V10ZM19 12C19.5523 12 20 11.5523 20 11C20 10.4477 19.5523 10 19 10V12ZM16 12H19V10H16V12Z"
            fill="currentColor"
          />
          <circle cx="7" cy="3" r="2" stroke="currentColor" />
          <circle cx="13" cy="11" r="2" stroke="currentColor" />
        </svg>
        Bộ lọc
      </div>

      {/* Preference-based filter section - Only show if user has preferences */}
      {userPreferences && Object.keys(userPreferences).length > 0 && (
        <div className="filter-section">
          <h3>Gợi ý cho bạn</h3>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.usePreferences}
              onChange={() => onPreferenceFilterChange()}
            />
            <span className="checkbox-text">Sản phẩm phù hợp với bạn</span>
          </label>
          {filters.usePreferences && (
            <div className="preferences-summary">
              <div className="preference-item">
                <span className="label">Cỡ tay:</span>
                <span className="value">
                  {userPreferences.hand_size === 'small' ? 'Nhỏ' :
                   userPreferences.hand_size === 'medium' ? 'Trung bình' :
                   userPreferences.hand_size === 'large' ? 'Lớn' : ''}
                </span>
              </div>
              <div className="preference-item">
                <span className="label">Kiểu cầm:</span>
                <span className="value">
                  {userPreferences.grip_style === 'palm' ? 'Palm' :
                   userPreferences.grip_style === 'claw' ? 'Claw' :
                   userPreferences.grip_style === 'fingertip' ? 'Fingertip' : ''}
                </span>
              </div>
              <div className="preference-item">
                <span className="label">Kết nối:</span>
                <span className="value">
                  {userPreferences.wireless_preferred ? 'Không dây' : 'Có dây'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stock Filter */}
      <div className="filter-section">
        <h3>Tình trạng</h3>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={() => handleStockFilter()}
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
  );
};

export default ProductFilters;