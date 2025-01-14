import React, { Component } from "react";
import "../../styles/App.scss";
import "../../styles/desktop/ProductPage.scss";
import "../../styles/desktop/Cart.scss";

import axiosInstance from "../../services/axiosConfig";
import ProductFilters from "./filters/ProductFilters";
import ProductDetailModal from "./modals/ProductDetailModal";
import MobileProductFilters from "../mobile/MobileProductFilters";

class ProductPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      filteredProducts: [],
      loading: true,
      error: null,
      filters: {
        inStock: false,
        handSize: [],
        gripStyle: [],
        brand: [],
        isWireless: false,
        usePreferences: false
      },
      userPreferences: null,
      priceRange: {
        min: "",
        max: ""
      },
      uniqueBrands: [],
      uniqueHandSizes: [],
      uniqueGripStyles: [],
      selectedProduct: null,
      isModalOpen: false
    };
  }

  async componentDidMount() {
    await this.fetchUserPreferences();
    try {
      // Fetch products
      const response = await axiosInstance.get('/products/');
      const products = response.data;
      
      // Fetch promotions for each product
      const productsWithPromotions = await Promise.all(
        products.map(async (product) => {
          try {
            const promotionResponse = await axiosInstance.get(`/promotions/products/${product.product_id}`);
            const promotions = promotionResponse.data;
            
            // Nếu có khuyến mãi cho sản phẩm
            if (promotions && promotions.length > 0) {
              // Tìm khuyến mãi có giảm giá cao nhất
              const bestPromotion = promotions.reduce((best, current) => {
                const currentDiscountAmount = current.discount_type === 'percentage'
                  ? (Number(product.price) * Number(current.discount_value) / 100)
                  : Number(current.discount_value);
                  
                const bestDiscountAmount = best.discount_type === 'percentage'
                  ? (Number(product.price) * Number(best.discount_value) / 100)
                  : Number(best.discount_value);
                  
                return currentDiscountAmount > bestDiscountAmount ? current : best;
              });
  
              // Tính số tiền được giảm
              let discountAmount = bestPromotion.discount_type === 'percentage'
                ? (Number(product.price) * Number(bestPromotion.discount_value) / 100)
                : Number(bestPromotion.discount_value);
  
              // Kiểm tra max_discount_amount nếu có
              if (bestPromotion.max_discount_amount) {
                discountAmount = Math.min(discountAmount, Number(bestPromotion.max_discount_amount));
              }
  
              // Tính giá sau giảm
              const finalPrice = Number(product.price) - discountAmount;
  
              return {
                ...product,
                price: Number(product.price),
                discountedPrice: Number(finalPrice.toFixed(2)),
                discountPercentage: bestPromotion.discount_type === 'percentage' 
                  ? bestPromotion.discount_value 
                  : ((discountAmount / Number(product.price)) * 100).toFixed(0),
                hasPromotion: true
              };
            }
  
            // Trường hợp không có khuyến mãi
            return {
              ...product,
              price: Number(product.price),
              hasPromotion: false
            };
          } catch (error) {
            console.error(`Error fetching promotions for product ${product.product_id}:`, error);
            return {
              ...product,
              price: Number(product.price),
              hasPromotion: false
            };
          }
        })
      );
  
      // Debug log
      console.log('Products with promotions:', productsWithPromotions);
  
      const uniqueBrands = [...new Set(products.map(p => p.brand))].sort();
      const uniqueHandSizes = [...new Set(products.map(p => p.hand_size))].sort();
      const uniqueGripStyles = [...new Set(products.map(p => p.grip_style))].sort();
  
      this.setState({
        products: productsWithPromotions,
        filteredProducts: productsWithPromotions,
        loading: false,
        uniqueBrands,
        uniqueHandSizes,
        uniqueGripStyles
      });
    } catch (error) {
      console.error('Error loading products:', error);
      this.setState({
        error: "Failed to load products",
        loading: false
      });
    }
  }

  fetchUserPreferences = async () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) return;

    try {
      const response = await axiosInstance.get(`/users/${currentUser.user_id}/preferences`);
      if (response.data && Object.keys(response.data).length > 0) {
        this.setState({ userPreferences: response.data });
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  handlePreferenceFilter = () => {
    this.setState(
      (prevState) => ({
        filters: {
          ...prevState.filters,
          usePreferences: !prevState.filters.usePreferences,
          handSize: prevState.filters.usePreferences ? [] : prevState.filters.handSize,
          gripStyle: prevState.filters.usePreferences ? [] : prevState.filters.gripStyle,
          isWireless: prevState.filters.usePreferences ? undefined : prevState.filters.isWireless,
        },
      }),
      () => {
        if (this.state.filters.usePreferences) {
          this.handlePreferenceCheckboxes();
        }
        this.applyFilters();
      }
    );
  };
  
  handlePreferenceCheckboxes = () => {
    if (this.state.filters.usePreferences && this.state.userPreferences) {
      this.handleFilterChange('handSize', this.state.userPreferences.hand_size);
      this.handleFilterChange('gripStyle', this.state.userPreferences.grip_style);
      this.handleFilterChange('isWireless', this.state.userPreferences.wireless_preferred);
    }
  };

  handleAddToCartFromModal = (productWithQuantity) => {
    this.props.onAddToCart(productWithQuantity);
  };

  handleProductClick = (product) => {
    this.setState({
      selectedProduct: product,
      isModalOpen: true
    });
  };
  
  handleCloseModal = () => {
    this.setState({
      isModalOpen: false,
      selectedProduct: null
    });
  };

  handleFilterChange = (filterType, value) => {
    this.setState(prevState => {
      let newFilters = { ...prevState.filters };

      if (filterType === 'isWireless') {
        newFilters.isWireless = !newFilters.isWireless;
      } else if (Array.isArray(newFilters[filterType])) {
        if (newFilters[filterType].includes(value)) {
          newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
        } else {
          newFilters[filterType] = [...newFilters[filterType], value];
        }
      }

      return {
        filters: newFilters
      };
    }, this.applyFilters);
  };

  handlePriceChange = (type, value) => {
    this.setState(prevState => ({
      priceRange: {
        ...prevState.priceRange,
        [type]: value
      }
    }), this.applyFilters);
  };

  handleStockFilter = () => {
    this.setState(prevState => ({
      filters: {
        ...prevState.filters,
        inStock: !prevState.filters.inStock
      }
    }), this.applyFilters);
  };

  applyFilters = () => {
    const { products, filters, priceRange, userPreferences } = this.state;
    
    let filtered = products.filter(product => {
      if (filters.inStock && product.stock_quantity <= 0) {
        return false;
      }

      if (filters.handSize.length > 0 && !filters.handSize.includes(product.hand_size)) {
        return false;
      }

      if (filters.gripStyle.length > 0 && !filters.gripStyle.includes(product.grip_style)) {
        return false;
      }

      if (filters.brand.length > 0 && !filters.brand.includes(product.brand)) {
        return false;
      }

      if (filters.isWireless && !product.is_wireless) {
        return false;
      }

      const price = parseFloat(product.price);
      if (priceRange.min && price < parseFloat(priceRange.min)) {
        return false;
      }
      if (priceRange.max && price > parseFloat(priceRange.max)) {
        return false;
      }

      return true;
    });

    this.setState({ filteredProducts: filtered });
  };

  render() {
    const { 
      filteredProducts, 
      loading, 
      error, 
      filters,
      priceRange,
      uniqueBrands,
      uniqueHandSizes,
      uniqueGripStyles,
      selectedProduct,
      isModalOpen 
    } = this.state;

    if (loading) {
      return <div className="loading">Loading products...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    return (
      <div className="product-page">
        <div className="products">
          <ProductFilters 
            filters={filters}
            onFilterChange={this.handleFilterChange}
            priceRange={priceRange}
            onPriceChange={this.handlePriceChange}
            handleStockFilter={this.handleStockFilter}
            brands={uniqueBrands}
            handSizes={uniqueHandSizes}
            gripStyles={uniqueGripStyles}
            userPreferences={this.state.userPreferences}
            onPreferenceFilterChange={this.handlePreferenceFilter}
          />

          <MobileProductFilters 
            filters={filters}
            onFilterChange={this.handleFilterChange}
            priceRange={priceRange}
            onPriceChange={this.handlePriceChange}
            handleStockFilter={this.handleStockFilter}
            brands={uniqueBrands}
            handSizes={uniqueHandSizes}
            gripStyles={uniqueGripStyles}
            userPreferences={this.state.userPreferences}
            onPreferenceFilterChange={this.handlePreferenceFilter}
          />
          
          <div className="products-grid">
          {filteredProducts.map((product) => (
            <div 
              key={product.product_id} 
              className="product-card"
              onClick={() => this.handleProductClick(product)}
            >
              <div className="product-header">
                <div className="product-name-container">
                  <h3 className="product-name">{product.name}</h3>
                </div>
              </div>

              <div className="product-image">
                {/* Placeholder for product image */}
                {product.hasPromotion && (
                  <span className="discount-badge">
                    -{product.discountPercentage}%
                  </span>
                )}
              </div>

              <div className="product-footer">
                <div className="price-container">
                  {product.hasPromotion ? (
                    <>
                      <span className="discounted-price">
                        ${product.discountedPrice.toLocaleString()}
                      </span>
                      <span className="original-price">
                        ${product.price.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="product-price">
                      ${product.price.toLocaleString()}
                    </span>
                  )}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    this.props.onAddToCart({...product, quantity: 1});
                  }}
                  disabled={product.stock_quantity === 0}
                >
                  {product.stock_quantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={this.handleCloseModal}
          onAddToCart={this.handleAddToCartFromModal}
        />
      </div>
    );
  }
}

export default ProductPage;