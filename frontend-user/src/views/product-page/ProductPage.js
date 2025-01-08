import React, { Component } from "react";
import "../../views/App.scss";
import "./ProductPage.scss";
import "../cart/Cart.scss";

import axiosInstance from "../../services/axiosConfig";
import ProductFilters from "./filters/ProductFilters";
import ProductDetailModal from "./modals/ProductDetailModal";

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
        isWireless: false
      },
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
    try {
      const response = await axiosInstance.get('/products/');
      const products = response.data;
      
      const uniqueBrands = [...new Set(products.map(p => p.brand))].sort();
      const uniqueHandSizes = [...new Set(products.map(p => p.hand_size))].sort();
      const uniqueGripStyles = [...new Set(products.map(p => p.grip_style))].sort();

      this.setState({
        products,
        filteredProducts: products,
        loading: false,
        uniqueBrands,
        uniqueHandSizes,
        uniqueGripStyles
      });
    } catch (error) {
      this.setState({
        error: "Failed to load products",
        loading: false
      });
    }
  }

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
    const { products, filters, priceRange } = this.state;

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
        <header>
          <h1>Sản phẩm Chuột</h1>
        </header>
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
          />
          
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div 
                key={product.product_id} 
                className="product-card"
                onClick={() => this.handleProductClick(product)}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-name-container">
                  <h3 className="product-name">{product.name}</h3>
                </div>
                <div className="product-image">
                  {/* Product image placeholder */}
                </div>
                <div className="product-footer">
                  <p className="product-price">
                    ${product.price.toLocaleString()}
                  </p>
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