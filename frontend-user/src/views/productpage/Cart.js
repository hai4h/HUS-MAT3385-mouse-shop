// src/views/productpage/Cart.js
import React, { Component } from "react";
import "./ProductPage";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

class Cart extends Component {
  calculateTotal = () => {
    const { cartItems } = this.props;
    return cartItems.reduce((total, item) => {
      const price = Number(item.price.replace(/,/g, "")); 
      return total + price * item.quantity;
    }, 0);
  };

  render() {
    const { cartItems, onClose, onRemoveToCart } = this.props;
    return (
      <div className="cart">
        <div className="cart-header">
          <h2>
            <span>
              <ShoppingCartIcon style={{ color: "red" }} />
            </span>
            Sản phẩm: {cartItems.length}
            <button className="close-cart" onClick={onClose}>
              ×
            </button>
          </h2>
        </div>

        {cartItems.length === 0 ? (
          <p className="empty-cart">Giỏ hàng của bạn đang trống</p>
        ) : (
          <ul className="cart-items">
            {cartItems.map((item, index) => (
              <li key={index} className="cart-item">
                <span>
                  {item.name} - (x{item.quantity})
                </span>
                <button
                  className="remove-item"
                  onClick={() => onRemoveToCart(item)}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="checkout-form">
          <div className="discount-form">
            <input type="text" placeholder="Nhập mã giảm giá" />
            <button>Áp dụng</button>
          </div>

          <div className="cart-summary">
            <div className="subtotal">
              <span>Tổng cộng:</span>
              <span>{this.calculateTotal().toLocaleString()} VND</span>
            </div>
            <button className="checkout-btn">Tiến hành thanh toán</button>
          </div>
        </div>
      </div>
    );
  }
}

export default Cart;