import axios from "axios";
import type { 
    IExpense, 
    IExpensePayload, 
    IExpensesResponse, 
    IExpenseFilters, 
    IExpenseAnalytics,
    IBudget,
    IBudgetPayload,
    IBudgetsResponse,
    IBudgetFilters,
    IBudgetAnalyticsResponse,
    IExpenseCategory
} from "@/types/Expense";

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

// Expense API functions
export const getExpenses = async (token: string, filters: IExpenseFilters = {}): Promise<IExpensesResponse> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
                params.append(key, value.join(','));
            } else {
                params.append(key, String(value));
            }
        }
    });
    
    const response = await axios.get(`${BASE_URL}/expenses?${params.toString()}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return response.data;
};

export const createExpense = async (token: string, expenseData: IExpensePayload): Promise<IExpense> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const response = await axios.post(`${BASE_URL}/expenses`, expenseData, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return response.data.data;
};

export const getExpenseById = async (token: string, expenseId: string): Promise<IExpense> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const response = await axios.get(`${BASE_URL}/expenses/${expenseId}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return response.data.data;
};

export const updateExpense = async (token: string, expenseId: string, expenseData: Partial<IExpensePayload>): Promise<IExpense> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const response = await axios.patch(`${BASE_URL}/expenses/${expenseId}`, expenseData, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return response.data.data;
};

export const deleteExpense = async (token: string, expenseId: string): Promise<void> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    await axios.delete(`${BASE_URL}/expenses/${expenseId}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
};

export const approveExpense = async (token: string, expenseId: string, notes?: string): Promise<IExpense> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const response = await axios.patch(
        `${BASE_URL}/expenses/${expenseId}/approve`, 
        { status: "APPROVED", notes }, 
        {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );
    
    return response.data.data;
};

export const rejectExpense = async (token: string, expenseId: string, notes?: string): Promise<IExpense> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const response = await axios.patch(
        `${BASE_URL}/expenses/${expenseId}/reject`, 
        { status: "REJECTED", notes },
        {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );
    
    return response.data.data;
};

export const getExpenseAnalytics = async (token: string, period: string = "month"): Promise<IExpenseAnalytics> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const response = await axios.get(`${BASE_URL}/expenses/analytics?period=${period}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return response.data.data;
};

// Expense Categories API functions
export const getExpenseCategories = async (token: string): Promise<{ data: IExpenseCategory[]; message: string }> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const response = await axios.get(`${BASE_URL}/expense-categories`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return response.data;
};

export const createExpenseCategory = async (token: string, categoryData: { name: string; description?: string }): Promise<IExpenseCategory> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const response = await axios.post(`${BASE_URL}/expense-categories`, categoryData, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return response.data.data;
};

// Budget API functions
export const getBudgets = async (token: string, filters: IBudgetFilters = {}): Promise<IBudgetsResponse> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    });
    
    const response = await axios.get(`${BASE_URL}/budgets?${params.toString()}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return response.data;
};

export const createBudget = async (token: string, budgetData: IBudgetPayload): Promise<IBudget> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const response = await axios.post(`${BASE_URL}/budgets`, budgetData, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return response.data.data;
};

export const getBudgetAnalytics = async (token: string): Promise<IBudgetAnalyticsResponse> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const response = await axios.get(`${BASE_URL}/budgets/analytics`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return response.data;
};

export const updateBudget = async (token: string, budgetId: string, budgetData: Partial<IBudgetPayload>): Promise<IBudget> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const response = await axios.patch(`${BASE_URL}/budgets/${budgetId}`, budgetData, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return response.data.data;
};

export const deleteBudget = async (token: string, budgetId: string): Promise<void> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    await axios.delete(`${BASE_URL}/budgets/${budgetId}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
}; 