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

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [technicalSpecs, setTechnicalSpecs] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchTechnicalSpecs = async () => {
    try {
      const response = await axiosInstance.get(`/products/${product.product_id}`);
      setTechnicalSpecs(response.data);
    } catch (error) {
      console.error('Error fetching specs:', error);
      // Fallback to basic product info
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
      const response = await axiosInstance.get(`/products/${product.product_id}/images`);
      const primaryImage = response.data.find(img => img.is_primary);
      setProductImages(response.data);
      setSelectedImage(primaryImage || response.data[0] || null);
    } catch (error) {
      console.error('Error fetching images:', error);
      setProductImages([]);
      setSelectedImage(null);
    }
  };

  useEffect(() => {
    if (isOpen && product) {
      fetchTechnicalSpecs();
      fetchReviews();
      fetchImages();
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsActive(true), 10);
    } else {
      setIsActive(false);
      setTechnicalSpecs(null);
      setReviews(null);
      setProductImages([]);
      setSelectedImage(null);
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

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

  const thumbnails = productImages.filter(img => !img.is_primary);

  // Create a display table for specs
  const specsTable = [
    { label: "Hand Size", value: product.hand_size },
    { label: "Grip Style", value: product.grip_style },
    { label: "Brand", value: product.brand },
    { label: "Connection Type", value: product.is_wireless ? "Wireless" : "Wired" },
    { label: "DPI", value: technicalSpecs?.dpi },
    { label: "Weight", value: technicalSpecs?.weight_g ? `${technicalSpecs.weight_g}g` : null },
    { label: "Sensor", value: technicalSpecs?.sensor_type },
    { label: "Polling Rate", value: technicalSpecs?.polling_rate ? `${technicalSpecs.polling_rate}Hz` : null },
    { 
      label: "Dimensions", 
      value: technicalSpecs?.length_mm ? 
        `${technicalSpecs.length_mm} x ${technicalSpecs.width_mm} x ${technicalSpecs.height_mm} mm` : null 
    },
    { label: "Switch Type", value: technicalSpecs?.switch_type },
    { 
      label: "Switch Durability", 
      value: technicalSpecs?.switch_durability ? 
        `${technicalSpecs.switch_durability.toLocaleString()} clicks` : null 
    },
    { 
      label: "Battery Life", 
      value: technicalSpecs?.battery_life ? `${technicalSpecs.battery_life}h` : null 
    },
    { 
      label: "RGB Lighting", 
      value: technicalSpecs?.rgb_lighting !== undefined ? 
        (technicalSpecs.rgb_lighting ? 'Yes' : 'No') : null 
    },
    { label: "Cable Type", value: technicalSpecs?.cable_type }
  ];

  return (
    <div 
      className={`modal-overlay ${isActive ? 'active' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="modal-content">
        <button className="close-button" onClick={handleCloseClick}>×</button>

        <div className="modal-body">
          <div className="product-details">
            {/* Left side - Images */}
            <div className="image-gallery">
              <div className="main-image">
                {selectedImage ? (
                  <img 
                    src={selectedImage.image_url} 
                    alt={product.name}
                    className="product-image"
                  />
                ) : (
                  <NoImagePlaceholder />
                )}
              </div>
              <div className="thumbnails">
                {thumbnails.length > 0 ? (
                  thumbnails.map((image) => (
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

            {/* Right side - Details */}
            <div className="product-info">
              <h2 className="product-title">{product.name}</h2>
              
              {reviews && (reviews.total_expert_reviews > 0 || reviews.total_user_reviews > 0) && (
                <div className="ratings-container">
                  {reviews.total_expert_reviews > 0 && (
                    <div className="expert-rating">
                      <span className="stars expert">
                        {'★'.repeat(Math.floor(reviews.expert_average))}
                        {'☆'.repeat(5 - Math.floor(reviews.expert_average))}
                      </span>
                      <span className="rating-text">
                        ({reviews.expert_average}/5) Expert Rating
                      </span>
                    </div>
                  )}
                  {reviews.total_user_reviews > 0 && (
                    <div className="user-rating">
                      <span className="stars user">
                        {'★'.repeat(Math.floor(reviews.user_average))}
                        {'☆'.repeat(5 - Math.floor(reviews.user_average))}
                      </span>
                      <span className="rating-text">
                        ({reviews.user_average}/5) User Rating
                      </span>
                    </div>
                  )}
                </div>
              )}

              <p className="description">{product.description}</p>

              <div className="specifications">
                <h3>Technical Specifications</h3>
                <div className="specs-grid">
                  {specsTable.map((spec, index) => 
                    spec.value ? (  // Only render if value exists
                      <div key={index} className="spec-item">
                        <span className="spec-label">{spec.label}</span>
                        <span className="spec-value capitalize">{spec.value}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>

              <div className="price-section">
                <div className="price-quantity">
                  <span className="price">${product.price}</span>
                  <div className="quantity-controls">
                    <button>-</button>
                    <span>1</span>
                    <button>+</button>
                  </div>
                </div>

                <button 
                  className="add-to-cart"
                  disabled={product.stock_quantity === 0}
                >
                  {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;