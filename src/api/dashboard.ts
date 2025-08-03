import axios from 'axios';

interface DashboardMetrics {
  totalRevenue: number;
  salesGrowth: number;
  activeCustomers: number;
  productsSold: number;
}

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  try {
    // We'll make parallel requests to get all metrics at once
    const [revenueRes, salesRes, customersRes, productsRes] = await Promise.all([
      axios.get('/api/analytics/revenue'),
      axios.get('/api/analytics/sales-growth'),
      axios.get('/api/customers/count'),
      axios.get('/api/analytics/products-sold')
    ]);

    return {
      totalRevenue: revenueRes.data.data.totalRevenue || 0,
      salesGrowth: salesRes.data.data.growthPercentage || 0,
      activeCustomers: customersRes.data.data.count || 0,
      productsSold: productsRes.data.data.count || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    // Return default values in case of error
    return {
      totalRevenue: 0,
      salesGrowth: 0,
      activeCustomers: 0,
      productsSold: 0
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
