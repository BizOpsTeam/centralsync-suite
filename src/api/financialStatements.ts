import axios from 'axios';


const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

console.log('Financial API BASE_URL:', BASE_URL);

// Types for Financial Statements
export interface FinancialPeriod {
    startDate: string;
    endDate: string;
    periodName: string;
    periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
}

export interface CompanyInfo {
    name: string;
    address: string;
    phone: string;
    email: string;
    currency: string;
    currencySymbol: string;
}

export interface RevenueBreakdown {
    category: string;
    amount: number;
    percentage: number;
    itemCount: number;
}

export interface COGSBreakdown {
    category: string;
    amount: number;
    percentage: number;
    quantity: number;
}

export interface ExpenseBreakdown {
    category: string;
    amount: number;
    percentage: number;
    itemCount: number;
}

export interface FinancialRatios {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    returnOnSales: number;
    expenseRatio: number;
}

export interface ProfitLossStatement {
    companyInfo: CompanyInfo;
    period: FinancialPeriod;
    revenue: {
        totalSales: number;
        salesTax: number;
        discounts: number;
        netRevenue: number;
        breakdown: RevenueBreakdown[];
        salesCount: number;
    };
    costOfGoodsSold: {
        totalCOGS: number;
        breakdown: COGSBreakdown[];
        averageCostPerSale: number;
    };
    grossProfit: number;
    operatingExpenses: {
        totalExpenses: number;
        breakdown: ExpenseBreakdown[];
        averageExpensePerMonth: number;
    };
    operatingIncome: number;
    otherIncome: number;
    otherExpenses: number;
    netIncome: number;
    ratios: FinancialRatios;
    comparison: {
        previousPeriod?: {
            netRevenue: number;
            grossProfit: number;
            operatingIncome: number;
            netIncome: number;
        };
        growth: {
            revenueGrowth: number;
            grossProfitGrowth: number;
            netIncomeGrowth: number;
        };
    };
}

export interface CashFlowStatement {
    companyInfo: CompanyInfo;
    period: FinancialPeriod;
    operatingActivities: {
        cashFromSales: number;
        cashFromCustomers: number;
        cashToSuppliers: number;
        cashForExpenses: number;
        netOperatingCash: number;
    };
    investingActivities: {
        equipmentPurchases: number;
        assetSales: number;
        netInvestingCash: number;
    };
    financingActivities: {
        ownerInvestments: number;
        loanPayments: number;
        netFinancingCash: number;
    };
    netCashFlow: number;
    beginningCash: number;
    endingCash: number;
}

export interface BalanceSheet {
    companyInfo: CompanyInfo;
    asOfDate: string;
    assets: {
        currentAssets: {
            cash: number;
            accountsReceivable: number;
            inventory: number;
            otherCurrentAssets: number;
            totalCurrentAssets: number;
        };
        fixedAssets: {
            equipment: number;
            accumulatedDepreciation: number;
            netFixedAssets: number;
        };
        totalAssets: number;
    };
    liabilities: {
        currentLiabilities: {
            accountsPayable: number;
            accrualExpenses: number;
            otherCurrentLiabilities: number;
            totalCurrentLiabilities: number;
        };
        longTermLiabilities: {
            loans: number;
            otherLongTerm: number;
            totalLongTermLiabilities: number;
        };
        totalLiabilities: number;
    };
    equity: {
        ownerEquity: number;
        retainedEarnings: number;
        totalEquity: number;
    };
    totalLiabilitiesAndEquity: number;
}

export interface FinancialSummary {
    currentYear: number;
    profitLoss: {
        revenue: number;
        grossProfit: number;
        operatingIncome: number;
        netIncome: number;
        grossMargin: number;
        netMargin: number;
    };
    cashFlow: {
        operatingCash: number;
        investingCash: number;
        financingCash: number;
        netCashFlow: number;
    };
    balanceSheet: {
        totalAssets: number;
        totalLiabilities: number;
        totalEquity: number;
        currentRatio: number;
    };
    growth: {
        revenueGrowth: number;
        grossProfitGrowth: number;
        netIncomeGrowth: number;
    };
}

export interface LoanApplicationPackage {
    profitLossStatements: ProfitLossStatement[];
    cashFlowStatements: CashFlowStatement[];
    balanceSheets: BalanceSheet[];
}

const API_BASE_URL = `${BASE_URL}/financial-statements`;

