import axios from 'axios';

export const BASE_URL = 'http://localhost:4000';

// Types for AI responses
export interface AIInsight {
  id: string;
  type: 'analysis' | 'prediction' | 'recommendation' | 'alert' | 'trend';
  title: string;
  description: string;
  confidence: number;
  data: any;
  timestamp: Date;
  actionable: boolean;
  category: 'sales' | 'customers' | 'inventory' | 'financial' | 'general';
}

export interface AIQuery {
  query: string;
  context: 'sales' | 'customers' | 'inventory' | 'financial' | 'general';
  response: AIInsight;
}

export interface AIDashboard {
  insights: AIInsight[];
  predictions: AIInsight[];
  recommendations: AIInsight[];
}

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url: string, options: any = {}) => {
  const token = getAuthToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    ...options.headers,
  };
  
  return axios({
    ...options,
    url: `${BASE_URL}${url}`,
    headers,
  });
};

// AI API functions
export const analyzeQuery = async (query: string): Promise<AIInsight> => {
  const response = await fetchWithAuth('/ai/analyze', {
    method: 'POST',
    data: { query },
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data.data as AIInsight;
};

export const generateInsights = async (): Promise<AIInsight[]> => {
  const response = await fetchWithAuth('/ai/insights');
  return response.data.data as AIInsight[];
};

export const predictTrends = async (period: string = '30'): Promise<AIInsight[]> => {
  const response = await fetchWithAuth(`/ai/predictions?period=${period}`);
  return response.data.data as AIInsight[];
};

export const generateRecommendations = async (): Promise<AIInsight[]> => {
  const response = await fetchWithAuth('/ai/recommendations');
  return response.data.data as AIInsight[];
};

export const getAIDashboard = async (): Promise<AIDashboard> => {
  const response = await fetchWithAuth('/ai/dashboard');
  return response.data.data as AIDashboard;
};

// Sample queries for quick access
export const SAMPLE_QUERIES = [
  "What are my top 3 customers by revenue?",
  "Show me my profit margin trend over the last 6 months",
  "Which products are underperforming?",
  "Predict my sales for next quarter",
  "What's my average order value trend?",
  "Which customers are most likely to churn?",
  "How can I increase my profit margin?",
  "What's the best time to restock inventory?",
  "Show me seasonal sales patterns",
  "What marketing strategies should I focus on?"
]; 