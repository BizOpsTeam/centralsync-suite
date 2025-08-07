import axios from "axios";
import type { IInvoicesResponse } from "@/types/Invoice";

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

export const getInvoices = async (
    token: string,
    params: {
        search?: string;
        page?: number;
        limit?: number;
        status?: string;
        customerId?: string;
        currencyCode?: string;
        startDate?: string;
        endDate?: string;
        sort?: string;
    } = {}
): Promise<IInvoicesResponse> => {
    if (!token) throw new Error("No token provided");
    const response = await axios.get(`${BASE_URL}/invoices`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};