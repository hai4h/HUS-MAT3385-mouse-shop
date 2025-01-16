import React, { useState, useEffect } from 'react';
import { fetchDashboardStats } from '../../services/dashboardService';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import ProductPerformanceSection from '../../components/dashboard/ProductPerformanceSection';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchDashboardStats();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded">
        {error}
      </div>
    );
  }

  const { stats, charts, performance } = dashboardData;

  return (
    <div className="p-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng doanh thu"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change={stats.changes.revenue}
        />
        <StatCard
          title="Tổng đơn hàng"
          value={stats.totalOrders}
          change={stats.changes.orders}
        />
        <StatCard
          title="Số người dùng"
          value={stats.totalUsers}
          change={stats.changes.users}
        />
        <StatCard
          title="Giá trị đơn TB"
          value={`$${stats.averageOrderValue.toLocaleString()}`}
          change={stats.changes.avgOrder}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Doanh thu theo thời gian"
          data={charts.revenue}
          dataKey="value"
          stroke="#8884d8"
        />
        <ChartCard
          title="Đơn hàng theo thời gian"
          data={charts.orders}
          dataKey="value"
          stroke="#82ca9d"
        />
      </div>

      {/* Product Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductPerformanceSection
          title="Sản phẩm thể hiện tốt"
          products={performance.topProducts}
          isPositive={true}
        />
        <ProductPerformanceSection
          title="Sản phẩm thể hiện kém"
          products={performance.underperformingProducts}
          isPositive={false}
        />
      </div>
    </div>
  );
};

export default Dashboard;