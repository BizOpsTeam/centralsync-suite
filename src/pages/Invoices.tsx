import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    Filter, 
    Download, 
    Loader2, 
    Plus,
    DollarSign,
    CreditCard,
    AlertTriangle,
    TrendingUp,
    FileText,
    Eye,
    Mail
} from "lucide-react";
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    fetchInvoices, 
    fetchInvoiceStats,
    type Invoice,
    type InvoiceStats,
    type InvoicesQueryParams
} from "@/api/invoices";
import { useAuth } from "@/contexts/AuthContext";
import { format } from 'date-fns';

interface InvoiceStatusBadgeProps {
    status: 'UNPAID' | 'PARTIAL' | 'PAID';
    isOverdue?: boolean;
}

const InvoiceStatusBadge = ({ status, isOverdue }: InvoiceStatusBadgeProps) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'PAID':
                return { label: 'Paid', className: 'bg-green-100 text-green-800' };
            case 'PARTIAL':
                return { label: 'Partial', className: 'bg-yellow-100 text-yellow-800' };
            case 'UNPAID':
                return { 
                    label: isOverdue ? 'Overdue' : 'Unpaid', 
                    className: isOverdue ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800' 
                };
            default:
                return { label: status, className: 'bg-gray-100 text-gray-800' };
        }
    };

    const config = getStatusConfig();

    return (
        <Badge variant="secondary" className={config.className}>
            {config.label}
        </Badge>
    );
};

export default function Invoices() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    });
    const { accessToken } = useAuth();
    const navigate = useNavigate();

    // Debounce search query to prevent excessive API calls
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Build query parameters
    const queryParams: InvoicesQueryParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearchQuery,
        status: statusFilter !== 'all' ? statusFilter as 'UNPAID' | 'PARTIAL' | 'PAID' : undefined,
    };

    // Query for fetching invoices with caching
    const {
        data: invoicesData,
        isLoading,
        isError,
        refetch,
        isFetching
    } = useQuery({
        queryKey: ['invoices', queryParams],
        queryFn: () => fetchInvoices(accessToken!, queryParams),
        enabled: !!accessToken,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 2,
    });

    // Query for fetching invoice stats
    const {
        data: stats,
        isLoading: isLoadingStats,
    } = useQuery({
        queryKey: ['invoiceStats'],
        queryFn: () => fetchInvoiceStats(accessToken!),
        enabled: !!accessToken,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });

    // Handle search form submission
    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    // Handle pagination
    const handlePageChange = useCallback((newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    }, []);

    // Handle search input change
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        // Reset to first page when searching
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    // Handle status filter change
    const handleStatusFilterChange = useCallback((value: string) => {
        setStatusFilter(value);
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    // Handle invoice actions
    const handleViewInvoice = useCallback((invoiceId: string) => {
        navigate(`/invoices/${invoiceId}`);
    }, [navigate]);

    const handleDownloadInvoice = useCallback(async (invoiceId: string) => {
        try {
            // This would be implemented with the download function
            console.log('Downloading invoice:', invoiceId);
        } catch (error) {
            console.error('Error downloading invoice:', error);
        }
    }, []);

    const handleEmailInvoice = useCallback(async (invoiceId: string) => {
        try {
            // This would be implemented with the email function
            console.log('Emailing invoice:', invoiceId);
        } catch (error) {
            console.error('Error emailing invoice:', error);
        }
    }, []);

    const invoices = invoicesData?.invoices || [];
    const total = invoicesData?.total || 0;
    const totalPages = invoicesData?.totalPages || 0;

    // Error handling
    if (isError) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                        Failed to load invoices. Please try again.
                    </p>
                    <Button onClick={() => refetch()} variant="outline">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">
                        Manage and track your business invoices
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Invoice
                </Button>
            </div>

            {/* Stats Cards */}
            {!isLoadingStats && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-muted-foreground">Total Invoices</span>
                            </div>
                            <p className="text-2xl font-bold">{stats.totalInvoices}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
                            </div>
                            <p className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4 text-orange-600" />
                                <span className="text-sm font-medium text-muted-foreground">Outstanding</span>
                            </div>
                            <p className="text-2xl font-bold">${stats.outstandingAmount.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium text-muted-foreground">Payment Rate</span>
                            </div>
                            <p className="text-2xl font-bold">{stats.paymentRate.toFixed(1)}%</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search invoices by number, customer name, or email..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="pl-10"
                                />
                            </div>
                        </form>
                        <div className="flex items-center space-x-2">
                            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                                    <SelectItem value="PARTIAL">Partial</SelectItem>
                                    <SelectItem value="PAID">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                More Filters
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading && pagination.page === 1 ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                {searchQuery || statusFilter !== 'all' 
                                    ? 'No invoices found matching your filters.' 
                                    : 'No invoices found. Create your first invoice to get started.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {invoices.map((invoice: Invoice) => {
                                const isOverdue = !invoice.isPaid && new Date(invoice.dueDate) < new Date();
                                
                                return (
                                    <div key={invoice.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-start sm:items-center space-x-4 w-full sm:w-auto">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 
                                                        className="font-medium text-foreground hover:text-primary cursor-pointer transition-colors"
                                                        onClick={() => handleViewInvoice(invoice.id)}
                                                    >
                                                        {invoice.invoiceNumber}
                                                    </h3>
                                                    <InvoiceStatusBadge status={invoice.status} isOverdue={isOverdue} />
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {invoice.sale.customer.name} • {invoice.sale.customer.email}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Due: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                                                    {isOverdue && (
                                                        <span className="text-red-600 ml-2">• Overdue</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
                                            <div className="text-right sm:text-left">
                                                <p className="text-sm font-medium">
                                                    ${invoice.amountDue.toFixed(2)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {invoice.isPaid ? 'Paid' : 'Due'}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-end sm:justify-start space-x-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="w-full sm:w-auto"
                                                    onClick={() => handleViewInvoice(invoice.id)}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="w-full sm:w-auto"
                                                    onClick={() => handleDownloadInvoice(invoice.id)}
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="w-full sm:w-auto"
                                                    onClick={() => handleEmailInvoice(invoice.id)}
                                                >
                                                    <Mail className="h-4 w-4 mr-2" />
                                                    Email
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
                        <p className="text-sm text-muted-foreground">
                            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                            <span className="font-medium">
                                {Math.min(pagination.page * pagination.limit, total)}
                            </span>{' '}
                            of <span className="font-medium">{total}</span> invoices
                        </p>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                                disabled={pagination.page === 1 || isLoading}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(Math.min(totalPages, pagination.page + 1))}
                                disabled={pagination.page >= totalPages || isLoading}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
