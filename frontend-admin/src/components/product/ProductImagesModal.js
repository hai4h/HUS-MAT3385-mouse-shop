import React, { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Star } from 'lucide-react';
import axiosInstance from '../../services/axiosConfig';

const ProductImagesModal = ({ product, onClose, onRefresh }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Combine media URL with image path
  const getFullImageUrl = (imagePath) => {
    // Remove leading slash if present to prevent double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${axiosInstance.defaults.baseURL}/${cleanPath}`;
  };

  useEffect(() => {
    if (product) {
      fetchImages();
    }
  }, [product]);

  const fetchImages = async () => {
    try {
      const response = await axiosInstance.get(`/images/product/${product.product_id}`);
      console.log('Full image response:', response.data);
      
      // Combine primary and thumbnails, ensuring unique images
      const allImages = [];
      if (response.data.primary_image) {
        allImages.push(response.data.primary_image);
      }
      if (response.data.thumbnails) {
        allImages.push(...response.data.thumbnails.filter(
          thumb => thumb.image_id !== response.data.primary_image?.image_id
        ));
      }

      console.log('Processed images:', allImages);
      setImages(allImages);
    } catch (error) {
      console.error('Error fetching product images:', error);
      setError('Failed to load images');
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Validate file types and sizes
    const invalidFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return !isValidType || !isValidSize;
    });

    if (invalidFiles.length > 0) {
      setError('Please upload only JPG, PNG or WebP files under 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // First image should be set as primary if no primary image exists
        const isPrimary = images.length === 0 || index === 0;
        
        return axiosInstance.post(
          `/images/product/${product.product_id}`, 
          formData, 
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            params: { 
              is_primary: isPrimary 
            }
          }
        );
      });

      await Promise.all(uploadPromises);
      
      // Refresh images after upload
      await fetchImages();
    } catch (error) {
      console.error('Error uploading images:', error);
      setError(error.response?.data?.detail || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await axiosInstance.put(`/images/${imageId}/set-primary`);
      await fetchImages();
    } catch (error) {
      console.error('Error setting primary image:', error);
      setError('Failed to set primary image');
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/images/${imageId}`);
      await fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete image');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Manage Images for {product.name}</h3>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Upload Section */}
          <div className="upload-section">
            <label className="upload-button" htmlFor="image-upload">
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <Upload className="icon" size={24} />
              <span>Upload Images</span>
            </label>
            <p className="upload-hint">
              Upload JPG, PNG or WebP files (max 5MB each)
            </p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Images Grid */}
          <div className="images-grid">
            {images.map((image) => {
              // Determine the full image URL
              const fullImageUrl = getFullImageUrl(image.image_url);
              
              console.log('Rendering image:', {
                id: image.image_id, 
                url: fullImageUrl, 
                isPrimary: image.is_primary
              });

              return (
                <div key={image.image_id} className="image-item">
                  <img 
                    src={fullImageUrl} 
                    alt={`Product ${product.name}`}
                    className="product-image"
                    onError={(e) => {
                      console.error('Image load error:', e);
                      e.target.src = '/path/to/placeholder.png'; // Optional: add a placeholder
                    }}
                  />
                  <div className="image-actions">
                    {!image.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(image.image_id)}
                        className="action-button"
                        title="Set as Primary"
                      >
                        <Star size={16} />
                      </button>
                    )}
                    {image.is_primary && (
                      <span 
                        className="primary-badge"
                        title="Primary Image"
                      >
                        <Star size={16} className="text-yellow-500" />
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(image.image_id)}
                      className="action-button delete"
                      title="Delete Image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {uploading && (
            <div className="uploading-overlay">
              <div className="spinner"></div>
              <span>Uploading...</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="close-button">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductImagesModal;