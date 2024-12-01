import React from "react";
import "../views/App.scss";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Component giỏ hàng - nhận vào danh sách sản phẩm và hàm đóng giỏ hàng
const Cart = ({ cartItems, onClose }) => {
  return (
    <div className="cart">
      {/* Phần tiêu đề giỏ hàng */}
      <div className="cart-header">
        <h2>
        <span><ShoppingCartIcon style={{ color: "red" }}></ShoppingCartIcon></span> Sản phẩm: {cartItems.length}
          <button className="close-cart" onClick={onClose}>×</button>
        </h2>
      </div>
      
      {/* Hiển thị thông báo khi giỏ hàng trống */}
      {cartItems.length === 0 ? (
        <p className="empty-cart">Giỏ hàng của bạn đang trống</p>
      ) : (
        // Danh sách các sản phẩm trong giỏ hàng
        <ul className="cart-items">
          {cartItems.map((item, index) => (
            <li key={index} className="cart-item">
              <span>Sản phẩm {item + 1}</span>
              {/* Nút xóa sản phẩm (chức năng sẽ được bổ sung sau) */}
              <button className="remove-item">Xóa</button>
            </li>
          ))}
        </ul>
      )}
      
      {/* Form nhập mã giảm giá */}
      <div className="discount-form">
        <input type="text" placeholder="Nhập mã giảm giá" />
        <button>Áp dụng</button>
      </div>
      
      {/* Phần tổng kết giỏ hàng */}
      <div className="cart-summary">
        <div className="subtotal">
          <span>Tổng cộng:</span>
          <span>0 đ</span>
        </div>
        <button className="checkout-btn">Tiến hành thanh toán</button>
      </div>
    </div>
  );
};

export default Cart;