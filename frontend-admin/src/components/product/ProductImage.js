import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosConfig';

const ProductImage = ({ product, alt, className = '' }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProductImage = async () => {
      try {
        const response = await axiosInstance.get(`/images/product/${product.product_id}`);
        const primaryImage = response.data.primary_image;
        const thumbnails = response.data.thumbnails || [];
        
        // Utility function to construct full URL
        const getFullImageUrl = (imagePath) => {
          // Remove leading slash if present
          const cleanPath = imagePath.replace(/^\//, '');
          
          // Use the base URL from axiosInstance configuration
          return `${axiosInstance.defaults.baseURL}/${cleanPath}`;
        };
    
        if (primaryImage) {
          setImageUrl(getFullImageUrl(primaryImage.image_url));
        } else if (thumbnails.length > 0) {
          const firstThumb = thumbnails[0];
          setImageUrl(getFullImageUrl(firstThumb.image_url));
        } else {
          // Fallback to static path
          setImageUrl(`/static/products/${product.product_id}/main.jpg`);
        }
      } catch (fetchError) {
        console.error('Error fetching product images:', fetchError);
        // Fallback to default image on error
        setImageUrl(`/static/products/${product.product_id}/main.jpg`);
      }
    };

    if (product && product.product_id) {
      fetchProductImage();
    }
  }, [product]);

  const handleImageError = () => {
    // If image fails to load, set error state
    setError(true);
  };

  if (error || !imageUrl) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <span className="text-gray-400">No Image</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`${className} object-contain`}
      onError={handleImageError}
    />
  );
};

export default ProductImage;