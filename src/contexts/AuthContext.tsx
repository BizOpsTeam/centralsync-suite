
import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect
} from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';


// ===== Types =====
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
    login: (
        email: string,
        password: string
    ) => Promise<{ success: boolean; error?: string }>;
    signup: (
        name: string,
        email: string,
        password: string
    ) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    setRedirectPath: (path: string) => void;
    redirectPath: string | null;
}

// ===== Context =====
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===== Auth Provider =====
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [redirectPath, setRedirectPath] = useState<string | null>(null);

    // ===== Logout =====
    const logout = useCallback(async () => {
        setUser(null);
        setAccessToken(null);
        try {
            await axios.post(`${BASE_URL}/auth/logout`, {}, { withCredentials: true });
        } catch {
            // ignore logout errors
        }
    }, []);

    // ===== Axios Interceptor =====
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // Skip if already retried OR if it's the refresh request itself
                if (
                    error.response?.status === 401 &&
                    !originalRequest._retry &&
                    !originalRequest.url?.includes('/auth/refresh')
                ) {
                    originalRequest._retry = true;

                    try {
                        const res = await axios.post(
                            `${BASE_URL}/auth/refresh`,
                            {},
                            { withCredentials: true }
                        );

                        const newToken = res.data.accessToken;
                        setAccessToken(newToken);
                        setUser(res.data.data || res.data.user);

                        // Update original request with new token
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                        return axios(originalRequest);
                    } catch (refreshError) {
                        await logout();
                        window.location.href = '/login';
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [logout]);

    // ===== Refresh Token on Page Load =====
    useEffect(() => {
        const initAuth = async () => {
            setLoading(true);
            try {
                const res = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                setAccessToken(res.data.accessToken);
                setUser(res.data.data || res.data.user);
            } catch (error) {
                setUser(null);
                setAccessToken(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // ===== Login =====
    const login = useCallback(
        async (email: string, password: string) => {
            setLoading(true);
            try {
                const res = await axios.post(
                    `${BASE_URL}/auth/login`,
                    { email, password },
                    { withCredentials: true }
                );

                if (res.status === 200) {
                    setUser(res.data.data);
                    setAccessToken(res.data.accessToken);
                    return { success: true };
                }
                return { success: false, error: 'Login failed' };
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    return {
                        success: false,
                        error:
                            error.response?.data?.message ||
                            'Login failed. Please try again.'
                    };
                }
                return { success: false, error: 'An unexpected error occurred' };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // ===== Signup =====
    const signup = useCallback(
        async (name: string, email: string, password: string) => {
            setLoading(true);
            try {
                const res = await axios.post(
                    `${BASE_URL}/auth/register`,
                    { name, email, password },
                    { withCredentials: true }
                );

                if (res.status === 201) {
                    setUser(res.data.data);
                    setAccessToken(res.data.accessToken);
                    return { success: true };
                }
                return { success: false, error: 'Signup failed' };
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    return {
                        success: false,
                        error:
                            error.response?.data?.message ||
                            'Signup failed. Please try again.'
                    };
                }
                return { success: false, error: 'An unexpected error occurred' };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                loading,
                login,
                signup,
                logout,
                setRedirectPath,
                redirectPath
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// ===== Hook =====
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
