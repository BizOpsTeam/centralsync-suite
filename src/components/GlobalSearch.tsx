import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, Package, DollarSign, FileText, TrendingUp, Calendar } from 'lucide-react';
import { useGlobalSearch } from '../hooks/useGlobalSearch';
import type { SearchResult } from '../api/search';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '../lib/utils';

interface GlobalSearchProps {
    className?: string;
    placeholder?: string;
    variant?: 'default' | 'minimal';
}

const typeIcons = {
    customer: Users,
    product: Package,
    sale: DollarSign,
    invoice: FileText,
    expense: TrendingUp,
    campaign: Calendar,
};

const typeColors = {
    customer: 'bg-blue-100 text-blue-800',
    product: 'bg-green-100 text-green-800',
    sale: 'bg-purple-100 text-purple-800',
    invoice: 'bg-orange-100 text-orange-800',
    expense: 'bg-red-100 text-red-800',
    campaign: 'bg-indigo-100 text-indigo-800',
};

export function GlobalSearch({ 
    className, 
    placeholder = "Search customers, products, invoices...",
    variant = 'default'
}: GlobalSearchProps) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const {
        query,
        searchResults,
        suggestions,
        error,
        isSearching,
        setQuery,
        clearSearch,
        hasResults,
        hasSuggestions,
    } = useGlobalSearch({
        debounceMs: 300,
        minQueryLength: 2,
        enableSuggestions: true,
        enableQuickSearch: true,
    });

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            const totalItems = searchResults.length + suggestions.length;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => 
                        prev < totalItems - 1 ? prev + 1 : 0
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => 
                        prev > 0 ? prev - 1 : totalItems - 1
                    );
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedIndex >= 0) {
                        handleItemSelect(selectedIndex);
                    } else if (query.trim()) {
                        // Perform search and show results
                        setIsOpen(true);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    setIsOpen(false);
                    setSelectedIndex(-1);
                    inputRef.current?.blur();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, searchResults.length, suggestions.length, query]);

    // Reset selected index when results change
    useEffect(() => {
        setSelectedIndex(-1);
    }, [searchResults, suggestions]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current && 
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setIsOpen(true);
        setSelectedIndex(-1);
    };

    const handleInputFocus = () => {
        if (query.trim() || hasSuggestions) {
            setIsOpen(true);
        }
    };

    const handleItemSelect = (index: number) => {
        if (index < searchResults.length) {
            // Navigate to search result
            const result = searchResults[index];
            navigate(result.url);
            setIsOpen(false);
            clearSearch();
        } else {
            // Select suggestion
            const suggestionIndex = index - searchResults.length;
            const suggestion = suggestions[suggestionIndex];
            setQuery(suggestion);
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    const handleResultClick = (result: SearchResult) => {
        navigate(result.url);
        setIsOpen(false);
        clearSearch();
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setIsOpen(false);
        inputRef.current?.blur();
    };

    const formatMetadata = (result: SearchResult) => {
        switch (result.type) {
            case 'customer':
                return result.metadata.email || result.metadata.phone;
            case 'product':
                return `$${result.metadata.price} • ${result.metadata.stock} in stock`;
            case 'sale':
                return `${result.metadata.channel} • ${result.metadata.paymentMethod}`;
            case 'invoice':
                return `${result.metadata.status} • Due: ${result.metadata.dueDate ? new Date(result.metadata.dueDate).toLocaleDateString() : 'N/A'} • Amount: $${result.metadata.amountDue}`;
            case 'expense':
                return `${result.metadata.category} • ${new Date(result.metadata.date).toLocaleDateString()}`;
            case 'campaign':
                return `${result.metadata.broadcastToAll ? 'Broadcast to All' : 'Selected Recipients'} • ${result.metadata.schedule ? 'Scheduled' : 'Immediate'}`;
            default:
                return '';
        }
    };

    return (
        <div className={cn("relative", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    className={cn(
                        "pl-10 pr-10",
                        variant === 'minimal' ? "bg-muted/50 border-0" : ""
                    )}
                />
                {query && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={clearSearch}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                )}
            </div>

            {/* Search Dropdown */}
            {isOpen && (query.trim() || hasSuggestions) && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
                >
                    <ScrollArea className="max-h-96">
                        {/* Loading State */}
                        {isSearching && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                Searching...
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="p-4 text-center text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {/* Search Results */}
                        {hasResults && (
                            <div className="p-2">
                                <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                                    Search Results ({searchResults.length})
                                </div>
                                {searchResults.map((result, index) => {
                                    const Icon = typeIcons[result.type];
                                    const isSelected = index === selectedIndex;
                                    
                                    return (
                                        <div
                                            key={`${result.type}-${result.id}`}
                                            className={cn(
                                                "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                                                isSelected ? "bg-muted" : "hover:bg-muted/50"
                                            )}
                                            onClick={() => handleResultClick(result)}
                                        >
                                            <div className="flex-shrink-0">
                                                <Icon className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium truncate">
                                                        {result.title}
                                                    </span>
                                                    <Badge 
                                                        variant="secondary" 
                                                        className={cn("text-xs", typeColors[result.type])}
                                                    >
                                                        {result.type}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground truncate">
                                                    {result.subtitle}
                                                </div>
                                                {result.description && (
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        {result.description}
                                                    </div>
                                                )}
                                                <div className="text-xs text-muted-foreground">
                                                    {formatMetadata(result)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Suggestions */}
                        {hasSuggestions && !hasResults && (
                            <div className="p-2">
                                <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                                    Suggestions
                                </div>
                                {suggestions.map((suggestion, index) => {
                                    const isSelected = index + searchResults.length === selectedIndex;
                                    
                                    return (
                                        <div
                                            key={suggestion}
                                            className={cn(
                                                "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                                                isSelected ? "bg-muted" : "hover:bg-muted/50"
                                            )}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            <Search className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{suggestion}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* No Results */}
                        {!isSearching && !error && !hasResults && !hasSuggestions && query.trim().length >= 2 && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No results found for "{query}"
                            </div>
                        )}
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
