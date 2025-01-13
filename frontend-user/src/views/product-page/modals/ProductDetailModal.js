import React, { useEffect, useState } from 'react';
import "./ProductDetailModal.scss";
import axiosInstance from '../../../services/axiosConfig';

const NoImagePlaceholder = () => (
  <div className="no-image-placeholder">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
    <span>No Images Available</span>
  </div>
);

const ThumbnailPlaceholder = () => (
  <div className="thumbnail-placeholder">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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

  const fetchImages = async () => {
    try {
      const response = await axiosInstance.get(`/images/product/${product.product_id}`);
      setProductImages(response.data.thumbnails || []);
      setSelectedImage(response.data.primary_image || response.data.thumbnails[0] || null);
    } catch (error) {
      console.error('Error fetching images:', error);
      setProductImages([]);
      setSelectedImage(null);
    }
  };

  useEffect(() => {
    if (isOpen && product) {
      setIsActive(true);
      fetchTechnicalSpecs();
      fetchReviews();
      fetchImages();
    } else {
      setIsActive(false);
      setQuantity(1); // Reset quantity when modal closes
    }
  }, [isOpen, product]);

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
    setSelectedImage(image);
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
                {selectedImage ? (
                  <img 
                    src={selectedImage.image_url} 
                    alt={product.name}
                  />
                ) : (
                  <NoImagePlaceholder />
                )}
              </div>
              <div className="thumbnails">
                {productImages.length > 0 ? (
                  productImages.map((image) => (
                    <div 
                      key={image.image_id} 
                      className={`thumbnail ${selectedImage?.image_id === image.image_id ? 'active' : ''}`}
                      onClick={() => handleThumbnailClick(image)}
                    >
                      <img 
                        src={image.image_url} 
                        alt={`${product.name} thumbnail`}
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
                        ({reviews.expert_average}/5) Expert Rating
                      </span>
                    </div>
                  )}
                  {reviews.total_user_reviews > 0 && (
                    <div className="user-rating">
                      <span className="stars">{renderStars(reviews.user_average)}</span>
                      <span className="rating-text">
                        ({reviews.user_average}/5) User Rating
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
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>

              {technicalSpecs && (
                <div className="specifications">
                  <h3>Technical Specifications</h3>
                  <div className="specs-grid">
                    <div className="spec-item">
                      <span className="spec-label">Cỡ tay</span>
                      <span className="spec-value">{technicalSpecs.hand_size}</span>
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
                    {technicalSpecs.battery_life && (
                      <div className="spec-item">
                        <span className="spec-label">Thời lượng pin</span>
                        <span className="spec-value">{technicalSpecs.battery_life}h</span>
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