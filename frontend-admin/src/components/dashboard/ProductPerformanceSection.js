import React from 'react';
import { Eye, ShoppingCart, ArrowUp, ArrowDown } from 'lucide-react';

const ProductPerformanceSection = ({ title, products, isPositive }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="space-y-4">
      {products.map((product) => (
        <div 
          key={product.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div>
            <h4 className="font-medium text-gray-900">{product.name}</h4>
            <div className="flex items-center mt-1 space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 mr-1" />
                <span>{product.views} lượt xem</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <ShoppingCart className="w-4 h-4 mr-1" />
                <span>{product.orders} đơn hàng</span>
              </div>
            </div>
          </div>
          <div className={`flex items-center ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            {isPositive ? (
              <ArrowUp className="w-5 h-5" />
            ) : (
              <ArrowDown className="w-5 h-5" />
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ProductPerformanceSection;