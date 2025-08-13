import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { searchAPI, type SearchResult } from '../api/search';
import { useAuth } from '@/contexts/AuthContext';
import { oneDay } from '@/lib/cacheTimes';

interface UseGlobalSearchOptions {
    debounceMs?: number;
    minQueryLength?: number;
    enableSuggestions?: boolean;
    enableQuickSearch?: boolean;
}

export function useGlobalSearch(options: UseGlobalSearchOptions = {}) {
    const {
        debounceMs = 300,
        minQueryLength = 2,
        enableSuggestions = true,
        enableQuickSearch = true,
    } = options;

    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    const { accessToken } = useAuth();
    const queryClient = useQueryClient();
    const debounceTimeoutRef = useRef<NodeJS.Timeout>();

    // Debounce the search query
    useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (query.length >= minQueryLength) {
            debounceTimeoutRef.current = setTimeout(() => {
                setDebouncedQuery(query);
            }, debounceMs);
        } else {
            setDebouncedQuery('');
            setSearchResults([]);
            setSuggestions([]);
        }

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [query, debounceMs, minQueryLength]);

    // Main search query
    const {
        data: searchData,
        isLoading: isSearchLoading,
        error: searchError,
        refetch: refetchSearch,
    } = useQuery({
        queryKey: ['globalSearch', debouncedQuery],
        queryFn: () => searchAPI.globalSearch(debouncedQuery, {}, accessToken!),
        enabled: !!debouncedQuery && !!accessToken && debouncedQuery.length >= minQueryLength,
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    // Suggestions query
    const {
        data: suggestionsData,
        isLoading: isSuggestionsLoading,
    } = useQuery({
        queryKey: ['searchSuggestions', debouncedQuery],
        queryFn: () => searchAPI.getSuggestions(debouncedQuery, accessToken!),
        enabled: !!debouncedQuery && !!accessToken && enableSuggestions && debouncedQuery.length >= 1,
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    // Quick search query
    const {
        data: _quickSearchData,
        isLoading: isQuickSearchLoading,
    } = useQuery({
        queryKey: ['quickSearch', debouncedQuery],
        queryFn: () => searchAPI.quickSearch(debouncedQuery, accessToken!),
        enabled: !!debouncedQuery && !!accessToken && enableQuickSearch && debouncedQuery.length >= minQueryLength,
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    // Update results when data changes
    useEffect(() => {
        if (searchData?.success) {
            setSearchResults(searchData.data);
            setError(null);
        } else if (searchError) {
            setError('Failed to search. Please try again.');
            setSearchResults([]);
        }
    }, [searchData, searchError]);

    // Update suggestions when data changes
    useEffect(() => {
        if (suggestionsData?.success) {
            setSuggestions(suggestionsData.data);
        }
    }, [suggestionsData]);

    // Clear results when query is cleared
    useEffect(() => {
        if (!debouncedQuery) {
            setSearchResults([]);
            setSuggestions([]);
            setError(null);
        }
    }, [debouncedQuery]);

    // Manual search function
    const performSearch = useCallback(async (
        searchQuery: string,
        options?: {
            limit?: number;
            types?: string[];
            includeArchived?: boolean;
        }
    ) => {
        if (!accessToken || !searchQuery.trim()) {
            return;
        }

        setIsSearching(true);
        setError(null);

        try {
            const result = await searchAPI.globalSearch(searchQuery, options, accessToken);
            if (result.success) {
                setSearchResults(result.data);
            } else {
                setError('Search failed. Please try again.');
            }
        } catch (err) {
            setError('Search failed. Please try again.');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [accessToken]);

    // Clear search
    const clearSearch = useCallback(() => {
        setQuery('');
        setDebouncedQuery('');
        setSearchResults([]);
        setSuggestions([]);
        setError(null);
        setIsSearching(false);
    }, []);

    // Invalidate search cache
    const invalidateSearchCache = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['globalSearch'] });
        queryClient.invalidateQueries({ queryKey: ['searchSuggestions'] });
        queryClient.invalidateQueries({ queryKey: ['quickSearch'] });
    }, [queryClient]);

    return {
        // State
        query,
        debouncedQuery,
        searchResults,
        suggestions,
        error,
        isSearching: isSearching || isSearchLoading || isQuickSearchLoading,
        isSuggestionsLoading,
        
        // Actions
        setQuery,
        performSearch,
        clearSearch,
        invalidateSearchCache,
        refetchSearch,
        
        // Computed
        hasResults: searchResults.length > 0,
        hasSuggestions: suggestions.length > 0,
        totalResults: searchResults.length,
        totalSuggestions: suggestions.length,
    };
}
