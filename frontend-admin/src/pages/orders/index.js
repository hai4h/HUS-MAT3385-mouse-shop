import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../../services/axiosConfig';
import { ShoppingBag, Edit, Search, X } from 'lucide-react';
import OrderDetailModal from '../../components/orders/OrderDetailModal';
import OrderStatusModal from '../../components/orders/OrderStatusModal';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/pages/orders.scss';

const getStatusColor = (status) => {
  const colors = {
    'pending': 'bg-yellow-200 text-yellow-800',
    'processing': 'bg-blue-200 text-blue-800',
    'shipped': 'bg-purple-200 text-purple-800',
    'delivered': 'bg-green-200 text-green-800',
    'cancelled': 'bg-red-200 text-red-800'
  };
  return colors[status] || 'bg-gray-200 text-gray-800';
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/orders/');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axiosInstance.patch(`/orders/${orderId}/status`, {
        status: newStatus
      });
      // Refresh orders list
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleEditStatus = (order) => {
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };

  // Filtering logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        searchTerm === '' || 
        order.order_id.toString().includes(searchTerm) ||
        order.products.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user_id.toString().includes(searchTerm);

      const matchesStatus = 
        statusFilter === '' || 
        order.status === statusFilter;

      const matchesDateRange = 
        (!startDate || new Date(order.order_date) >= startDate) &&
        (!endDate || new Date(order.order_date) <= endDate);

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [orders, searchTerm, statusFilter, startDate, endDate]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateRange([null, null]);
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="loading-state">Loading orders...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="orders-page">
      {/* Filters Section */}
      <div className="filters mb-4 flex flex-wrap gap-4 items-center">
        {/* Search Input */}
        <div className="flex items-center border rounded">
          <Search className="ml-2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search orders..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 w-64 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <select 
          value={statusFilter} 
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2">
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => {
              setDateRange(update);
              setCurrentPage(1);
            }}
            placeholderText="Select Date Range"
            className="p-2 border rounded w-64"
          />
        </div>

        {/* Reset Filters Button */}
        {(searchTerm || statusFilter || startDate || endDate) && (
          <button 
            onClick={resetFilters}
            className="p-2 bg-red-500 text-white rounded flex items-center"
          >
            <X size={20} className="mr-2" /> Reset Filters
          </button>
        )}
      </div>

      {/* Orders List */}
      <div className="orders-list">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Products</th>
              <th className="p-3 text-left">Total Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order) => (
              <tr key={order.order_id} className="border-b hover:bg-gray-50">
                <td className="p-3">#{order.order_id}</td>
                <td className="p-3">{order.user_id}</td>
                <td className="p-3">{order.products}</td>
                <td className="p-3">${Number(order.total_amount).toLocaleString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(order.order_date).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewDetail(order)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <ShoppingBag size={16} />
                    </button>
                    <button 
                      onClick={() => handleEditStatus(order)}
                      className="text-green-500 hover:text-green-700"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredOrders.length > itemsPerPage && (
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2">
              {Array.from({ 
                length: Math.ceil(filteredOrders.length / itemsPerPage) 
              }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`px-4 py-2 border rounded ${
                    currentPage === index + 1 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-blue-500'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredOrders.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No orders found matching your filters.
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedOrder && isStatusModalOpen && (
        <OrderStatusModal
          order={selectedOrder}
          onClose={() => {
            setSelectedOrder(null);
            setIsStatusModalOpen(false);
          }}
          onSave={handleStatusUpdate}
        />
      )}

      {selectedOrder && isDetailModalOpen && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setSelectedOrder(null);
            setIsDetailModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Orders;