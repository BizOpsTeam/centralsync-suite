import axios from "axios";
import { BASE_URL } from "./dashboard";
import type { IProduct } from "@/types/Product";

// ownerId,
// categoryId,
// minPrice,
// maxPrice,
// inStock,
// search,
// sort = "createdAt:desc",
// page = 1,
// limit = 20,

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