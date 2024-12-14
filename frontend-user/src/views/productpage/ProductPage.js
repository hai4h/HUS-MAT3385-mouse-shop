import React, { Component } from "react";
import "../../views/App.scss";
import "./ProductPage.scss";
import Product from "./Product";

class ProductPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [
        {
          id: "1",
          name: "Logitech MX Master 3",
          description: "Chuột không dây cao cấp với thiết kế công thái học, hỗ trợ nhiều thiết bị.",
          price: "2,500,000",
          stock_quantity: 15,
          hand_size: "L",
          grip_style: "Palm",
          brand: "Logitech",
        },
        {
          id: "2",
          name: "Razer DeathAdder V2",
          description: "Chuột gaming với độ chính xác cao, cảm biến quang học 20,000 DPI.",
          price: "1,800,000",
          stock_quantity: 20,
          hand_size: "M",
          grip_style: "Claw",
          brand: "Razer",
        },
        {
          id: "3",
          name: "SteelSeries Rival 600",
          description: "Chuột gaming với cảm biến kép, tùy chỉnh trọng lượng linh hoạt.",
          price: "2,200,000",
          stock_quantity: 10,
          hand_size: "L",
          grip_style: "Fingertip",
          brand: "SteelSeries",
        },
      ],
    };
  }
  render() {
    const productCards = [...this.state.products];
    // Thêm các product trống nếu mảng có ít hơn 4 phần tử
    while (productCards.length < 4) {
      productCards.push(null);
    }
    return (
      <div className="product-page">
        <header>
          <h1>Mice</h1>
        </header>
        <div className="products">
          <div className="sidebar-filters">
            <div class="text-with-icon">
              <svg
                role="presentation"
                fill="none"
                focusable="false"
                stroke-width="2"
                width="20"
                height="14"
                class="icon-subdued icon icon-filter"
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
              Filters
            </div>
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
          {productCards.map((product, index) => (
            <div key={index} className="product-card">
              {product ? (
                <>
                  <p>{product.name}</p>
                  <p>Giá: {product.price} VND</p>
                  <button onClick={() => this.props.onAddToCart(product)}>
                    Add to Cart
                  </button>
                </>
              ) : (
                // Hiển thị card trống
                <p className="placeholder">Trống</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default ProductPage;
