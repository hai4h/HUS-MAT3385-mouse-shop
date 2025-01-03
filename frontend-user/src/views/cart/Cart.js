import React from 'react';
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import axiosInstance from '../../services/axiosConfig';

const Cart = ({ cartItems, onClose, onRemoveToCart, onUpdateCart }) => {
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const params = new URLSearchParams();
      params.append('quantity', newQuantity);
      
      // Make the API call to update quantity
      const response = await axiosInstance.put(`/cart/${cartItemId}?${params.toString()}`);
      
      // Instead of reloading, call the parent's update function with new data
      if (onUpdateCart) {
        onUpdateCart(response.data);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Handle session expired
        if (window.handleSessionExpired) {
          window.handleSessionExpired();
        }
      } else {
        console.error('Error updating quantity:', error);
      }
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => (
      total + (Number(item.price) * item.quantity)
    ), 0);
  };

  return (
    <div className="cart">
      <div className="cart-header">
        <h2>
          <ShoppingCartIcon className="cart-icon" />
          Sản phẩm: {cartItems.length}
          <button className="close-cart" onClick={onClose}>×</button>
        </h2>
      </div>

      {cartItems.length === 0 ? (
        <p className="empty-cart">Giỏ hàng của bạn đang trống</p>
      ) : (
        <ul className="cart-items">
          {cartItems.map((item) => (
            <li key={item.cart_item_id} className="cart-item">
              {/* Placeholder image container */}
              <div className="item-image">
                <img src="/api/placeholder/60/60" alt={item.name} />
              </div>
              
              <div className="item-details">
                <span className="item-name">{item.name}</span>
                
                <div className="price-quantity-container">
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateQuantity(item.cart_item_id, item.quantity - 1);
                      }}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateQuantity(item.cart_item_id, item.quantity + 1);
                      }}
                    >
                      +
                    </button>
                  </div>
                  
                  <span className="item-price">
                    ${(Number(item.price) * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              <button 
                className="remove-item" 
                onClick={() => onRemoveToCart(item.cart_item_id)}
              >
                <svg width="30" height="30" viewBox="0 0 12 12">
                  <path 
                    d="M3 3L9 9M9 3L3 9" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="cart-bottom">
        <div className="checkout-form">
          <div className="discount-form">
            <input type="text" placeholder="Nhập mã giảm giá" />
            <button>Áp dụng</button>
          </div>
          <div className="cart-summary">
            <div className="subtotal">
              <span>Tổng cộng:</span>
              <span>${calculateTotal().toLocaleString()}</span>
            </div>
            <button className="checkout-btn">Tiến hành thanh toán</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;