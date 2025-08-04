import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  accessToken: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const baseUrl = import.meta.env.VITE_BASE_URL;
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);


  // Auto refresh user token on mount and handle session persistence
  useEffect(() => {
    let isMounted = true;
    const cancelTokenSource = axios.CancelToken.source();

    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data } = await axios.post(
          `${baseUrl}/auth/refresh`,
          {},
          {
            withCredentials: true,
            cancelToken: cancelTokenSource.token,
          }
        );
        
        if (!isMounted) return;
        
        setUser(data.data);
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

  //token will not be stored in localStorage
  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`${baseUrl}/auth/login`, {
        email,
        password
      });
      const data = response.data;
      if (response.status !== 200) return { success: false, error: data.message || 'Login failed' };
      setUser(data.data);
      setAccessToken(data.accessToken);
      console.log(data);
      console.log("User: ", user)
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  }, []);
  
  

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`${baseUrl}/auth/signup`, {
        name,
        email,
        password
      });
      const data = response.data;
      if (response.status !== 200) return { success: false, error: data.message || 'Signup failed' };
      setUser(data.data);
      setAccessToken(data.accessToken);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  }, []);

  console.log("User: ", user)

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, signup, logout }}>
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
