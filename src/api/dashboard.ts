import type { IDashBoardMetrics } from '@/types/Product';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

// Helper function to make a single request with retry logic and timeout
const makeRobustRequest = async (
    url: string,
    options: { headers: any; params?: any } = { headers: {} },
    retries: number = 2,
    timeout: number = 10000
): Promise<any> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await axios.get(url, {
            ...options,
            signal: controller.signal,
            timeout: timeout
        });
        clearTimeout(timeoutId);
        console.log("response", response.data)
        return { success: true, data: response.data };
    } catch (error: any) {
        clearTimeout(timeoutId);

        // If we have retries left and it's a retryable error, try again
        if (retries > 0 && (
            error.code === 'ECONNABORTED' ||
            error.code === 'ERR_NETWORK' ||
            (error.response && error.response.status >= 500)
        )) {
            console.warn(`Request failed, retrying... (${retries} retries left):`, url);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            return makeRobustRequest(url, options, retries - 1, timeout);
        }

        console.error(`Request failed after retries:`, url, error.message);
        return { success: false, error: error.message, data: null };
    }
};

export const fetchDashboardMetrics = async (accessToken: string): Promise<IDashBoardMetrics> => {
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
    };

    // Define all the requests we want to make
    const requests = [
        {
            name: 'revenueData',
            url: `${BASE_URL}/analytics/profit-loss`,
            options: { headers }
        },
        {
            name: 'salesTrendData',
            url: `${BASE_URL}/analytics/sales-over-time`,
            options: { params: { period: 'month' }, headers }
        },
        {
            name: 'customersData',
            url: `${BASE_URL}/users/customers/total`,
            options: { params: { limit: 1 }, headers }
        },
        {
            name: 'productsData',
            url: `${BASE_URL}/analytics/top-products`,
            options: { params: { limit: 1 }, headers }
        },
        {
            name: 'topProductsData',
            url: `${BASE_URL}/analytics/top-products`,
            options: { params: { limit: 5 }, headers }
        },
        {
            name: 'salesOverTimeData',
            url: `${BASE_URL}/analytics/sales-over-time`,
            options: { params: { period: 'month' }, headers }
        }
    ];

    // Make all requests in parallel but handle each one independently
    const results = await Promise.allSettled(
        requests.map(request =>
            makeRobustRequest(request.url, request.options)
                .then(result => ({ name: request.name, ...result }))
        )
    );

    // Process results and extract successful data
    const data: any = {};
    const errors: string[] = [];

    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
            data[result.value.name] = result.value.data;
        } else {
            const requestName = requests[index].name;
            const error = result.status === 'rejected' ? result.reason : result.value?.error;
            errors.push(`${requestName}: ${error}`);
            data[requestName] = null;
        }
    });

    // Log any errors for debugging
    if (errors.length > 0) {
        console.warn('Some dashboard requests failed:', errors);
    }

    // Calculate sales growth from the last two periods
    let salesGrowth = 0;
    if (data.salesTrendData?.data) {
        const salesData = data.salesTrendData.data || [];
        if (salesData.length >= 2) {
            const currentPeriod = salesData[salesData.length - 1]?.total || 0;
            const previousPeriod = salesData[salesData.length - 2]?.total || 0;
            salesGrowth = previousPeriod ? ((currentPeriod - previousPeriod) / previousPeriod) * 100 : 0;
        }
    }

    // Get total revenue from profit and loss data
    const profitLossData = data.revenueData?.data || {};
    const totalRevenue = profitLossData.revenue || 0;

         // Get active customers count from the total customers endpoint
     const activeCustomers = data.customersData?.data?.total || 0;
     console.log("customersData response:", data.customersData);
     console.log("activeCustomers calculated:", activeCustomers);

    // Get products sold (this is an approximation - adjust based on actual data)
    const productsSold = Array.isArray(data.productsData?.data) ?
        data.productsData.data.reduce((sum: number, p: any) => sum + (p.totalSold || 0), 0) : 0;

    return {
        totalRevenue,
        salesGrowth,
        activeCustomers,
        productsSold,
        topProducts: (data.topProductsData?.data || []).map((p: any) => ({
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
        salesOverTime: (data.salesOverTimeData?.data || []).map((item: any) => ({
            date: item.period || new Date().toISOString().split('T')[0],
            total: item.totalAmount || 0
        }))
    };
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
