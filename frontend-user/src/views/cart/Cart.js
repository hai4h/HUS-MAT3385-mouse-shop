import React, { useState, useEffect } from 'react';
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import axiosInstance from '../../services/axiosConfig';
import CheckoutModal from './checkout/CheckoutModal';
import ProductImage from '../../components/ProductImage';

const Cart = ({ cartItems, onClose, onRemoveToCart, onUpdateCart, user, onFetchCart }) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [itemsWithPromotions, setItemsWithPromotions] = useState([]);
  const [couponRestrictions, setCouponRestrictions] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [productImages, setProductImages] = useState({});
  
  useEffect(() => {
    const fetchPromotionsAndProducts = async () => {
      try {
        const itemPromises = cartItems.map(async (item) => {
          const productResponse = await axiosInstance.get(`/products/${item.product_id}`);
          const productDetails = productResponse.data;

          const promotionResponse = await axiosInstance.get(`/promotions/products/${item.product_id}`);
          const promotions = promotionResponse.data;
          
          if (promotions && promotions.length > 0) {
            const bestPromotion = promotions.reduce((best, current) => {
              const currentDiscountAmount = current.discount_type === 'percentage'
                ? (Number(item.price) * Number(current.discount_value) / 100)
                : Number(current.discount_value);
                
              const bestDiscountAmount = best.discount_type === 'percentage'
                ? (Number(item.price) * Number(best.discount_value) / 100)
                : Number(best.discount_value);
                
              return currentDiscountAmount > bestDiscountAmount ? current : best;
            });

            let discountAmount = bestPromotion.discount_type === 'percentage'
              ? (Number(item.price) * Number(bestPromotion.discount_value) / 100)
              : Number(bestPromotion.discount_value);

            if (bestPromotion.max_discount_amount) {
              discountAmount = Math.min(discountAmount, Number(bestPromotion.max_discount_amount));
            }

            const finalPrice = Number(item.price) - discountAmount;

            return {
              ...item,
              ...productDetails,
              hasPromotion: true,
              discountedPrice: finalPrice,
              originalPrice: Number(item.price),
              discountPercentage: bestPromotion.discount_type === 'percentage' 
                ? bestPromotion.discount_value 
                : ((discountAmount / Number(item.price)) * 100).toFixed(0)
            };
          }
          
          return {
            ...item,
            ...productDetails,
            hasPromotion: false,
            originalPrice: Number(item.price),
            discountedPrice: Number(item.price)
          };
        });

        const itemsWithDetails = await Promise.all(itemPromises);
        setItemsWithPromotions(itemsWithDetails);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (cartItems.length > 0) {
      fetchPromotionsAndProducts();
    } else {
      setItemsWithPromotions([]);
    }
  }, [cartItems]);

  useEffect(() => {
    const fetchProductImages = async () => {
      const imagePromises = cartItems.map(async (item) => {
        try {
          const response = await axiosInstance.get(`/images/product/${item.product_id}`);
          return {
            [item.product_id]: {
              main: response.data.primary_image?.image_url || null,
              thumbnails: response.data.thumbnails || []
            }
          };
        } catch (error) {
          console.error(`Error fetching images for product ${item.product_id}:`, error);
          return { [item.product_id]: { main: null, thumbnails: [] } };
        }
      });

      const imageResults = await Promise.all(imagePromises);
      const imagesMap = imageResults.reduce((acc, curr) => ({...acc, ...curr}), {});
      setProductImages(imagesMap);
    };

    if (cartItems.length > 0) {
      fetchProductImages();
    }
  }, [cartItems]);

  useEffect(() => {
    // Reset error and coupon input when cart opens/closes
    setCouponError('');
    setCouponCode('');
  }, [onClose]); // Dependency on onClose means this runs when cart opens/closes

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const params = new URLSearchParams();
      params.append('quantity', newQuantity);
      const response = await axiosInstance.put(`/cart/${cartItemId}?${params.toString()}`);
      if (onUpdateCart) {
        onUpdateCart(response.data);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        if (window.handleSessionExpired) {
          window.handleSessionExpired();
        }
      } else {
        console.error('Error updating quantity:', error);
      }
    }
  };

  const isProductEligibleForCoupon = (item) => {
    // Nếu không có coupon được áp dụng, return false
    if (!appliedCoupon) {
      console.log('No coupon applied');
      return false;
    }

    // Nếu sản phẩm không tồn tại hoặc không có brand, return false
    if (!item || !item.brand) {
      console.log('Invalid product or missing brand');
      return false;
    }

    // Nếu không có restrictions, cho phép áp dụng cho tất cả sản phẩm
    if (!couponRestrictions || !Array.isArray(couponRestrictions)) {
      console.log('No valid restrictions, coupon applies to all products');
      return true;
    }

    // Nếu có restrictions, kiểm tra điều kiện
    if (couponRestrictions.length > 0) {
      const isEligible = couponRestrictions.some(restriction => {
        if (restriction.category === 'brand') {
          const brandMatch = item.brand.toLowerCase() === restriction.category_value.toLowerCase();
          console.log(`Brand check: ${item.brand} vs ${restriction.category_value} = ${brandMatch}`);
          return brandMatch;
        }
        return false;
      });

      console.log(`Eligibility result for ${item.name}: ${isEligible}`);
      return isEligible;
    }

    // Nếu có restrictions nhưng rỗng, cho phép áp dụng cho tất cả
    return true;
  };

  const calculateItemFinalPrice = (item) => {
    let finalPrice = item.hasPromotion ? item.discountedPrice : item.originalPrice;
    
    if (appliedCoupon && isProductEligibleForCoupon(item)) {
      let couponDiscount = 0;
      if (appliedCoupon.discount_type === 'percentage') {
        couponDiscount = finalPrice * (Number(appliedCoupon.discount_value) / 100);
      } else {
        couponDiscount = Number(appliedCoupon.discount_value);
      }

      if (appliedCoupon.max_discount_amount) {
        couponDiscount = Math.min(couponDiscount, Number(appliedCoupon.max_discount_amount));
      }

      if ((finalPrice * item.quantity) >= Number(appliedCoupon.min_order_value)) {
        finalPrice = Math.max(0, finalPrice - couponDiscount);
      }
    }
    
    return finalPrice;
  };

  const calculateOriginalTotal = () => {
    return itemsWithPromotions.reduce((total, item) => {
      return total + (item.originalPrice * item.quantity);
    }, 0);
  };

  const calculatePromotionDiscount = () => {
    return itemsWithPromotions.reduce((total, item) => {
      if (item.hasPromotion) {
        const regularPrice = item.originalPrice * item.quantity;
        const promotionPrice = item.discountedPrice * item.quantity;
        return total + (regularPrice - promotionPrice);
      }
      return total;
    }, 0);
  };

  const calculateCouponDiscount = () => {
    if (!appliedCoupon) return 0;

    return itemsWithPromotions.reduce((total, item) => {
      if (!isProductEligibleForCoupon(item)) return total;

      const basePrice = item.hasPromotion ? item.discountedPrice : item.originalPrice;
      if ((basePrice * item.quantity) < Number(appliedCoupon.min_order_value)) {
        return total;
      }

      let couponDiscount = 0;
      if (appliedCoupon.discount_type === 'percentage') {
        couponDiscount = basePrice * (Number(appliedCoupon.discount_value) / 100);
      } else {
        couponDiscount = Number(appliedCoupon.discount_value);
      }

      if (appliedCoupon.max_discount_amount) {
        couponDiscount = Math.min(couponDiscount, Number(appliedCoupon.max_discount_amount));
      }

      return total + (couponDiscount * item.quantity);
    }, 0);
  };

  const calculateFinalTotal = () => {
    const originalTotal = calculateOriginalTotal();
    const promotionDiscount = calculatePromotionDiscount();
    const couponDiscount = calculateCouponDiscount();
    return Math.max(0, originalTotal - promotionDiscount - couponDiscount);
  };

  const handleClose = () => {
    // Clear states before closing
    setCouponError('');
    setCouponCode('');
    document.body.classList.remove('cart-open');
    onClose();
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      // Reset states
      setAppliedCoupon(null);
      setCouponRestrictions(null);
      setCouponError('');

      // Verify coupon
      const couponResponse = await axiosInstance.post(`/coupons/verify?code=${encodeURIComponent(couponCode)}`);
      
      if (!couponResponse.data || !couponResponse.data.valid) {
        setCouponError('Mã giảm giá không hợp lệ');
        return;
      }
      
      const coupon = couponResponse.data.coupon;
      console.log('Verified coupon:', coupon);

      try {
        // Get restrictions
        const restrictionsResponse = await axiosInstance.get(`/coupons/coupon_category_restrictions/${coupon.coupon_id}`);
        const restrictions = restrictionsResponse.data;
        console.log('Retrieved restrictions:', restrictions);

        // Set coupon data
        setAppliedCoupon(coupon);
        setCouponRestrictions(Array.isArray(restrictions) ? restrictions : []);
        setCouponCode('');

      } catch (restrictionsError) {
        console.error('Error fetching restrictions:', restrictionsError);
        setCouponError('Không thể áp dụng mã giảm giá');
        setAppliedCoupon(null);
        setCouponRestrictions(null);
      }

    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError(error.response?.data?.detail || 'Mã giảm giá không hợp lệ');
      setAppliedCoupon(null);
      setCouponRestrictions(null);
    }
  };

  const handleCheckoutClick = () => {
    if (itemsWithPromotions.length === 0) {
      alert('Giỏ hàng của bạn đang trống');
      return;
    }
    onClose(); // Đóng cart sidebar trước
    setIsCheckoutModalOpen(true);
  };

  const handleCheckoutClose = () => {
    setIsCheckoutModalOpen(false);
    onFetchCart(); // Fetch lại dữ liệu giỏ hàng
  };

  return (
    <>
      <div className="cart">
        <div className="cart-header">
          <h2>
            <ShoppingCartIcon className="cart-icon" />
            Sản phẩm: {cartItems.length}
            <button className="close-cart" onClick={handleClose}>×</button>
          </h2>
        </div>

        {itemsWithPromotions.length === 0 ? (
          <p className="empty-cart">Giỏ hàng của bạn đang trống</p>
        ) : (
          <ul className="cart-items">
            {itemsWithPromotions.map((item) => {
              const finalPrice = calculateItemFinalPrice(item);
              const isCouponEligible = isProductEligibleForCoupon(item);
              const productImage = productImages[item.product_id]?.main;
              
              return (
                <li key={item.cart_item_id} className="cart-item">
                  <div className="item-image">
                    <ProductImage 
                      mainImage={productImage}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    
                    <div className="price-quantity-container">
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="item-price-container">
                        {(item.hasPromotion || (appliedCoupon && isCouponEligible)) && (
                          <del className="item-price original">
                            ${(item.originalPrice * item.quantity).toFixed(2)}
                          </del>
                        )}
                        <span className="item-price final">
                          ${(finalPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {appliedCoupon && isCouponEligible && (
                      <div className="coupon-status">
                        <span className="eligible-text">
                          Mã giảm giá được áp dụng 
                          {appliedCoupon.discount_type === 'percentage' && (
                            <span className="discount-value"> (-{appliedCoupon.discount_value}%)</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <button 
                    className="remove-item"
                    onClick={() => onRemoveToCart(item.cart_item_id)}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="cart-bottom">
          <div className="checkout-form">
            <div className="discount-form">
              <input
                type="text"
                placeholder="Nhập mã giảm giá"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button onClick={handleApplyCoupon}>Áp dụng</button>
            </div>
            
            {couponError && (
              <div className="coupon-error">{couponError}</div>
            )}

            <div className="cart-summary">
              <div className="subtotal">
                <span>Tạm tính:</span>
                <span>${calculateOriginalTotal().toFixed(2)}</span>
              </div>

              {calculatePromotionDiscount() > 0 && (
                <div className="discount promotion">
                  <span>Giảm giá khuyến mãi:</span>
                  <span>-${calculatePromotionDiscount().toFixed(2)}</span>
                </div>
              )}

              {calculateCouponDiscount() > 0 && (
                <div className="discount coupon">
                  <span>Giảm giá mã giảm giá:</span>
                  <span>-${calculateCouponDiscount().toFixed(2)}</span>
                </div>
              )}

              <div className="final-total">
                <span>Tổng cộng:</span>
                <span>${calculateFinalTotal().toFixed(2)}</span>
              </div>

              <button 
                  className="checkout-btn"
                  onClick={handleCheckoutClick}
                  disabled={itemsWithPromotions.length === 0}
                >
                  Tiến hành thanh toán
                </button>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={handleCheckoutClose}
        cartItems={itemsWithPromotions}
        appliedCoupon={appliedCoupon}
        originalTotal={calculateOriginalTotal()}
        promotionDiscount={calculatePromotionDiscount()}
        couponDiscount={calculateCouponDiscount()}
        finalTotal={calculateFinalTotal()}
        user={user}
      />
    </>
  );
};

export default Cart;