// API Functions
export const generateProfitLossStatement = async (
    accessToken: string,
    startDate: string,
    endDate: string,
    periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM' = 'YEARLY'
): Promise<ProfitLossStatement> => {
    try {
        console.log('Calling profit-loss API:', `${API_BASE_URL}/profit-loss`, { startDate, endDate, periodType });
        const response = await axios.get(`${API_BASE_URL}/profit-loss`, {
            params: { startDate, endDate, periodType },
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('Profit-loss API response:', response);
        return response.data.data;
    } catch (error) {
        console.error('Profit-loss API error:', error);
        throw error;
    }
};

export const generateCashFlowStatement = async (
    accessToken: string,
    startDate: string,
    endDate: string,
    periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM' = 'YEARLY'
): Promise<CashFlowStatement> => {
    try {
        console.log('Calling cash-flow API:', `${API_BASE_URL}/cash-flow`, { startDate, endDate, periodType });
        const response = await axios.get(`${API_BASE_URL}/cash-flow`, {
            params: { startDate, endDate, periodType },
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data.data;
    } catch (error) {
        console.error('Cash-flow API error:', error);
        throw error;
    }
};

export const generateBalanceSheet = async (
    accessToken: string,
    asOfDate: string
): Promise<BalanceSheet> => {
    const response = await axios.get(`${API_BASE_URL}/balance-sheet`, {
        params: { asOfDate },
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data.data;
};

export const getFinancialSummary = async (
    accessToken: string
): Promise<FinancialSummary> => {
    const response = await axios.get(`${API_BASE_URL}/summary`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data.data;
};

export const downloadProfitLossPdf = async (
    accessToken: string,
    startDate: string,
    endDate: string,
    periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM' = 'YEARLY'
): Promise<Blob> => {
    const response = await axios.get(`${API_BASE_URL}/profit-loss/download`, {
        params: { startDate, endDate, periodType },
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: 'blob',
    });
    return response.data;
};

export const downloadCashFlowPdf = async (
    accessToken: string,
    startDate: string,
    endDate: string,
    periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM' = 'YEARLY'
): Promise<Blob> => {
    const response = await axios.get(`${API_BASE_URL}/cash-flow/download`, {
        params: { startDate, endDate, periodType },
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: 'blob',
    });
    return response.data;
};

export const downloadBalanceSheetPdf = async (
    accessToken: string,
    asOfDate: string
): Promise<Blob> => {
    const response = await axios.get(`${API_BASE_URL}/balance-sheet/download`, {
        params: { asOfDate },
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: 'blob',
    });
    return response.data;
};

export const generateLoanApplicationPackage = async (
    accessToken: string,
    periods: Array<{
        startDate: string;
        endDate: string;
        periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
    }>
): Promise<LoanApplicationPackage> => {
    const response = await axios.post(
        `${API_BASE_URL}/loan-application-package`,
        { periods },
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data.data;
};

// Helper functions for period management
export const createPeriod = (
    startDate: Date,
    endDate: Date,
    periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'
): { startDate: string; endDate: string; periodType: string } => {
    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        periodType,
    };
};

export const getCurrentYearPeriod = (): { startDate: string; endDate: string; periodType: string } => {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // January 1st
    const endDate = new Date(currentYear, 11, 31); // December 31st
    return createPeriod(startDate, endDate, 'YEARLY');
};

export const getPreviousYearPeriod = (): { startDate: string; endDate: string; periodType: string } => {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear - 1, 0, 1); // January 1st of previous year
    const endDate = new Date(currentYear - 1, 11, 31); // December 31st of previous year
    return createPeriod(startDate, endDate, 'YEARLY');
};

export const getCurrentQuarterPeriod = (): { startDate: string; endDate: string; periodType: string } => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
    const startDate = new Date(currentYear, quarterStartMonth, 1);
    const endDate = new Date(currentYear, quarterStartMonth + 3, 0); // Last day of quarter
    
    return createPeriod(startDate, endDate, 'QUARTERLY');
};

export const getCurrentMonthPeriod = (): { startDate: string; endDate: string; periodType: string } => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of month
    
    return createPeriod(startDate, endDate, 'MONTHLY');
};

// Format currency helper
export const formatCurrency = (amount: number, currencySymbol: string = '$'): string => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    })}`;
};

// Format percentage helper
export const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(1)}%`;
};
