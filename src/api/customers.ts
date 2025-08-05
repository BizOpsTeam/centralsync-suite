import axios from 'axios';
import type { Customer } from '@/types/Customer';

export interface CustomerWithStats extends Customer {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
}

export interface CustomersResponse {
  data: CustomerWithStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number; 
}

const BASE_URL = 'http://localhost:4000';

export const fetchCustomers = async (accessToken: string, page = 1, limit = 10, search = ''): Promise<CustomersResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}/users/customers`, {
      params: { page, limit, search },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log("response", await response.data);
    
    // Transform the response to match our frontend types
    return {
      ...response.data,
      data: response.data.data.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        totalOrders: customer._count?.orders || 0,
        totalSpent: customer.totalSpent || 0,
        lastOrderDate: customer.lastOrderDate,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      })),
    };
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const createCustomer = async (accessToken: string, customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    console.log("Creating customer with data:", customerData);
    const response = await axios.post(`${BASE_URL}/users/customers`, customerData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    console.log("Customer creation response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating customer:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
    throw error;
  }
};

export const updateCustomer = async (accessToken: string, id: string, customerData: Partial<Customer>) => {
  try {
    console.log("Updating customer...");
    const response = await axios.patch(`${BASE_URL}/users/customers/${id}`, customerData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    console.log("response", await response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export const deleteCustomer = async (accessToken: string, id: string) => {
  try {
    console.log("Deleting customer...");
    await axios.delete(`${BASE_URL}/users/customers/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

export const getCustomerStatement = async (accessToken: string, customerId: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/users/customers/${customerId}/statement`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching customer statement:', error);
    throw error;
  }
};
