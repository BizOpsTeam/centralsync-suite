import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { BASE_URL } from '@/api/dashboard';

// Add axios interceptor for automatic token refresh
let authContext: any = null;

export const setAuthContext = (context: any) => {
    authContext = context;
};

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Try to refresh the token
                const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
                    withCredentials: true,
                });
                
                // Update the token in the original request
                const newToken = response.data.accessToken;
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                
                // Update AuthContext state if available
                if (authContext && authContext.setAccessToken) {
                    authContext.setAccessToken(newToken);
                }
                
                // Retry the original request
                return axios(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login
                console.error('Token refresh failed:', refreshError);
                // You might want to trigger a logout here
                return Promise.reject(error);
            }
        }
        
        return Promise.reject(error);
    }
);

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    isEmailVerified: boolean;
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

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    setRedirectPath: (path: string) => void;
    redirectPath: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [redirectPath, setRedirectPath] = useState<string | null>(null);

    // Register this context with the axios interceptor
    useEffect(() => {
        setAuthContext({ setAccessToken, setUser });
    }, []);

    // Auto refresh user token on mount and handle session persistence
    useEffect(() => {
        let isMounted = true;
        const cancelTokenSource = axios.CancelToken.source();

        const fetchUser = async () => {
            try {
                setLoading(true);
                const { data } = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    {},
                    {
                        withCredentials: true,
                        cancelToken: cancelTokenSource.token,
                    }
                );

                if (!isMounted) return;

                setUser(data.user);
                setAccessToken(data.accessToken);
                
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    if (axios.isCancel(error)) {
                        return; // Request was cancelled
                    }

                    const axiosError = error as AxiosError<{ message?: string }>;
                    console.error('Refresh error:', axiosError.response?.data?.message || axiosError.message);
                    if (axiosError.response?.status === 401) {
                        console.log('Authentication required - redirecting to login');
                    }
                } else if (error instanceof Error) {
                    console.error('An error occurred during refresh:', error.message);
                } else {
                    console.error('An unknown error occurred during refresh');
                }

                // Clear any invalid auth state on refresh failure
                setUser(null);
                setAccessToken(null);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchUser();

        // Cleanup function
        return () => {
            isMounted = false;
            cancelTokenSource.cancel('Component unmounted, request cancelled');
        };
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            setLoading(true);
            const response = await axios.post(`${BASE_URL}/auth/login`, {
                email,
                password
            }, {
                withCredentials: true
            });
            
            const data = response.data;
            if (response.status !== 200) return { success: false, error: data.message || 'Login failed' };
            
            setUser(data.data);
            setAccessToken(data.accessToken);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            if (axios.isAxiosError(error)) {
                return { success: false, error: error.response?.data?.message || 'Login failed' };
            }
            return { success: false, error: 'An unexpected error occurred' };
        } finally {
            setLoading(false);
        }
    }, []);

    const signup = useCallback(async (name: string, email: string, password: string) => {
        try {
            setLoading(true);
            const response = await axios.post(`${BASE_URL}/auth/register`, {
                name,
                email,
                password
            }, {
                withCredentials: true
            });
            
            const data = response.data;
            if (response.status !== 201) return { success: false, error: data.message || 'Signup failed' };
            
            setUser(data.data);
            setAccessToken(data.accessToken);
            return { success: true };
        } catch (error) {
            console.error('Signup error:', error);
            if (axios.isAxiosError(error)) {
                return { success: false, error: error.response?.data?.message || 'Signup failed' };
            }
            return { success: false, error: 'An unexpected error occurred' };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            if (accessToken) {
                await axios.post(`${BASE_URL}/auth/logout`, {}, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    withCredentials: true
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setAccessToken(null);
            setRedirectPath(null);
        }
    }, [accessToken]);

    return (
        <AuthContext.Provider value={{ 
            user, 
            accessToken, 
            loading, 
            login, 
            signup, 
            logout,
            setRedirectPath,
            redirectPath
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
