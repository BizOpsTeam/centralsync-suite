import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export const fetchProductCategories = async (accessToken: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/product-categories`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching product categories:', error);
    throw error;
  }
};

export const createProductCategory = async (
  accessToken: string, 
  data: { name: string; description?: string }
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/product-categories`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error creating product category:', error);
    throw error;
  }
};
