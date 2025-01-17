import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosConfig';
import { Plus, Filter } from 'lucide-react';
import { Image as ImageIcon } from 'lucide-react';

import { productService } from '../../services/productService';
import ProductList from '../../components/product/ProductList';
import ProductForm from '../../components/product/ProductForm';
import ProductFilters from '../../components/product/ProductFilters';
import ProductImagesModal from '../../components/product/ProductImagesModal';

import '../../styles/pages/products.scss';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts(filters);
      setProducts(data);
      setDisplayProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({});
  };

  // Xử lý tìm kiếm theo ID
  const handleSearchIdChange = (filteredProducts) => {
    if (filteredProducts === null) {
      // Trả về toàn bộ sản phẩm
      setDisplayProducts(products);
    } else {
      // Hiển thị sản phẩm được tìm thấy
      setDisplayProducts(filteredProducts);
    }
  };

  // Handle create/edit
  const handleSave = async (productData) => {
    try {
      console.log('Saving product data:', productData);
      
      if (selectedProduct) {
        await productService.updateProduct(selectedProduct.product_id, productData);
      } else {
        await productService.createProduct(productData);
      }
      
      fetchProducts();
      setShowForm(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error response:', err.response);
      
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.message 
        || 'Failed to save product';
      
      alert(errorMessage);
    }
  };
  
  const handleEdit = async (product) => {
    try {
      const response = await axiosInstance.get(`/products/${product.product_id}`);
      const completeProductData = response.data;
      
      setSelectedProduct(completeProductData);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const handleImageManage = (product) => {
    setSelectedProduct(product);
    setShowImageModal(true);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h1 className="products-title">Products</h1>
        <div className="header-actions">
          <button 
            className="filter-toggle-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="button-icon" />
            <span>Filters</span>
          </button>
          <button
            className="create-product-button"
            onClick={() => setShowForm(true)}
          >
            <Plus className="button-icon" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <ProductFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          products={products}
          onSearchIdChange={handleSearchIdChange}
        />
      )}

      {loading ? (
        <div className="loading-state">Loading products...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <ProductList
          products={displayProducts}
          onEdit={handleEdit}
          onRefresh={fetchProducts}
          onImageManage={handleImageManage}
        />
      )}

      {showForm && (
        <ProductForm
          product={selectedProduct}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {showImageModal && selectedProduct && (
        <ProductImagesModal
          product={selectedProduct}
          onClose={() => {
            setShowImageModal(false);
            setSelectedProduct(null);
            fetchProducts(); // Refresh list sau khi cập nhật ảnh
          }}
          onRefresh={fetchProducts}
        />
      )}
    </div>
  );
};

export default Products;