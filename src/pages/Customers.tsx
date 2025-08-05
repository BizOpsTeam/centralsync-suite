import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Filter, Download, Loader2 } from "lucide-react";
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { fetchCustomers, type CustomerWithStats } from "@/api/customers";
import { useAuth } from "@/contexts/AuthContext";
import { format } from 'date-fns';
import { AddCustomerDialog } from "@/components/customers/AddCustomerDialog";

interface CustomerStatusBadgeProps {
  status: 'active' | 'inactive';
}

const CustomerStatusBadge = ({ status }: CustomerStatusBadgeProps) => (
  <Badge
    variant={status === 'active' ? 'default' : 'secondary'}
    className={status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
  >
    {status === 'active' ? 'Active' : 'Inactive'}
  </Badge>
);

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  // Debounce search query to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Query for fetching customers with caching
  const {
    data: customersData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['customers', pagination.page, pagination.limit, debouncedSearchQuery],
    queryFn: () => fetchCustomers(
      accessToken || '',
      pagination.page,
      pagination.limit,
      debouncedSearchQuery
    ),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in v5)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });

  // Mutation for adding a new customer
  const addCustomerMutation = useMutation({
    mutationFn: async (customerData: unknown) => {
      // This would be implemented in the AddCustomerDialog component
      // For now, we'll just invalidate the query
      return Promise.resolve();
    },
    onSuccess: () => {
      // Invalidate and refetch customers data
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Success',
        description: 'Customer added successfully',
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: (error as any)?.response?.data?.message || 'Failed to add customer',
        variant: 'destructive',
      });
    },
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

  // Handle customer added callback
  const handleCustomerAdded = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  }, [queryClient]);

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Error handling
  if (isError) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Failed to load customers. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const customers: CustomerWithStats[] = customersData?.data || [];
  const total: number = customersData?.total || 0;
  const totalPages: number = customersData?.totalPages || 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">
            {isLoading ? 'Loading...' : `Showing ${customers.length} of ${total} customers`}
            {searchQuery !== debouncedSearchQuery && ' (Searching...)'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <AddCustomerDialog onCustomerAdded={handleCustomerAdded} />
        </div>
      </div>

      {/* Search and Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Button type="submit" variant="outline" className="w-full sm:w-auto">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
        <Button type="button" variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </form>

      {/* Customer List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">
            Customer Directory
            {isFetching && !isLoading && (
              <Loader2 className="inline ml-2 h-4 w-4 animate-spin text-primary" />
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1 || isLoading}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(totalPages, pagination.page + 1))}
              disabled={pagination.page >= totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && pagination.page === 1 ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? 'No customers found matching your search.' : 'No customers found.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {customers.map((customer) => (
                <div key={customer.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start sm:items-center space-x-4 w-full sm:w-auto">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {customer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{customer.name}</h3>
                        <CustomerStatusBadge status={'active'} />
                      </div>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                      {customer.phone && (
                        <p className="text-xs text-muted-foreground">{customer.phone}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined {format(new Date(customer.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
                    <div className="text-right sm:text-left">
                      <p className="text-sm font-medium">{customer.totalOrders} orders</p>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(customer.totalSpent || 0)} spent
                      </p>
                    </div>
                    <div className="flex items-center justify-end sm:justify-start space-x-2">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
              of <span className="font-medium">{total}</span> customers
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