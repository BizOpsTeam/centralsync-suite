import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
    ArrowLeft, 
    Edit, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar,
    DollarSign,
    ShoppingCart,
    FileText,
    Users,
    Bell,
    TrendingUp,
    Package,
    CreditCard,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    fetchCustomerDetails, 
    fetchCustomerSales, 
    fetchCustomerInvoices, 
    fetchCustomerCampaigns,
    type CustomerDetails,
    type CustomerSalesResponse,
    type CustomerInvoicesResponse
} from '@/api/customers';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function CustomerDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { accessToken } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch customer details
    const {
        data: customerDetails,
        isLoading: isLoadingDetails,
        isError: isErrorDetails,
        error: detailsError,
    } = useQuery({
        queryKey: ['customerDetails', id],
        queryFn: () => fetchCustomerDetails(accessToken!, id!),
        enabled: !!accessToken && !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });

    // Fetch customer sales
    const {
        data: salesData,
        isLoading: isLoadingSales,
    } = useQuery({
        queryKey: ['customerSales', id],
        queryFn: () => fetchCustomerSales(accessToken!, id!),
        enabled: !!accessToken && !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch customer invoices
    const {
        data: invoicesData,
        isLoading: isLoadingInvoices,
    } = useQuery({
        queryKey: ['customerInvoices', id],
        queryFn: () => fetchCustomerInvoices(accessToken!, id!),
        enabled: !!accessToken && !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch customer campaigns
    const {
        data: campaigns,
        isLoading: isLoadingCampaigns,
    } = useQuery({
        queryKey: ['customerCampaigns', id],
        queryFn: () => fetchCustomerCampaigns(accessToken!, id!),
        enabled: !!accessToken && !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });

    if (isErrorDetails) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                        {detailsError?.message || 'Failed to load customer details. Please try again.'}
                    </p>
                    <Button onClick={() => navigate('/customers')} variant="outline">
                        Back to Customers
                    </Button>
                </div>
            </div>
        );
    }

    if (isLoadingDetails || !customerDetails) {
        return <CustomerDetailsSkeleton />;
    }

    const { customer, financialSummary, sales, invoices, customerGroups, reminders } = customerDetails;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/customers')}
                        className="flex items-center space-x-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Customers</span>
                    </Button>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Customer
                    </Button>
                </div>
            </div>

            {/* Customer Profile Header */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start space-x-6">
                        <Avatar className="h-20 w-20">
                            <AvatarFallback className="text-lg">
                                {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h1 className="text-2xl font-bold">{customer.name}</h1>
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    Active Customer
                                </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4" />
                                    <span>{customer.email}</span>
                                </div>
                                {customer.phone && (
                                    <div className="flex items-center space-x-2">
                                        <Phone className="h-4 w-4" />
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{customer.address}</span>
                                    </div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Customer since {format(new Date(customer.createdAt), 'MMM yyyy')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-muted-foreground">Total Spent</span>
                        </div>
                        <p className="text-2xl font-bold">${financialSummary.totalSpent.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
                        </div>
                        <p className="text-2xl font-bold">{financialSummary.totalOrders}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-muted-foreground">Avg Order Value</span>
                        </div>
                        <p className="text-2xl font-bold">${financialSummary.averageOrderValue.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-muted-foreground">Outstanding</span>
                        </div>
                        <p className="text-2xl font-bold">${financialSummary.outstandingAmount.toFixed(2)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="sales">Sales History</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <OverviewTab 
                        customer={customer}
                        financialSummary={financialSummary}
                        sales={sales}
                        invoices={invoices}
                        customerGroups={customerGroups}
                        reminders={reminders}
                    />
                </TabsContent>

                <TabsContent value="sales" className="space-y-4">
                    <SalesTab 
                        salesData={salesData}
                        isLoading={isLoadingSales}
                    />
                </TabsContent>

                <TabsContent value="invoices" className="space-y-4">
                    <InvoicesTab 
                        invoicesData={invoicesData}
                        isLoading={isLoadingInvoices}
                    />
                </TabsContent>

                <TabsContent value="campaigns" className="space-y-4">
                    <CampaignsTab 
                        campaigns={campaigns}
                        isLoading={isLoadingCampaigns}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Tab Components
function OverviewTab({ customer, financialSummary, sales, invoices, customerGroups, reminders }: any) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Recent Activity</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {sales.slice(0, 5).map((sale: any) => (
                            <div key={sale.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                                    <div>
                                        <p className="font-medium">Sale #{sale.id.slice(-8)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(sale.createdAt), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <span className="font-medium">${sale.totalAmount}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Customer Groups */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Customer Groups</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {customerGroups.length > 0 ? (
                        <div className="space-y-2">
                            {customerGroups.map((group: any) => (
                                <Badge key={group.id} variant="secondary">
                                    {group.name}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No groups assigned</p>
                    )}
                </CardContent>
            </Card>

            {/* Reminders */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Bell className="h-5 w-5" />
                        <span>Reminders</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {reminders.length > 0 ? (
                        <div className="space-y-2">
                            {reminders.slice(0, 5).map((reminder: any) => (
                                <div key={reminder.id} className="p-3 bg-muted/50 rounded-lg">
                                    <p className="font-medium">{reminder.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Due: {format(new Date(reminder.due), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No reminders set</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function SalesTab({ salesData, isLoading }: { salesData: CustomerSalesResponse | undefined; isLoading: boolean }) {
    if (isLoading) {
        return <SalesSkeleton />;
    }

    if (!salesData || salesData.sales.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No sales found for this customer</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sales History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {salesData.sales.map((sale: any) => (
                        <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Sale #{sale.id.slice(-8)}</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Channel: {sale.channel} • Payment: {sale.paymentMethod}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">${sale.totalAmount}</p>
                                <Badge variant="secondary">{sale.status}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function InvoicesTab({ invoicesData, isLoading }: { invoicesData: CustomerInvoicesResponse | undefined; isLoading: boolean }) {
    if (isLoading) {
        return <InvoicesSkeleton />;
    }

    if (!invoicesData || invoicesData.invoices.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No invoices found for this customer</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invoice History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {invoicesData.invoices.map((invoice: any) => (
                        <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Invoice {invoice.invoiceNumber}</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Due: {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">${invoice.amountDue}</p>
                                <Badge 
                                    variant={invoice.isPaid ? "default" : "secondary"}
                                    className={invoice.isPaid ? "bg-green-100 text-green-800" : ""}
                                >
                                    {invoice.isPaid ? "Paid" : "Unpaid"}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function CampaignsTab({ campaigns, isLoading }: { campaigns: any[] | undefined; isLoading: boolean }) {
    if (isLoading) {
        return <CampaignsSkeleton />;
    }

    if (!campaigns || campaigns.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No campaigns found for this customer</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Campaign History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {campaigns.map((campaign: any) => (
                        <div key={campaign.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium">{campaign.name}</h3>
                                <Badge variant="secondary">
                                    {campaign.broadcastToAll ? "Broadcast" : "Targeted"}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{campaign.message}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>{format(new Date(campaign.createdAt), 'MMM dd, yyyy')}</span>
                                {campaign.schedule && (
                                    <span>Scheduled: {format(new Date(campaign.schedule), 'MMM dd, yyyy')}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// Skeleton Components
function CustomerDetailsSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-32" />
            </div>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start space-x-6">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="flex-1 space-y-4">
                            <Skeleton className="h-8 w-64" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function SalesSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <div className="text-right space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-5 w-12" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function InvoicesSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <div className="text-right space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-5 w-12" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function CampaignsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="p-4 border rounded-lg space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-64" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
