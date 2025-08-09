import axios from 'axios';

export interface Invoice {
    id: string;
    invoiceNumber: string;
    amountDue: number;
    dueDate: string;
    isPaid: boolean;
    status: 'UNPAID' | 'PARTIAL' | 'PAID';
    paidAmount: number;
    paidAt?: string;
    currencyCode: string;
    currencySymbol: string;
    taxRate: number;
    taxAmount: number;
    createdAt: string;
    updatedAt: string;
    sale: {
        id: string;
        totalAmount: number;
        channel: string;
        paymentMethod: string;
        status: string;
        createdAt: string;
        customer: {
            id: string;
            name: string;
            email: string;
            phone?: string;
        };
        saleItems: Array<{
            id: string;
            quantity: number;
            price: number;
            product: {
                id: string;
                name: string;
                description?: string;
                price: number;
            };
        }>;
    };
    receipt?: {
        id: string;
        receiptNumber: string;
        issuedAt: string;
        emailed: boolean;
        emailedAt?: string;
    };
}

export interface InvoiceStats {
    totalInvoices: number;
    paidInvoices: number;
    unpaidInvoices: number;
    overdueInvoices: number;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    paymentRate: number;
}

export interface InvoicesResponse {
    invoices: Invoice[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface InvoicesQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'UNPAID' | 'PARTIAL' | 'PAID';
    startDate?: string;
    endDate?: string;
}

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

export const fetchInvoices = async (
    accessToken: string, 
    params: InvoicesQueryParams = {}
): Promise<InvoicesResponse> => {
    try {
        const response = await axios.get(`${BASE_URL}/invoices`, {
            params,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
};

export const fetchInvoiceById = async (
    accessToken: string, 
    invoiceId: string
): Promise<Invoice> => {
    try {
        const response = await axios.get(`${BASE_URL}/invoices/${invoiceId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching invoice:', error);
        throw error;
    }
};

export const fetchInvoiceStats = async (accessToken: string): Promise<InvoiceStats> => {
    try {
        const response = await axios.get(`${BASE_URL}/invoices/stats`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching invoice stats:', error);
        throw error;
    }
};

export const updateInvoiceStatus = async (
    accessToken: string,
    invoiceId: string,
    status: 'UNPAID' | 'PARTIAL' | 'PAID',
    paidAmount?: number
): Promise<Invoice> => {
    try {
        const response = await axios.patch(
            `${BASE_URL}/invoices/${invoiceId}/status`,
            { status, paidAmount },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data.data;
    } catch (error) {
        console.error('Error updating invoice status:', error);
        throw error;
    }
};

export const downloadInvoicePdf = async (
    accessToken: string,
    invoiceId: string
): Promise<Blob> => {
    try {
        const response = await axios.get(`${BASE_URL}/invoices/${invoiceId}/pdf`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error('Error downloading invoice PDF:', error);
        throw error;
    }
};

export const emailInvoicePdf = async (
    accessToken: string,
    invoiceId: string,
    emailData: { email: string; subject?: string; message?: string }
): Promise<any> => {
    try {
        const response = await axios.post(
            `${BASE_URL}/invoices/${invoiceId}/email-pdf`,
            emailData,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error emailing invoice PDF:', error);
        throw error;
    }
};