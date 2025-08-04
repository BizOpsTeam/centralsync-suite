export interface ISaleItem {
    productId: string;
    quantity: number;
    discount?: number;
    tax?: number;
}

export interface ISalePayload {
    customerId?: string;
    items: ISaleItem[];
    paymentMethod: "CASH" | "CARD" | "BANK_TRANSFER" | "CREDIT";
    channel?: string;
    notes?: string;
    currencyCode?: string;
    currencySymbol?: string;
    taxRate?: number;
}

export interface ISale {
    id: string;
    customerId?: string;
    customer?: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
    };
    items: ISaleItem[];
    paymentMethod: string;
    channel?: string;
    notes?: string;
    totalAmount: number;
    totalDiscount: number;
    totalTax: number;
    status: "pending" | "completed" | "cancelled";
    currencyCode?: string;
    currencySymbol?: string;
    taxRate?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ISalesResponse {
    data: ISale[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

