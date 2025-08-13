import  { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
    ArrowLeft, 
    Download, 
    Mail, 
    Edit,
    DollarSign,
    Calendar,
    User,
    Package,
    CreditCard,
    CheckCircle,
    Clock,
    AlertTriangle,
    FileText,
    Receipt,
    Phone,
    Building2,
    Hash,
    TrendingUp,
    Copy,
    ExternalLink,
    Printer,
    Send,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
    fetchInvoiceById,
    downloadInvoicePdf,
    emailInvoicePdf,
} from '@/api/invoices';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { oneDay } from '@/lib/cacheTimes';


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

export default function InvoiceDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { accessToken } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEmailing, setIsEmailing] = useState(false);

    // Fetch invoice details
    const {
        data: invoice,
        isLoading: isLoadingInvoice,
        isError: isErrorInvoice,
        error: invoiceError,
    } = useQuery({
        queryKey: ['invoice', id],
        queryFn: () => fetchInvoiceById(accessToken!, id!),
        enabled: !!accessToken && !!id,
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    if (isErrorInvoice) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                        {invoiceError?.message || 'Failed to load invoice details. Please try again.'}
                    </p>
                    <Button onClick={() => navigate('/invoices')} variant="outline">
                        Back to Invoices
                    </Button>
                </div>
            </div>
        );
    }

    if (isLoadingInvoice || !invoice) {
        return <InvoiceDetailsSkeleton />;
    }

    const isOverdue = !invoice.isPaid && new Date(invoice.dueDate) < new Date();

    // Download PDF functionality
    const handleDownloadPdf = async () => {
        if (!accessToken || !invoice) return;
        
        setIsDownloading(true);
        try {
            const blob = await downloadInvoicePdf(accessToken, invoice.id);
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${invoice.invoiceNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast({
                title: 'Success',
                description: 'Invoice PDF downloaded successfully!',
            });
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast({
                title: 'Error',
                description: 'Failed to download invoice PDF. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsDownloading(false);
        }
    };

    // Print PDF functionality
    const handlePrintPdf = async () => {
        if (!accessToken || !invoice) return;
        
        try {
            const blob = await downloadInvoicePdf(accessToken, invoice.id);
            
            // Create a blob URL for printing
            const url = window.URL.createObjectURL(blob);
            const printWindow = window.open(url, '_blank');
            
            if (printWindow) {
                printWindow.addEventListener('load', () => {
                    printWindow.print();
                });
            }
            
            // Cleanup after a delay
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 1000);
            
        } catch (error) {
            console.error('Error printing PDF:', error);
            toast({
                title: 'Error',
                description: 'Failed to print invoice. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Copy invoice link functionality
    const handleCopyLink = async () => {
        try {
            const invoiceUrl = `${window.location.origin}/invoices/${invoice.id}`;
            await navigator.clipboard.writeText(invoiceUrl);
            
            toast({
                title: 'Success',
                description: 'Invoice link copied to clipboard!',
            });
        } catch (error) {
            console.error('Error copying link:', error);
            toast({
                title: 'Error',
                description: 'Failed to copy link. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Email invoice functionality
    const handleEmailInvoice = async (emailData?: { email?: string; subject?: string; message?: string }) => {
        if (!accessToken || !invoice) return;
        
        setIsEmailing(true);
        try {
            const defaultEmailData = {
                email: emailData?.email || invoice.sale.customer.email,
                subject: emailData?.subject || `Invoice #${invoice.invoiceNumber} from Your Company`,
                message: emailData?.message || `Dear ${invoice.sale.customer.name},\n\nPlease find attached your invoice #${invoice.invoiceNumber}.\n\nThank you for your business!\n\nBest regards,\nYour Company`
            };

            await emailInvoicePdf(accessToken, invoice.id, defaultEmailData);
            
            toast({
                title: 'Success',
                description: `Invoice emailed successfully to ${defaultEmailData.email}!`,
            });
        } catch (error) {
            console.error('Error emailing invoice:', error);
            toast({
                title: 'Error',
                description: 'Failed to email invoice. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsEmailing(false);
        }
    };

    // Handle form-based email sending
    const handleFormEmailInvoice = async () => {
        const emailElement = document.getElementById('email-to') as HTMLInputElement;
        const subjectElement = document.getElementById('email-subject') as HTMLInputElement;
        const messageElement = document.getElementById('email-message') as HTMLTextAreaElement;

        const emailData = {
            email: emailElement?.value || invoice.sale.customer.email,
            subject: subjectElement?.value || `Invoice ${invoice.invoiceNumber} from Your Company`,
            message: messageElement?.value || `Dear ${invoice.sale.customer.name},\n\nPlease find attached your invoice ${invoice.invoiceNumber}.\n\nThank you for your business!\n\nBest regards,\nYour Company`
        };

        await handleEmailInvoice(emailData);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/invoices')}
                        className="flex items-center space-x-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Invoices</span>
                    </Button>
                </div>
                <div className="flex items-center space-x-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                    >
                        {isDownloading ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        {isDownloading ? 'Downloading...' : 'Download PDF'}
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEmailInvoice()}
                        disabled={isEmailing}
                    >
                        {isEmailing ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Mail className="h-4 w-4 mr-2" />
                        )}
                        {isEmailing ? 'Sending...' : 'Email Invoice'}
                    </Button>
                    <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Invoice
                    </Button>
                </div>
            </div>

            {/* Invoice Header */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <h1 className="text-2xl font-bold">Invoice {invoice.invoiceNumber}</h1>
                                <InvoiceStatusBadge status={invoice.status} isOverdue={isOverdue} />
                            </div>
                            <p className="text-muted-foreground">
                                Created on {format(new Date(invoice.createdAt), 'MMMM d, yyyy')}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold">${invoice.amountDue.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                                {invoice.isPaid ? 'Paid' : 'Due'} {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-muted-foreground">Customer</span>
                        </div>
                        <p className="text-lg font-semibold">{invoice.sale.customer.name}</p>
                        <p className="text-sm text-muted-foreground">{invoice.sale.customer.email}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-muted-foreground">Due Date</span>
                        </div>
                        <p className="text-lg font-semibold">{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</p>
                        {isOverdue && (
                            <p className="text-sm text-red-600">Overdue</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-muted-foreground">Payment Method</span>
                        </div>
                        <p className="text-lg font-semibold">{invoice.sale.paymentMethod}</p>
                        <p className="text-sm text-muted-foreground">{invoice.sale.channel}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-muted-foreground">Items</span>
                        </div>
                        <p className="text-lg font-semibold">{invoice.sale.saleItems.length}</p>
                        <p className="text-sm text-muted-foreground">Products</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="items">Items</TabsTrigger>
                    <TabsTrigger value="payment">Payment</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* Invoice Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5" />
                                <span>Invoice Summary</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Financial Summary */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Financial Details</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Subtotal:</span>
                                            <span className="font-medium">{invoice.currencySymbol || "$"}{(invoice.amountDue - invoice.taxAmount).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Tax ({(invoice.taxRate * 100).toFixed(1)}%):</span>
                                            <span className="font-medium">{invoice.currencySymbol || "$"}{invoice.taxAmount.toFixed(2)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">Total Amount:</span>
                                            <span className="font-bold text-lg">{invoice.currencySymbol || "$"}{invoice.amountDue.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Amount Paid:</span>
                                            <span className="font-medium text-green-600">{invoice.currencySymbol || "$"}{invoice.paidAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Outstanding:</span>
                                            <span className="font-medium text-red-600">{invoice.currencySymbol || "$"}{(invoice.amountDue - invoice.paidAmount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Timeline</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                            <div>
                                                <p className="text-sm font-medium">Invoice Created</p>
                                                <p className="text-xs text-muted-foreground">{format(new Date(invoice.createdAt), 'MMM d, yyyy \'at\' h:mm a')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                                            <div>
                                                <p className="text-sm font-medium">Due Date</p>
                                                <p className="text-xs text-muted-foreground">{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</p>
                                            </div>
                                        </div>
                                        {invoice.paidAt && (
                                            <div className="flex items-center space-x-3">
                                                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                                <div>
                                                    <p className="text-sm font-medium">Payment Received</p>
                                                    <p className="text-xs text-muted-foreground">{format(new Date(invoice.paidAt), 'MMM d, yyyy \'at\' h:mm a')}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <User className="h-5 w-5" />
                                <span>Customer Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{invoice.sale.customer.name}</p>
                                            <p className="text-sm text-muted-foreground">Customer</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{invoice.sale.customer.email}</p>
                                            <p className="text-sm text-muted-foreground">Email Address</p>
                                        </div>
                                    </div>
                                    {invoice.sale.customer.phone && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{invoice.sale.customer.phone}</p>
                                                <p className="text-sm text-muted-foreground">Phone Number</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{invoice.sale.customer.id}</p>
                                            <p className="text-sm text-muted-foreground">Customer ID</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{invoice.sale.paymentMethod}</p>
                                            <p className="text-sm text-muted-foreground">Payment Method</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{invoice.sale.channel}</p>
                                            <p className="text-sm text-muted-foreground">Sales Channel</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="items" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Package className="h-5 w-5" />
                                <span>Invoice Items</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Items Table */}
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">#</TableHead>
                                                <TableHead>Product</TableHead>
                                                <TableHead className="text-center">Qty</TableHead>
                                                <TableHead className="text-right">Unit Price</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoice.sale.saleItems.map((item, index) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{item.product.name}</p>
                                                            {item.product.description && (
                                                                <p className="text-sm text-muted-foreground">{item.product.description}</p>
                                                            )}
                                                            <p className="text-xs text-muted-foreground">ID: {item.product.id}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="secondary">{item.quantity}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {invoice.currencySymbol || "$"}{item.price.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {invoice.currencySymbol || "$"}{(item.quantity * item.price).toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {/* Summary Rows */}
                                            <TableRow className="border-t-2">
                                                <TableCell colSpan={4} className="text-right font-medium">
                                                    Subtotal:
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {invoice.currencySymbol || "$"}{(invoice.amountDue - invoice.taxAmount).toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-right text-muted-foreground">
                                                    Tax ({(invoice.taxRate * 100).toFixed(1)}%):
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {invoice.currencySymbol || "$"}{invoice.taxAmount.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow className="border-t-2">
                                                <TableCell colSpan={4} className="text-right font-bold text-lg">
                                                    Total:
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-lg">
                                                    {invoice.currencySymbol || "$"}{invoice.amountDue.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Items Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center space-x-2">
                                                <Package className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm font-medium text-muted-foreground">Total Items</span>
                                            </div>
                                            <p className="text-2xl font-bold">{invoice.sale.saleItems.length}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center space-x-2">
                                                <Hash className="h-4 w-4 text-green-600" />
                                                <span className="text-sm font-medium text-muted-foreground">Total Quantity</span>
                                            </div>
                                            <p className="text-2xl font-bold">
                                                {invoice.sale.saleItems.reduce((sum, item) => sum + item.quantity, 0)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center space-x-2">
                                                <DollarSign className="h-4 w-4 text-purple-600" />
                                                <span className="text-sm font-medium text-muted-foreground">Avg. Item Value</span>
                                            </div>
                                            <p className="text-2xl font-bold">
                                                {invoice.currencySymbol || "$"}
                                                {((invoice.amountDue - invoice.taxAmount) / invoice.sale.saleItems.length).toFixed(2)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payment" className="space-y-4">
                    {/* Payment Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <CreditCard className="h-5 w-5" />
                                <span>Payment Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Payment Status */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Payment Status</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Current Status:</span>
                                            <InvoiceStatusBadge status={invoice.status} isOverdue={isOverdue} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Payment Method:</span>
                                            <span className="font-medium">{invoice.sale.paymentMethod}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Total Amount:</span>
                                            <span className="font-bold">{invoice.currencySymbol || "$"}{invoice.amountDue.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Paid Amount:</span>
                                            <span className="font-medium text-green-600">{invoice.currencySymbol || "$"}{invoice.paidAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Outstanding:</span>
                                            <span className="font-medium text-red-600">{invoice.currencySymbol || "$"}{(invoice.amountDue - invoice.paidAmount).toFixed(2)}</span>
                                        </div>
                                        {invoice.paidAt && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Payment Date:</span>
                                                <span className="font-medium">{format(new Date(invoice.paidAt), 'MMM d, yyyy')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Progress */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Payment Progress</h4>
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Paid</span>
                                                <span>{((invoice.paidAmount / invoice.amountDue) * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                                                    style={{ width: `${(invoice.paidAmount / invoice.amountDue) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        {/* Currency Information */}
                                        <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                                            <h5 className="font-medium text-sm">Currency Details</h5>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-muted-foreground">Code:</span>
                                                    <span className="ml-1 font-medium">{invoice.currencyCode || "USD"}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Symbol:</span>
                                                    <span className="ml-1 font-medium">{invoice.currencySymbol || "$"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Update Payment Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <RefreshCw className="h-5 w-5" />
                                <span>Update Payment Status</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="payment-status">Payment Status</Label>
                                    <Select defaultValue={invoice.status}>
                                        <SelectTrigger id="payment-status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UNPAID">Unpaid</SelectItem>
                                            <SelectItem value="PARTIAL">Partially Paid</SelectItem>
                                            <SelectItem value="PAID">Fully Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paid-amount">Paid Amount</Label>
                                    <Input
                                        id="paid-amount"
                                        type="number"
                                        step="0.01"
                                        defaultValue={invoice.paidAmount}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payment-notes">Payment Notes</Label>
                                <Textarea
                                    id="payment-notes"
                                    placeholder="Add notes about this payment..."
                                    rows={3}
                                />
                            </div>
                            <div className="flex space-x-2">
                                <Button>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Update Payment
                                </Button>
                                <Button variant="outline">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Reset
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Receipt Information */}
                    {invoice.receipt && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Receipt className="h-5 w-5" />
                                    <span>Receipt Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <span className="text-sm text-muted-foreground">Receipt Number:</span>
                                        <p className="font-medium">{invoice.receipt.receiptNumber}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-sm text-muted-foreground">Issued Date:</span>
                                        <p className="font-medium">{format(new Date(invoice.receipt.issuedAt), 'MMM d, yyyy')}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-sm text-muted-foreground">Email Status:</span>
                                        <Badge variant={invoice.receipt.emailed ? "default" : "secondary"}>
                                            {invoice.receipt.emailed ? "Emailed" : "Not Emailed"}
                                        </Badge>
                                    </div>
                                    {invoice.receipt.emailedAt && (
                                        <div className="space-y-2">
                                            <span className="text-sm text-muted-foreground">Emailed Date:</span>
                                            <p className="font-medium">{format(new Date(invoice.receipt.emailedAt), 'MMM d, yyyy')}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                    {/* Document Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5" />
                                <span>Document Actions</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Button 
                                    className="h-auto p-4 flex flex-col items-center space-y-2"
                                    onClick={handleDownloadPdf}
                                    disabled={isDownloading}
                                >
                                    {isDownloading ? (
                                        <RefreshCw className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <Download className="h-6 w-6" />
                                    )}
                                    <div className="text-center">
                                        <p className="font-medium">
                                            {isDownloading ? 'Generating...' : 'Download PDF'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Save invoice as PDF</p>
                                    </div>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="h-auto p-4 flex flex-col items-center space-y-2"
                                    onClick={handlePrintPdf}
                                >
                                    <Printer className="h-6 w-6" />
                                    <div className="text-center">
                                        <p className="font-medium">Print Invoice</p>
                                        <p className="text-xs text-muted-foreground">Print physical copy</p>
                                    </div>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="h-auto p-4 flex flex-col items-center space-y-2"
                                    onClick={handleCopyLink}
                                >
                                    <Copy className="h-6 w-6" />
                                    <div className="text-center">
                                        <p className="font-medium">Copy Link</p>
                                        <p className="text-xs text-muted-foreground">Share invoice URL</p>
                                    </div>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Communication Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Send className="h-5 w-5" />
                                <span>Communication</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                {/* Email Invoice */}
                                <div className="p-4 border rounded-lg space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                        <h4 className="font-medium">Email Invoice</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="email-to">Email Address</Label>
                                            <Input 
                                                id="email-to"
                                                type="email" 
                                                defaultValue={invoice.sale.customer.email}
                                                placeholder="customer@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email-subject">Subject</Label>
                                            <Input 
                                                id="email-subject"
                                                defaultValue={`Invoice ${invoice.invoiceNumber} from Your Company`}
                                                placeholder="Email subject"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email-message">Message</Label>
                                        <Textarea 
                                            id="email-message"
                                            placeholder="Add a personalized message..."
                                            rows={3}
                                            defaultValue={`Dear ${invoice.sale.customer.name},

Please find attached your invoice ${invoice.invoiceNumber}. 

Thank you for your business!

Best regards,
Your Company`}
                                        />
                                    </div>
                                    <Button 
                                        className="w-full"
                                        onClick={handleFormEmailInvoice}
                                        disabled={isEmailing}
                                    >
                                        {isEmailing ? (
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Mail className="h-4 w-4 mr-2" />
                                        )}
                                        {isEmailing ? 'Sending Email...' : 'Send Invoice via Email'}
                                    </Button>
                                </div>

                                {/* Send Reminder */}
                                {invoice.status !== 'PAID' && (
                                    <div className="p-4 border rounded-lg space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-5 w-5 text-orange-600" />
                                            <h4 className="font-medium">Payment Reminder</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Send a friendly payment reminder to the customer.
                                        </p>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" className="flex-1">
                                                <Clock className="h-4 w-4 mr-2" />
                                                Send Reminder
                                            </Button>
                                            <Button variant="outline" className="flex-1">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Schedule Reminder
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Administrative Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Edit className="h-5 w-5" />
                                <span>Administrative Actions</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Quick Actions Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Button variant="outline" className="justify-start">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Invoice Details
                                    </Button>
                                    <Button variant="outline" className="justify-start">
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Regenerate Invoice
                                    </Button>
                                    <Button variant="outline" className="justify-start">
                                        <Copy className="h-4 w-4 mr-2" />
                                        Duplicate Invoice
                                    </Button>
                                    <Button variant="outline" className="justify-start">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Sale Details
                                    </Button>
                                </div>

                                <Separator />

                                {/* Advanced Actions */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm text-muted-foreground">Advanced Actions</h4>
                                    <div className="space-y-2">
                                        {invoice.status !== 'PAID' && (
                                            <>
                                                <Button variant="outline" className="w-full justify-start text-green-700 border-green-200 hover:bg-green-50">
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Mark as Paid
                                                </Button>
                                                <Button variant="outline" className="w-full justify-start text-blue-700 border-blue-200 hover:bg-blue-50">
                                                    <CreditCard className="h-4 w-4 mr-2" />
                                                    Record Partial Payment
                                                </Button>
                                            </>
                                        )}
                                        {invoice.status === 'PAID' && (
                                            <Button variant="outline" className="w-full justify-start text-orange-700 border-orange-200 hover:bg-orange-50">
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Mark as Unpaid
                                            </Button>
                                        )}
                                        <Button variant="outline" className="w-full justify-start text-red-700 border-red-200 hover:bg-red-50">
                                            <AlertTriangle className="h-4 w-4 mr-2" />
                                            Void Invoice
                                        </Button>
                                    </div>
                                </div>

                                {/* Invoice History */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm text-muted-foreground">Invoice History</h4>
                                    <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span>Created</span>
                                            <span className="text-muted-foreground">{format(new Date(invoice.createdAt), 'MMM d, yyyy \'at\' h:mm a')}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span>Last Updated</span>
                                            <span className="text-muted-foreground">{format(new Date(invoice.updatedAt), 'MMM d, yyyy \'at\' h:mm a')}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span>Invoice Number</span>
                                            <span className="text-muted-foreground font-mono">{invoice.invoiceNumber}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span>Invoice ID</span>
                                            <span className="text-muted-foreground font-mono">{invoice.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Skeleton Component
function InvoiceDetailsSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-32" />
            </div>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <div className="text-right space-y-2">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-6 w-32 mb-1" />
                            <Skeleton className="h-4 w-40" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
