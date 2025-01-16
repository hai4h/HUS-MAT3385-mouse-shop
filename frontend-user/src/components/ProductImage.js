import React, { useState } from 'react';

const ProductImage = ({ mainImage, thumbnails = [], alt, className = '' }) => {
  const [error, setError] = useState(false);
  const baseUrl = 'https://mou-x-test.azurewebsites.net'; // API URL

  const handleImageError = () => {
    setError(true);
  };

  if (error || !mainImage) {
    return
  }

  return (
    <div className={className}>
      <img
        src={`${baseUrl}${mainImage}`}
        alt={alt}
        className="w-full h-full object-contain"
        onError={handleImageError}
      />
      {thumbnails?.length > 0 && (
        <div className="thumbnails mt-4 grid grid-cols-4 gap-2">
          {thumbnails.map((thumb, index) => (
            <img
              key={index}
              src={`${baseUrl}${thumb.image_url}`}
              alt={`${alt} thumbnail ${index + 1}`}
              className="w-full h-full object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
              onError={(e) => e.target.style.display = 'none'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImage;