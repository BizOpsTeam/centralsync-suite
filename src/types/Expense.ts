export interface IExpense {
    id: string;
    ownerId: string;
    amount: number;
    categoryId: string;
    category: IExpenseCategory;
    description?: string;
    vendor?: string;
    paymentMethod?: PaymentMethod;
    status: ExpenseStatus;
    date: string;
    isRecurring: boolean;
    recurrenceType?: RecurrenceType;
    nextDueDate?: string;
    receiptUrl?: string;
    tags: string[];
    notes?: string;
    approvedBy?: string;
    approvedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface IExpenseCategory {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
}

export interface IBudget {
    id: string;
    ownerId: string;
    categoryId: string;
    category: IExpenseCategory;
    allocated: number;
    period: BudgetPeriod;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IBudgetAnalytics extends IBudget {
    spent: number;
    utilization: number;
    status: "on-track" | "warning" | "exceeded";
    remaining: number;
}

export interface IExpensePayload {
    amount: number;
    categoryId: string;
    description?: string;
    vendor?: string;
    paymentMethod?: PaymentMethod;
    status?: ExpenseStatus;
    date: string;
    isRecurring?: boolean;
    recurrenceType?: RecurrenceType;
    nextDueDate?: string;
    receiptUrl?: string;
    tags?: string[];
    notes?: string;
}

export interface IBudgetPayload {
    categoryId: string;
    allocated: number;
    period: BudgetPeriod;
    startDate: string;
    endDate: string;
    isActive?: boolean;
}

export interface IExpenseAnalytics {
    totalAmount: number;
    totalCount: number;
    pendingCount: number;
    approvedCount: number;
    categoryBreakdown: Array<{
        categoryId: string;
        _sum: { amount: number };
        _count: number;
    }>;
    paymentMethodBreakdown: Array<{
        paymentMethod: PaymentMethod;
        _sum: { amount: number };
        _count: number;
    }>;
    vendorBreakdown: Array<{
        vendor: string;
        _sum: { amount: number };
        _count: number;
    }>;
    period: {
        startDate: string;
        endDate: string;
    };
}

export interface IExpenseFilters {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    status?: ExpenseStatus;
    paymentMethod?: PaymentMethod;
    vendor?: string;
    isRecurring?: boolean;
    recurrenceType?: RecurrenceType;
    search?: string;
    tags?: string[];
}

export interface IBudgetFilters {
    isActive?: boolean;
    categoryId?: string;
    period?: BudgetPeriod;
}

export type PaymentMethod = "COMPANY_CARD" | "PERSONAL_CARD" | "CASH" | "BANK_TRANSFER" | "CHECK";
export type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED";
export type RecurrenceType = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type BudgetPeriod = "MONTHLY" | "QUARTERLY" | "YEARLY";

export interface IExpensesResponse {
    data: IExpense[];
    message: string;
}

export interface IBudgetsResponse {
    data: IBudget[];
    message: string;
}

export interface IBudgetAnalyticsResponse {
    data: IBudgetAnalytics[];
    message: string;
} 