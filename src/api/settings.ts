import axios from 'axios';

export const BASE_URL = 'http://localhost:4000';


// Types for settings
export interface BusinessProfile {
    name: string;
    email: string;
    logoUrl?: string;
    companyAddress?: string;
    companyPhone?: string;
    defaultCurrencyCode?: string;
    defaultCurrencySymbol?: string;
    defaultTaxRate?: number;
    invoicePrefix?: string;
    invoiceSuffix?: string;
    invoiceSequenceStart?: number;
    invoiceSequenceNext?: number;
    isEmailVerified: boolean;
    role: string;
}

export interface UpdateProfileData {
    name?: string;
    logoUrl?: string;
    companyAddress?: string;
    companyPhone?: string;
    defaultCurrencyCode?: string;
    defaultCurrencySymbol?: string;
    defaultTaxRate?: number;
    invoicePrefix?: string;
    invoiceSuffix?: string;
    invoiceSequenceStart?: number;
    invoiceSequenceNext?: number;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// API functions
export const getUserProfile = async (accessToken: string) => {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data.data as BusinessProfile;
};

export const updateUserProfile = async (accessToken: string, data: UpdateProfileData) => {
    const response = await axios.patch(`${BASE_URL}/users/profile`, data, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data.data as BusinessProfile;
};

export const uploadLogo = async (accessToken: string, file: File) => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await axios.post(`${BASE_URL}/users/profile/logo`, formData, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data as { success: boolean; url: string };
};

export const changePassword = async (accessToken: string, data: ChangePasswordData) => {
    const response = await axios.patch(`${BASE_URL}/auth/change-password`, data, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const resendVerificationEmail = async (accessToken: string) => {
    const response = await axios.post(`${BASE_URL}/auth/resend-verification`, {}, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
};

// Currency options
export const CURRENCY_OPTIONS = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
    { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
];

// Tax rate presets
export const TAX_RATE_PRESETS = [
    { label: 'No Tax', value: 0 },
    { label: '5%', value: 0.05 },
    { label: '7.5%', value: 0.075 },
    { label: '10%', value: 0.1 },
    { label: '12.5%', value: 0.125 },
    { label: '15%', value: 0.15 },
    { label: '20%', value: 0.2 },
]; 