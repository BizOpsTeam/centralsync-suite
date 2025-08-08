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

export interface CustomerDetails {
    customer: Customer;
    sales: any[];
    invoices: any[];
    customerGroups: any[];
    campaigns: any[];
    reminders: any[];
    financialSummary: {
        totalSpent: number;
        averageOrderValue: number;
        totalOrders: number;
        lastOrderDate: string | null;
        totalInvoices: number;
        totalInvoiced: number;
        paidInvoices: number;
        totalPaid: number;
        outstandingAmount: number;
    };
}

export interface CustomerSalesResponse {
    sales: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CustomerInvoicesResponse {
    invoices: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

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

export const fetchCustomerDetails = async (accessToken: string, customerId: string): Promise<CustomerDetails> => {
    try {
        const response = await axios.get(`${BASE_URL}/users/customers/${customerId}/details`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching customer details:', error);
        throw error;
    }
};

export const fetchCustomerSales = async (
    accessToken: string, 
    customerId: string, 
    page = 1, 
    limit = 10
): Promise<CustomerSalesResponse> => {
    try {
        const response = await axios.get(`${BASE_URL}/users/customers/${customerId}/sales`, {
            params: { page, limit },
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching customer sales:', error);
        throw error;
    }
};

export const fetchCustomerInvoices = async (
    accessToken: string, 
    customerId: string, 
    page = 1, 
    limit = 10
): Promise<CustomerInvoicesResponse> => {
    try {
        const response = await axios.get(`${BASE_URL}/users/customers/${customerId}/invoices`, {
            params: { page, limit },
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching customer invoices:', error);
        throw error;
    }
};

export const fetchCustomerCampaigns = async (accessToken: string, customerId: string): Promise<any[]> => {
    try {
        const response = await axios.get(`${BASE_URL}/users/customers/${customerId}/campaigns`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching customer campaigns:', error);
        throw error;
    }
};
