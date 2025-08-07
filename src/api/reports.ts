import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

// Types for reports
export interface ProfitLossData {
  revenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  breakdown: {
    salesCount: number;
    saleItemsCount: number;
    expenseCount: number;
  };
}

export interface SalesReportData {
  period: string;
  totalAmount: number;
}

export interface TopProductData {
  productId: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
  timesSold: number;
  product: any;
}

export interface TopCustomerData {
  customerId: string;
  name: string;
  email: string;
  totalSpent: number;
  salesCount: number;
  customer: any;
}

export interface ExpenseAnalyticsData {
  totalAmount: number;
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  categoryBreakdown: any[];
  paymentMethodBreakdown: any[];
  vendorBreakdown: any[];
}

export interface BudgetAnalyticsData {
  id: string;
  categoryId: string;
  allocated: number;
  spent: number;
  utilization: number;
  status: "on-track" | "warning" | "exceeded";
  remaining: number;
  category: any;
}

export interface ForecastData {
  period: string;
  predictedRevenue?: number;
  forecast?: number;
}

export interface CustomerStatementData {
  customer: {
    id: string;
    name: string;
    email: string;
  };
  statement: Array<{
    date: Date;
    type: string;
    amount: number;
    description: string;
  }>;
  totalSales: number;
  totalPayments: number;
  outstandingBalance: number;
}

// API functions
export const getProfitLoss = async (accessToken: string , startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const response = await axios.get(`${BASE_URL}/analytics/profit-loss?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.data.data as ProfitLossData;
};

export const getRevenueForecast = async (
    accessToken: string,
  period: string = "month",
  horizon: number = 3,
  startDate?: string,
  endDate?: string,
  method: string = "auto"
) => {
  const params = new URLSearchParams({
    period,
    horizon: horizon.toString(),
    method,
  });
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const response = await axios.get(`${BASE_URL}/analytics/revenue-forecast?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.data.data as { history: ForecastData[]; forecast: ForecastData[] };
};

export const getTopProducts = async (
  accessToken: string,
  limit: number = 10,
  period: string = "month",
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    period,
  });
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const response = await axios.get(`${BASE_URL}/analytics/top-products?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.data.data as TopProductData[];
};

export const getTopCustomers = async (
  accessToken: string,
  limit: number = 10,
  period: string = "month",
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    period,
  });
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const response = await axios.get(`${BASE_URL}/analytics/top-customers?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.data.data as TopCustomerData[];
};

export const getSalesOverTime = async (
  accessToken: string,
  period: string = "month",
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams({ period });
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const response = await axios.get(`${BASE_URL}/analytics/sales-over-time?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.data.data as SalesReportData[];
};

export const getSalesByChannel = async (
  accessToken: string,
  period: string = "month",
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams({ period });
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const response = await axios.get(`${BASE_URL}/analytics/sales-by-channel?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.data.data as SalesReportData[];
};

export const getSalesByPaymentMethod = async (
  accessToken: string,
  period: string = "month",
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams({ period });
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const response = await axios.get(`${BASE_URL}/analytics/sales-by-payment-method?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.data.data as SalesReportData[];
};

export const getAverageOrderValue = async (
  accessToken: string,
  period: string = "month",
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams({ period });
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const response = await axios.get(`${BASE_URL}/analytics/average-order-value?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.data.data as {
    averageOrderValue: number;
    totalOrders: number;
    totalAmount: number;
  };
};

export const getDiscountImpact = async (
  accessToken: string,
  period: string = "month",
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams({ period });
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const response = await axios.get(`${BASE_URL}/analytics/discount-impact?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.data.data as {
    totalDiscount: number;
    averageDiscount: number;
    discountRate: number;
    totalAmount: number;
    totalOrders: number;
  };
};

export const getStockouts = async (
  accessToken: string,
  period: string = "month",
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams({ period });
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const response = await axios.get(`${BASE_URL}/analytics/stockouts?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.data.data as any[];
};

export const getSlowMovingInventory = async (
  accessToken: string,
  period: string = "month",
  threshold: number = 5,
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams({
    period,
    threshold: threshold.toString(),
  });
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const response = await axios.get(`${BASE_URL}/analytics/slow-moving-inventory?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.data.data as any[];
};

export const getSalesForecast = async (
  accessToken: string,
  period: string = "month",
  horizon: number = 3,
  method: string = "auto"
) => {
  const params = new URLSearchParams({
    period,
    horizon: horizon.toString(),
    method,
  });
  
  const response = await axios.get(`${BASE_URL}/analytics/sales-forecast?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.data.data as ForecastData[];
};

export const getExpenseAnalytics = async (accessToken: string, period: string = "month") => {
  const response = await axios.get(`${BASE_URL}/expenses/analytics?period=${period}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.data.data as ExpenseAnalyticsData;
};

export const getBudgetAnalytics = async (accessToken: string) => {
  const response = await axios.get(`${BASE_URL}/budgets/analytics`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.data.data as BudgetAnalyticsData[];
};

// Customer Statement
export const getCustomerStatement = async (
  accessToken: string,
  customerId: string,
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const response = await axios.get(`${BASE_URL}/users/customer-statement/${customerId}?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.data.data as CustomerStatementData;
};

// PDF Download functions
export const downloadInvoicePdf = async (accessToken: string, invoiceId: string) => {
  const response = await axios.get(`${BASE_URL}/invoices/${invoiceId}/pdf`, {
    responseType: "blob",
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response;
};

export const downloadReceiptPdf = async (accessToken: string, receiptId: string) => {
  const response = await axios.get(`${BASE_URL}/receipts/${receiptId}/pdf`, {
    responseType: "blob",
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response;
};

// Helper function to download PDF
export const downloadPdf = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}; 