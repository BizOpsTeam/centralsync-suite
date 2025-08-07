import type { IDashBoardMetrics } from '@/types/Product';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

export const fetchDashboardMetrics = async (accessToken: string): Promise<IDashBoardMetrics> => {
  try {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    };

    // Make parallel requests to get all metrics at once
    const [
      revenueData,
      salesTrendData,
      customersData,
      productsData,
      topProductsData,
      salesOverTimeData
    ] = await Promise.all([
      // Get total revenue from profit and loss
      axios.get(`${BASE_URL}/analytics/profit-loss`, { 
        headers 
      }),
      
      // Get sales trend for growth calculation
      axios.get(`${BASE_URL}/analytics/sales-over-time`, { 
        params: { period: 'month' },
        headers 
      }),
      
      // Get active customers count
      axios.get(`${BASE_URL}/analytics/top-customers`, { 
        params: { limit: 1 },
        headers 
      }),
      
      // Get products count (this might need adjustment based on actual endpoint)
      axios.get(`${BASE_URL}/analytics/top-products`, { 
        params: { limit: 1 },
        headers 
      }),
      
      // Get top products
      axios.get(`${BASE_URL}/analytics/top-products`, { 
        params: { limit: 5 },
        headers 
      }),
      
      // Get sales over time for the chart
      axios.get(`${BASE_URL}/analytics/sales-over-time`, { 
        params: { period: 'month' },
        headers 
      })
    ]);

    // Calculate sales growth from the last two periods
    const salesData = salesTrendData.data?.data || [];
    let salesGrowth = 0;
    if (salesData.length >= 2) {
      const currentPeriod = salesData[salesData.length - 1]?.total || 0;
      const previousPeriod = salesData[salesData.length - 2]?.total || 0;
      salesGrowth = previousPeriod ? ((currentPeriod - previousPeriod) / previousPeriod) * 100 : 0;
    }

    // Get total revenue from profit and loss data
    const profitLossData = revenueData.data?.data || {};
    const totalRevenue = profitLossData.revenue || 0;
    console.log("profitLossData", profitLossData)
    console.log("salesOverTimeData", salesOverTimeData)
    
    // Get active customers count (assuming top-customers returns an array)
    const activeCustomers = Array.isArray(customersData.data?.data) ? 
      customersData.data.data.length : 0;
      
    // Get products sold (this is an approximation - adjust based on actual data)
    const productsSold = Array.isArray(productsData.data?.data) ? 
      productsData.data.data.reduce((sum: number, p: any) => sum + (p.totalSold || 0), 0) : 0;

    return {
      totalRevenue,
      salesGrowth,
      activeCustomers,
      productsSold,
      topProducts: (topProductsData.data?.data || []).map((p: any) => ({
        product: {
          id: p.productId || p.id || '',
          name: p.name || 'Unknown Product',
          price: p.price || 0,
          // Add other required product fields with defaults
          description: p.description || '',
          sku: p.sku || '',
          stock: p.stock || 0,
          category: p.category || 'Uncategorized',
          image: p.image || ''
        },
        totalSold: p.totalSold || p.quantity || 0,
        totalRevenue: p.totalRevenue || (p.price || 0) * (p.quantity || 0),
        timesSold: p.timesSold || 1
      })),
      salesOverTime: (salesOverTimeData.data?.data || []).map((item: any) => ({
        date: item.period || new Date().toISOString().split('T')[0],
        total: item.totalAmount || 0
      }))
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    // Return default values in case of error
    return {
      totalRevenue: 0,
      salesGrowth: 0,
      activeCustomers: 0,
      productsSold: 0,
      topProducts: [],
      salesOverTime: []
    };
  }
};

// Format currency with proper localization
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// Format percentage with 1 decimal place
const formatPercent = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

// Format large numbers with K/M/B suffixes
const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const dashboardService = {
  fetchDashboardMetrics,
  formatter,
  formatPercent,
  formatNumber
};
