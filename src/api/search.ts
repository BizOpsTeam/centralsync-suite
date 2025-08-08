import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

export interface SearchResult {
    type: 'customer' | 'product' | 'sale' | 'invoice' | 'expense' | 'campaign';
    id: string;
    title: string;
    subtitle: string;
    description?: string | null;
    url: string;
    relevance: number;
    metadata: Record<string, any>;
}

export interface SearchResponse {
    success: boolean;
    data: SearchResult[];
    meta: {
        query: string;
        total: number;
        limit?: number;
        types?: string[];
    };
}

export interface SearchSuggestionsResponse {
    success: boolean;
    data: string[];
    meta: {
        query: string;
        total: number;
    };
}

export const searchAPI = {
    // Main global search
    async globalSearch(
        query: string, 
        options: {
            limit?: number;
            types?: string[];
            includeArchived?: boolean;
        } = {},
        accessToken: string
    ): Promise<SearchResponse> {
        const params = new URLSearchParams({
            q: query,
            ...(options.limit && { limit: options.limit.toString() }),
            ...(options.types && options.types.length > 0 && { types: options.types.join(',') }),
            ...(options.includeArchived && { includeArchived: 'true' }),
        });

        const response = await axios.get(`${BASE_URL}/search?${params}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
            },
        });

        return response.data;
    },

    // Quick search for recent items
    async quickSearch(query: string, accessToken: string): Promise<SearchResponse> {
        const response = await axios.get(`${BASE_URL}/search/quick?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
            },
        });

        return response.data;
    },

    // Get search suggestions for autocomplete
    async getSuggestions(query: string, accessToken: string): Promise<SearchSuggestionsResponse> {
        const response = await axios.get(`${BASE_URL}/search/suggestions?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
            },
        });

        return response.data;
    },
};
