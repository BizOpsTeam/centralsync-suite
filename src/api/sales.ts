import axios from "axios";
import { BASE_URL } from "./dashboard";
import type { ISale, ISalePayload, ISalesResponse } from "@/types/Sale";

export const getSales = async (
    token: string, 
    searchQuery: string = "", 
    page: number = 1, 
    limit: number = 20
): Promise<ISalesResponse> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const response = await axios.get(`${BASE_URL}/sales`, {
        params: {
            search: searchQuery,
            page,
            limit,
        },
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    console.log(response);
    return response.data;
};

export const createSale = async (token: string, saleData: ISalePayload): Promise<ISale> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const response = await axios.post(`${BASE_URL}/sales`, saleData, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return response.data.data;
};

export const getSalesStats = async (token: string, period: string = "day") => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const response = await axios.get(`${BASE_URL}/sales/stats`, {
        params: { period },
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return response.data.data;
};

export const deleteSale = async (token: string, saleId: string) => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    await axios.delete(`${BASE_URL}/sales/${saleId}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
}; 