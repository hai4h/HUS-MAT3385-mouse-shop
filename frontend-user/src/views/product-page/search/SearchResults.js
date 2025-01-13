import React, { useState, useEffect } from 'react';
import './SearchResults.scss'

const SearchResults = ({ 
  products, 
  searchQuery, 
  onSelectProduct, 
  onCloseSearch,
  isVisible 
}) => {
  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5); // Limit to 5 results

  if (!isVisible || !searchQuery || filteredProducts.length === 0) {
    return null;
  }

  return (
    <div className="search-results">
      {filteredProducts.map((product) => (
        <div 
          key={product.product_id} 
          className="search-result-item"
          onClick={() => {
            onSelectProduct(product);
            onCloseSearch();
          }}
        >
          <div className="product-info">
            <h4>{product.name}</h4>
            <span className="price">${product.hasPromotion ? product.discountedPrice : product.price}</span>
          </div>
          {product.hasPromotion && (
            <span className="discount-badge">-{product.discountPercentage}%</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default SearchResults;