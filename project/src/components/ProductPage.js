import React, { Component } from "react";
import "../views/App.scss";

class ProductPage extends Component {
  render() {
    return (
      <div className="product-page">
        <div className="sidebar-filters">
          <h2>Filters</h2>
          <div>
            <label>
              <input type="checkbox" />
              Filter 1
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" />
              Filter 2
            </label>
          </div>
        </div>
        <div className="content"></div>
        <header>
          <h1>Mice</h1>
        </header>
        <div className="products">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="product-card">
              <p>Product {index + 1}</p>
              <button onClick={() => this.props.onAddToCart(index)}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default ProductPage;
