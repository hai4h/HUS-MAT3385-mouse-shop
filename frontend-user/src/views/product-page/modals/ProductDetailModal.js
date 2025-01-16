import React, { useEffect, useState } from 'react';
import "../../../styles/desktop/ProductDetailModal.scss";
import axiosInstance from '../../../services/axiosConfig';
import { TrackProductView } from '../../../components/TrackProductView';
import ProductImage from '../../../components/ProductImage';

const NoImagePlaceholder = () => (
  <div className="no-image-placeholder">
    <svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
    <span>No Images Available</span>
  </div>
);

const ThumbnailPlaceholder = () => (
  <div className="thumbnail-placeholder">
    <svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </div>
);

const ProductDetailModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [isActive, setIsActive] = useState(false);
  const [technicalSpecs, setTechnicalSpecs] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const fetchTechnicalSpecs = async () => {
    try {
      const response = await axiosInstance.get(`/products/${product.product_id}`);
      setTechnicalSpecs(response.data);
    } catch (error) {
      console.error('Error fetching specs:', error);
      setTechnicalSpecs(product);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axiosInstance.get(`/reviews/product/${product.product_id}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews({
        user_reviews: [],
        expert_reviews: [],
        total_user_reviews: 0,
        total_expert_reviews: 0
      });
    }
  };

  useEffect(() => {
    if (isOpen && product) {
      TrackProductView(product.product_id);
      setIsActive(true);
      fetchTechnicalSpecs();
      fetchReviews();
      fetchImages(); // Thay thế phần mock images
    } else {
      setIsActive(false);
      setQuantity(1);
      setSelectedImage(null);
      setProductImages([]);
    }
  }, [isOpen, product]);
  
  const fetchImages = async () => {
    try {
      const response = await axiosInstance.get(`/images/product/${product.product_id}`);
      
      // Lưu toàn bộ ảnh thumbnails
      const thumbnails = response.data.thumbnails || [];
      
      // Nếu có ảnh chính, thêm vào đầu mảng thumbnails
      if (response.data.primary_image) {
        thumbnails.unshift(response.data.primary_image);
      }
  
      setProductImages(thumbnails);
      
      // Chọn ảnh đầu tiên làm ảnh được chọn
      setSelectedImage(thumbnails[0] || null);
    } catch (error) {
      console.error('Error fetching images:', error);
      setProductImages([]);
      setSelectedImage(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Thêm class và ngăn scroll khi modal mở
      document.body.classList.add('modal-open');
    } else {
      // Xóa class và cho phép scroll khi modal đóng
      document.body.classList.remove('modal-open');
    }
  
    // Cleanup khi component unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsActive(false);
      setTimeout(onClose, 300);
    }
  };

  const handleCloseClick = () => {
    setIsActive(false);
    setTimeout(onClose, 300);
  };

  const handleThumbnailClick = (image) => {
    // Toggle selection if clicking the same image
    if (selectedImage?.image_id === image.image_id) {
      // If clicking active thumbnail, switch back to main image
      const mainImage = productImages.find(img => img.is_primary);
      setSelectedImage(mainImage);
    } else {
      setSelectedImage(image);
    }
  };

  if (!isOpen || !product) return null;

  const renderStars = (rating, maxStars = 5) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(maxStars - Math.floor(rating));
  };

  return (
    <div 
      className={`modal-overlay ${isActive ? 'active' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="modal-content">
        <button className="close-button" onClick={handleCloseClick}>×</button>

        <div className="modal-body">
          <div className="product-details">
            <div className="image-gallery">
              <div className="main-image">
                <ProductImage
                  mainImage={selectedImage?.image_url}
                  alt={product?.name}
                />
              </div>
              <div className="thumbnails">
                {productImages.length > 0 ? (
                  productImages.map((image) => (
                    <div 
                      key={image.image_id} 
                      className={`thumbnail ${selectedImage?.image_id === image.image_id ? 'active' : ''}`}
                      onClick={() => handleThumbnailClick(image)}
                    >
                      <ProductImage
                        mainImage={image.image_url}
                        alt={`${product?.name} thumbnail`}
                      />
                    </div>
                  ))
                ) : (
                  <ThumbnailPlaceholder />
                )}
              </div>
          </div>

            <div className="product-info">
              <h2 className="product-title">{product.name}</h2>
              
              {reviews && (reviews.total_expert_reviews > 0 || reviews.total_user_reviews > 0) && (
                <div className="ratings-container">
                  {reviews.total_expert_reviews > 0 && (
                    <div className="expert-rating">
                      <span className="stars">{renderStars(reviews.expert_average)}</span>
                      <span className="rating-text">
                        ({reviews.expert_average}/5) Điểm chuyên gia
                      </span>
                    </div>
                  )}
                  {reviews.total_user_reviews > 0 && (
                    <div className="user-rating">
                      <span className="stars">{renderStars(reviews.user_average)}</span>
                      <span className="rating-text">
                        ({reviews.user_average}/5) Điểm người dùng
                      </span>
                    </div>
                  )}
                </div>
              )}

              <p className="description">{product.description || "Professional Gaming Mouse"}</p>

              <div className="price-section">
                <div className="price-display">
                  {product.hasPromotion ? (
                    <>
                      <span className="discounted-price">
                        ${product.discountedPrice.toLocaleString()}
                      </span>
                      <span className="original-price">
                        ${product.price.toLocaleString()}
                      </span>
                      <span className="discount-badge">
                        -{product.discountPercentage}%
                      </span>
                    </>
                  ) : (
                    <span className="current-price">
                      ${product.price.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="add-to-cart-section">
                  <div className="quantity-controls">
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(prev => prev + 1)}
                      disabled={quantity >= product.stock_quantity}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className="add-to-cart-button"
                    onClick={() => {
                      onAddToCart({...product, quantity});
                      handleCloseClick();
                    }}
                    disabled={product.stock_quantity === 0}
                  >
                    {product.stock_quantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                  </button>
                </div>
              </div>

              {technicalSpecs && (
                <div className="specifications">
                  <h3>Thông số kỹ thuật</h3>
                  <div className="specs-grid">
                    <div className="spec-item">
                      <span className="spec-label">Cỡ tay</span>
                      <span className="spec-value">
                        {technicalSpecs.hand_size === 'small' ? 'nhỏ (<17.5cm)' : 
                        technicalSpecs.hand_size === 'medium' ? 'vừa (18-19.5cm)' : 
                        technicalSpecs.hand_size === 'large' ? 'lớn (>20cm)' : 'Không xác định'}
                      </span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Kiểu cầm</span>
                      <span className="spec-value">{technicalSpecs.grip_style}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Hãng</span>
                      <span className="spec-value">{technicalSpecs.brand}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Kết nối</span>
                      <span className="spec-value">{technicalSpecs.is_wireless ? 'Không dây' : 'Cắm dây'}</span>
                    </div>
                    {technicalSpecs.dpi && (
                      <div className="spec-item">
                        <span className="spec-label">DPI</span>
                        <span className="spec-value">{technicalSpecs.dpi}</span>
                      </div>
                    )}
                    {technicalSpecs.weight_g && (
                      <div className="spec-item">
                        <span className="spec-label">Trọng lượng</span>
                        <span className="spec-value">{technicalSpecs.weight_g}g</span>
                      </div>
                    )}
                    {technicalSpecs.sensor_type && (
                      <div className="spec-item">
                        <span className="spec-label">Cảm biến</span>
                        <span className="spec-value">{technicalSpecs.sensor_type}</span>
                      </div>
                    )}
                    {technicalSpecs.polling_rate && (
                      <div className="spec-item">
                        <span className="spec-label">Polling Rate</span>
                        <span className="spec-value">{technicalSpecs.polling_rate}Hz</span>
                      </div>
                    )}
                    {technicalSpecs.length_mm && (
                      <div className="spec-item">
                        <span className="spec-label">Kích thước</span>
                        <span className="spec-value">
                          {technicalSpecs.length_mm} × {technicalSpecs.width_mm} × {technicalSpecs.height_mm} mm
                        </span>
                      </div>
                    )}
                    {technicalSpecs.switch_type && (
                      <div className="spec-item">
                        <span className="spec-label">Nút bấm</span>
                        <span className="spec-value">{technicalSpecs.switch_type}</span>
                      </div>
                    )}
                    {technicalSpecs.switch_durability && (
                      <div className="spec-item">
                        <span className="spec-label">Độ bền nút bấm</span>
                        <span className="spec-value">{technicalSpecs.switch_durability.toLocaleString()} Clicks</span>
                      </div>
                    )}
                    {technicalSpecs.is_wireless ? (
                      <div className="spec-item">
                        <span className="spec-label">Thời lượng pin</span>
                        <span className="spec-value">{technicalSpecs.battery_life}h</span>
                      </div>
                    ) : (
                      <div className="spec-item">
                        <span className="spec-label">Thời lượng pin</span>
                        <span className="spec-value"></span>
                      </div>
                    )}
                    {technicalSpecs.rgb_lighting !== undefined && (
                      <div className="spec-item">
                        <span className="spec-label">Đèn RGB</span>
                        <span className="spec-value">{technicalSpecs.rgb_lighting ? 'Yes' : 'No'}</span>
                      </div>
                    )}
                    {technicalSpecs.cable_type && (
                      <div className="spec-item">
                        <span className="spec-label">Dây cắm</span>
                        <span className="spec-value">{technicalSpecs.cable_type}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;