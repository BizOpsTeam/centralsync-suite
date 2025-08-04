import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Download, Loader2 } from "lucide-react";
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
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const { toast } = useToast();
  const { accessToken } = useAuth();

  const loadCustomers = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const data = await fetchCustomers(
        accessToken,
        pagination.page,
        pagination.limit,
        searchQuery
      );
      setCustomers(data.data);
      setLoading(false);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages,
      }));
    } catch (error) {
      console.error('Error loading customers:', error);
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to load customers. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      toast({
        title: 'Error',
        description: 'Failed to load customers. Please try again later. No accessToken',
        variant: 'destructive',
      });
      return;
    }
    loadCustomers();
  }, [pagination.page, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `Showing ${customers.length} of ${pagination.total} customers`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <AddCustomerDialog onCustomerAdded={loadCustomers} />
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
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <CardTitle className="text-lg font-medium">Customer Directory</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({
                ...prev,
                page: Math.max(1, prev.page - 1)
              }))}
              disabled={pagination.page === 1 || loading}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({
                ...prev,
                page: Math.min(pagination.totalPages, prev.page + 1)
              }))}
              disabled={pagination.page >= pagination.totalPages || loading}
            >
              Next
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && pagination.page === 1 ? (
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
                        {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
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
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-medium">{pagination.total}</span> customers
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1)
                }))}
                disabled={pagination.page === 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({
                  ...prev,
                  page: Math.min(pagination.totalPages, prev.page + 1)
                }))}
                disabled={pagination.page >= pagination.totalPages || loading}
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