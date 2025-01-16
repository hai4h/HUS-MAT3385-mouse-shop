import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import ProductImage from './ProductImage';

const ProductList = ({ products, onEdit, onRefresh }) => {
  return (
    <div className="products-list">
      <table className="products-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Brand</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.product_id}>
              <td>{product.product_id}</td>
              <td className="product-image-cell">
                <ProductImage 
                  mainImage={product.main_image || `/static/products/${product.product_id}/main.jpg`}
                  alt={product.name}
                  className="w-16 h-16"
                />
              </td>
              <td>{product.name}</td>
              <td>{product.brand}</td>
              <td>${product.price}</td>
              <td>{product.stock_quantity}</td>
              <td>
                <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button 
                    className="action-button view"
                    onClick={() => console.log('View', product)}
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="action-button edit"
                    onClick={() => onEdit(product)}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="action-button delete"
                    onClick={() => {
                      // TODO: Add delete confirmation
                      console.log('Delete', product);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;