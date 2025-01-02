import React, { Component } from "react";
import "../../views/App.scss";
import "./ProductPage.scss";
import Product from "./Product";
import axiosInstance from "../../services/axiosConfig";

class ProductPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      loading: true,
      error: null
    };
    this.hasLoaded = false;
  }

  async componentDidMount() {
    if (this.hasLoaded) return;
    
    try {
      const response = await axiosInstance.get('/products/');
      this.hasLoaded = true;
      this.setState({
        products: response.data,
        loading: false
      });
    } catch (error) {
      this.setState({
        error: "Failed to load products",
        loading: false
      });
    }
  }

  render() {
    const { products, loading, error } = this.state;

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
            <div className="sidebar-filters">
              <div className="text-with-icon">
                <svg
                role="presentation"
                fill="none"
                focusable="false"
                strokeWidth="2"
                width="20"
                height="14"
                className="icon-subdued icon icon-filter"
                viewBox="0 0 20 14"
              >
                <path
                  d="M1 2C0.447715 2 0 2.44772 0 3C0 3.55228 0.447715 4 1 4V2ZM1 4H5V2H1V4Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M1 10C0.447715 10 0 10.4477 0 11C0 11.5523 0.447715 12 1 12V10ZM1 12H11V10H1V12Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M10 2H9V4H10V2ZM19 4C19.5523 4 20 3.55228 20 3C20 2.44772 19.5523 2 19 2V4ZM10 4H19V2H10V4Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M16 10H15V12H16V10ZM19 12C19.5523 12 20 11.5523 20 11C20 10.4477 19.5523 10 19 10V12ZM16 12H19V10H16V12Z"
                  fill="currentColor"
                ></path>
                <circle cx="7" cy="3" r="2" stroke="currentColor"></circle>
                <circle cx="13" cy="11" r="2" stroke="currentColor"></circle>
              </svg>
                Bộ lọc
              </div>
              <div>
                <label>
                  <input type="checkbox" />
                  Tiêu chí 1
                </label>
              </div>
              <div>
                <label>
                  <input type="checkbox" />
                  Tiêu chí 2
                </label>
              </div>
          </div>
          
          <div className="products-grid">
          {products.map((product) => (
            <div key={product.product_id} className="product-card">
              <div className="product-name-container">
                <h3 className="product-name">{product.name}</h3>
              </div>
              <div className="product-image">
                {/* Placeholder cho ảnh sản phẩm */}
              </div>
              <div className="product-footer">
                <p className="product-price">
                  ${product.price.toLocaleString()}
                </p>
                <button onClick={() => this.props.onAddToCart(product)}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    );
  }
}

export default ProductPage;