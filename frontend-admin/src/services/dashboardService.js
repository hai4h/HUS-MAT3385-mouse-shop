import axiosInstance from './axiosConfig';

export const fetchDashboardStats = async () => {
  try {
    // Fetch all required data in parallel
    const [usersRes, ordersRes, productsRes, viewsRes] = await Promise.all([
      axiosInstance.get('/users/'),
      axiosInstance.get('/orders/'),
      axiosInstance.get('/products/'),
      axiosInstance.get('/page-views/stats') // API mới trả về thống kê tổng hợp
    ]);

    const orders = ordersRes.data;
    const viewsData = viewsRes.data;

    // Tính toán revenue và average order value
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

    // Tính toán month-over-month changes
    const { currentMonth, lastMonth } = getMonthlyOrders(orders);

    // Tính revenue change
    const currentMonthRevenue = currentMonth.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const lastMonthRevenue = lastMonth.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const revenueChange = lastMonthRevenue ? 
      ((currentMonthRevenue / lastMonthRevenue) - 1) * 100 : 0;

    // Tính orders change
    const ordersChange = lastMonth.length ? 
      ((currentMonth.length / lastMonth.length) - 1) * 100 : 0;

    // Sử dụng daily trends từ API mới cho biểu đồ
    const { daily_trends, summary } = viewsData;

    return {
      stats: {
        totalUsers: usersRes.data.length,
        totalProducts: productsRes.data.length,
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
        averageOrderValue: avgOrderValue,
        totalViews: summary.total_views, // Thêm từ API mới
        uniqueViews: summary.total_unique_views, // Thêm từ API mới
        changes: {
          revenue: revenueChange,
          orders: ordersChange,
          views: calculateViewsChange(daily_trends), // Tính từ daily_trends
          avgOrder: calculateAvgOrderChange(orders)
        }
      },
      charts: {
        revenue: getMonthlyData(orders, 'total_amount'),
        orders: getMonthlyData(orders, 'count'),
        views: formatDailyTrends(daily_trends) // Thêm biểu đồ views
      },
      performance: {
        topProducts: formatProductStats(viewsData.product_stats.slice(0, 5)), // Lấy top 5 từ API mới
        underperformingProducts: formatProductStats(
          [...viewsData.product_stats]
            .sort((a, b) => a.total_views - b.total_views)
            .slice(0, 5)
        )
      },
      // Thêm phân tích chi tiết từ API mới
      analysis: {
        hourlyDistribution: viewsData.hourly_distribution,
        sessionAnalysis: viewsData.session_analysis
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// Helper Functions

const getMonthlyOrders = (orders) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentYearOrders = orders.filter(order => {
    const orderDate = new Date(order.order_date);
    return orderDate.getFullYear() === currentYear;
  });

  return {
    currentMonth: currentYearOrders.filter(
      order => new Date(order.order_date).getMonth() === currentMonth
    ),
    lastMonth: currentYearOrders.filter(
      order => new Date(order.order_date).getMonth() === currentMonth - 1
    )
  };
};

const formatDailyTrends = (trends) => {
  return trends.map(trend => ({
    date: trend.view_date,
    value: trend.total_views,
    uniqueValue: trend.unique_views
  }));
};

const formatProductStats = (products) => {
  return products.map(product => ({
    id: product.product_id,
    name: product.product_name,
    views: product.total_views,
    uniqueViews: product.unique_views,
    viewPercentage: product.view_percentage,
    lastViewed: product.last_viewed_date
  }));
};

const calculateViewsChange = (trends) => {
  if (trends.length < 2) return 0;
  
  const currentPeriod = trends.slice(0, 15);
  const previousPeriod = trends.slice(15, 30);

  const currentViews = currentPeriod.reduce((sum, day) => sum + day.total_views, 0);
  const previousViews = previousPeriod.reduce((sum, day) => sum + day.total_views, 0);

  return previousViews ? ((currentViews / previousViews) - 1) * 100 : 0;
};

const calculateAvgOrderChange = (orders) => {
  const { currentMonth, lastMonth } = getMonthlyOrders(orders);
  
  const currentAvg = currentMonth.reduce((sum, order) => sum + Number(order.total_amount), 0) / currentMonth.length;
  const lastAvg = lastMonth.reduce((sum, order) => sum + Number(order.total_amount), 0) / lastMonth.length;

  return lastAvg ? ((currentAvg / lastAvg) - 1) * 100 : 0;
};

// Giữ lại hàm getMonthlyData cho backward compatibility
const getMonthlyData = (orders, type) => {
  const monthlyData = {};
  
  orders.forEach(order => {
    const date = new Date(order.order_date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = type === 'count' ? 0 : 0;
    }
    
    if (type === 'count') {
      monthlyData[monthYear] += 1;
    } else {
      monthlyData[monthYear] += Number(order.total_amount);
    }
  });

  return Object.entries(monthlyData)
    .map(([date, value]) => ({
      date,
      value: type === 'count' ? value : Number(value.toFixed(2))
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};