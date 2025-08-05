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
    content?: string; // Add content field for AI responses
    markdown?: string; // Add markdown field
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


// AI API functions
export const analyzeQuery = async (query: string, accessToken: string): Promise<AIInsight> => {
    const response = await axios.post(`${BASE_URL}/ai/analyze`, { query }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    return response.data.data as AIInsight;
};

export const generateInsights = async (accessToken: string): Promise<AIInsight[]> => {
    const response = await axios.get(`${BASE_URL}/ai/insights`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    return response.data.data as AIInsight[];
};

export const predictTrends = async (accessToken: string, period: string = '30'): Promise<AIInsight[]> => {
    const response = await axios.get(`${BASE_URL}/ai/predictions?period=${period}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    return response.data.data as AIInsight[];
};

export const generateRecommendations = async (accessToken: string): Promise<AIInsight[]> => {
    const response = await axios.get(`${BASE_URL}/ai/recommendations`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    return response.data.data as AIInsight[];
};

export const getAIDashboard = async (accessToken: string): Promise<AIDashboard> => {
    const response = await axios.get(`${BASE_URL}/ai/dashboard`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
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