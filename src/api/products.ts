import axios from "axios";
import type { IProduct } from "@/types/Product";

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

export const getProducts = async(token: string, searchQuery: string, selectedCategory: string, page: number, limit: number): Promise<IProduct[]> => {
    if (!token) {
        throw new Error("No token provided");
    }
    const response = await axios.get(`${BASE_URL}/products?search=${searchQuery}&category=${selectedCategory}&page=${page}&limit=${limit}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    console.log("res: ", response)
    console.log("response", response.data.data);
    return response.data.data;
}