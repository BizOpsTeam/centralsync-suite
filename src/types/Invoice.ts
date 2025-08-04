export interface IInvoice {
    id: string;
    invoiceNumber: string;
    saleId: string;
    amountDue: number;
    paidAmount: number;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
    status: "UNPAID" | "PARTIAL" | "PAID";
    currencyCode: string;
    currencySymbol: string;
    taxRate: number;
    taxAmount: number;
    sale?: {
        customer?: {
            name: string;
            email?: string;
        };
        paymentMethod?: string;
        notes?: string;
    };
}

export interface IInvoicesResponse {
    data: IInvoice[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}