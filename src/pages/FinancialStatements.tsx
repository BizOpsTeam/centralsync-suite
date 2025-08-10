import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calendar, Download, FileText, TrendingUp, DollarSign, CreditCard, BarChart3, Building2, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
    generateProfitLossStatement,
    generateCashFlowStatement,
    generateBalanceSheet,
    getFinancialSummary,
    downloadProfitLossPdf,
    downloadCashFlowPdf,
    downloadBalanceSheetPdf,
    generateLoanApplicationPackage,
    getCurrentYearPeriod,
    getPreviousYearPeriod,
    getCurrentQuarterPeriod,
    getCurrentMonthPeriod,
    formatCurrency,
    formatPercentage,
    type ProfitLossStatement,
    type CashFlowStatement,
    type BalanceSheet,
} from '@/api/financialStatements';

export default function FinancialStatements() {
    const { accessToken } = useAuth();
    const { toast } = useToast();
    
    // State for date range selection
    const [dateRange, setDateRange] = useState(() => getCurrentYearPeriod());
    const [periodType, setPeriodType] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'>('YEARLY');
    const [balanceSheetDate, setBalanceSheetDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Loading states for PDF downloads
    const [downloadingPL, setDownloadingPL] = useState(false);
    const [downloadingCF, setDownloadingCF] = useState(false);
    const [downloadingBS, setDownloadingBS] = useState(false);

    // Fetch financial summary
    const { data: summary, isLoading: isLoadingSummary } = useQuery({
        queryKey: ['financialSummary'],
        queryFn: () => getFinancialSummary(accessToken!),
        enabled: !!accessToken,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch Profit & Loss Statement
    const { 
        data: profitLoss, 
        isLoading: isLoadingPL, 
        refetch: refetchPL,
        error: errorPL 
    } = useQuery({
        queryKey: ['profitLoss', dateRange.startDate, dateRange.endDate, periodType],
        queryFn: () => generateProfitLossStatement(accessToken!, dateRange.startDate, dateRange.endDate, periodType),
        enabled: !!accessToken,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 1,
    });

    // Fetch Cash Flow Statement
    const { 
        data: cashFlow, 
        isLoading: isLoadingCF, 
        refetch: refetchCF,
        error: errorCF 
    } = useQuery({
        queryKey: ['cashFlow', dateRange.startDate, dateRange.endDate, periodType],
        queryFn: () => generateCashFlowStatement(accessToken!, dateRange.startDate, dateRange.endDate, periodType),
        enabled: !!accessToken,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 1,
    });

    // Fetch Balance Sheet
    const { 
        data: balanceSheet, 
        isLoading: isLoadingBS, 
        refetch: refetchBS,
        error: errorBS 
    } = useQuery({
        queryKey: ['balanceSheet', balanceSheetDate],
        queryFn: () => generateBalanceSheet(accessToken!, balanceSheetDate),
        enabled: !!accessToken,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 1,
    });

    // Loan application package mutation
    const loanPackageMutation = useMutation({
        mutationFn: (periods: Array<{ startDate: string; endDate: string; periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM' }>) =>
            generateLoanApplicationPackage(accessToken!, periods),
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Loan application package generated successfully!',
            });
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'Failed to generate loan application package',
                variant: 'destructive',
            });
        },
    });

    // Handle quick period selection
    const handleQuickPeriod = (period: 'current-year' | 'previous-year' | 'current-quarter' | 'current-month') => {
        switch (period) {
            case 'current-year':
                setDateRange(getCurrentYearPeriod());
                setPeriodType('YEARLY');
                break;
            case 'previous-year':
                setDateRange(getPreviousYearPeriod());
                setPeriodType('YEARLY');
                break;
            case 'current-quarter':
                setDateRange(getCurrentQuarterPeriod());
                setPeriodType('QUARTERLY');
                break;
            case 'current-month':
                setDateRange(getCurrentMonthPeriod());
                setPeriodType('MONTHLY');
                break;
        }
    };

    // Handle PDF downloads
    const handleDownloadPL = async () => {
        if (!accessToken) return;
        setDownloadingPL(true);
        try {
            const blob = await downloadProfitLossPdf(accessToken, dateRange.startDate, dateRange.endDate, periodType);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `profit-loss-${dateRange.startDate}-to-${dateRange.endDate}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast({
                title: 'Success',
                description: 'Profit & Loss statement downloaded successfully!',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to download Profit & Loss statement',
                variant: 'destructive',
            });
        } finally {
            setDownloadingPL(false);
        }
    };

    const handleDownloadCF = async () => {
        if (!accessToken) return;
        setDownloadingCF(true);
        try {
            const blob = await downloadCashFlowPdf(accessToken, dateRange.startDate, dateRange.endDate, periodType);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `cash-flow-${dateRange.startDate}-to-${dateRange.endDate}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast({
                title: 'Success',
                description: 'Cash Flow statement downloaded successfully!',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to download Cash Flow statement',
                variant: 'destructive',
            });
        } finally {
            setDownloadingCF(false);
        }
    };

    const handleDownloadBS = async () => {
        if (!accessToken) return;
        setDownloadingBS(true);
        try {
            const blob = await downloadBalanceSheetPdf(accessToken, balanceSheetDate);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `balance-sheet-${balanceSheetDate}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast({
                title: 'Success',
                description: 'Balance Sheet downloaded successfully!',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to download Balance Sheet',
                variant: 'destructive',
            });
        } finally {
            setDownloadingBS(false);
        }
    };

    // Handle loan application package generation
    const handleGenerateLoanPackage = () => {
        const currentYear = getCurrentYearPeriod();
        const previousYear = getPreviousYearPeriod();
        
        loanPackageMutation.mutate([
            { ...currentYear, periodType: 'YEARLY' },
            { ...previousYear, periodType: 'YEARLY' },
        ]);
    };

    return (
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                <div className="space-y-1 sm:space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Financial Statements</h1>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                        Generate professional financial reports for business analysis and loan applications
                    </p>
                </div>
                <Button 
                    onClick={handleGenerateLoanPackage}
                    disabled={loanPackageMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    size="sm"
                >
                    {loanPackageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Building2 className="h-4 w-4 mr-2" />
                    )}
                    <span className="hidden sm:inline">Generate Loan Package</span>
                    <span className="sm:hidden">Loan Package</span>
                </Button>
            </div>

            {/* Financial Summary Cards */}
            {!isLoadingSummary && summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Net Revenue</span>
                            </div>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">{formatCurrency(summary.profitLoss.revenue, 'GH₵')}</p>
                            <div className="flex items-center space-x-1 text-xs sm:text-sm">
                                <TrendingUp className="h-3 w-3 text-green-500 flex-shrink-0" />
                                <span className="text-green-600 truncate">{formatPercentage(summary.growth.revenueGrowth)}</span>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <BarChart3 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Net Income</span>
                            </div>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">{formatCurrency(summary.profitLoss.netIncome, 'GH₵')}</p>
                            <div className="flex items-center space-x-1 text-xs sm:text-sm">
                                <TrendingUp className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                <span className="text-blue-600 truncate">{formatPercentage(summary.growth.netIncomeGrowth)}</span>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <CreditCard className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Operating Cash</span>
                            </div>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">{formatCurrency(summary.cashFlow.operatingCash, 'GH₵')}</p>
                            <div className="flex items-center space-x-1 text-xs sm:text-sm">
                                <span className="text-purple-600 truncate">Operating Activities</span>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <Building2 className="h-4 w-4 text-orange-600 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Assets</span>
                            </div>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">{formatCurrency(summary.balanceSheet.totalAssets, 'GH₵')}</p>
                            <div className="flex items-center space-x-1 text-xs sm:text-sm">
                                <span className="text-orange-600 truncate">Ratio: {summary.balanceSheet.currentRatio.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Date Range Controls */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Calendar className="h-5 w-5" />
                        Period Selection
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Select the time period for generating financial statements
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleQuickPeriod('current-year')}
                            className="text-xs sm:text-sm"
                        >
                            Current Year
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleQuickPeriod('previous-year')}
                            className="text-xs sm:text-sm"
                        >
                            Previous Year
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleQuickPeriod('current-quarter')}
                            className="text-xs sm:text-sm"
                        >
                            Current Quarter
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleQuickPeriod('current-month')}
                            className="text-xs sm:text-sm"
                        >
                            Current Month
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate" className="text-sm">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate" className="text-sm">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="periodType" className="text-sm">Period Type</Label>
                            <Select value={periodType} onValueChange={(value: any) => setPeriodType(value)}>
                                <SelectTrigger className="text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                    <SelectItem value="YEARLY">Yearly</SelectItem>
                                    <SelectItem value="CUSTOM">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="balanceSheetDate" className="text-sm">Balance Sheet Date</Label>
                            <Input
                                id="balanceSheetDate"
                                type="date"
                                value={balanceSheetDate}
                                onChange={(e) => setBalanceSheetDate(e.target.value)}
                                className="text-sm"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Financial Statements Tabs */}
            <Tabs defaultValue="profit-loss" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                    <TabsTrigger value="profit-loss" className="text-xs sm:text-sm py-2 px-3">
                        <span className="hidden sm:inline">Profit & Loss</span>
                        <span className="sm:hidden">P&L</span>
                    </TabsTrigger>
                    <TabsTrigger value="cash-flow" className="text-xs sm:text-sm py-2 px-3">
                        <span className="hidden sm:inline">Cash Flow</span>
                        <span className="sm:hidden">Cash</span>
                    </TabsTrigger>
                    <TabsTrigger value="balance-sheet" className="text-xs sm:text-sm py-2 px-3">
                        <span className="hidden sm:inline">Balance Sheet</span>
                        <span className="sm:hidden">Balance</span>
                    </TabsTrigger>
                </TabsList>

                {/* Profit & Loss Tab */}
                <TabsContent value="profit-loss" className="space-y-4">
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                        <FileText className="h-5 w-5" />
                                        Profit & Loss Statement
                                    </CardTitle>
                                    <CardDescription className="text-sm sm:text-base">
                                        Comprehensive income statement showing revenue, expenses, and net income
                                    </CardDescription>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => refetchPL()}
                                        disabled={isLoadingPL}
                                        size="sm"
                                        className="w-full sm:w-auto"
                                    >
                                        Refresh
                                    </Button>
                                    <Button 
                                        onClick={handleDownloadPL}
                                        disabled={downloadingPL || !profitLoss}
                                        size="sm"
                                        className="w-full sm:w-auto"
                                    >
                                        {downloadingPL ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Download className="h-4 w-4 mr-2" />
                                        )}
                                        Download PDF
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoadingPL ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : profitLoss ? (
                                <ProfitLossDisplay data={profitLoss} />
                            ) : errorPL ? (
                                <div className="text-center text-muted-foreground py-8">
                                    Error loading profit & loss
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No data available for the selected period
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Cash Flow Tab */}
                <TabsContent value="cash-flow" className="space-y-4">
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                        <TrendingUp className="h-5 w-5" />
                                        Cash Flow Statement
                                    </CardTitle>
                                    <CardDescription className="text-sm sm:text-base">
                                        Cash flows from operating, investing, and financing activities
                                    </CardDescription>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => refetchCF()}
                                        disabled={isLoadingCF}
                                        size="sm"
                                        className="w-full sm:w-auto"
                                    >
                                        Refresh
                                    </Button>
                                    <Button 
                                        onClick={handleDownloadCF}
                                        disabled={downloadingCF || !cashFlow}
                                        size="sm"
                                        className="w-full sm:w-auto"
                                    >
                                        {downloadingCF ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Download className="h-4 w-4 mr-2" />
                                        )}
                                        Download PDF
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoadingCF ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : cashFlow ? (
                                <CashFlowDisplay data={cashFlow} />
                            ) : errorCF ? (
                                <div className="text-center text-muted-foreground py-8">
                                    Error loading cash flow
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No data available for the selected period
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Balance Sheet Tab */}
                <TabsContent value="balance-sheet" className="space-y-4">
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                        <BarChart3 className="h-5 w-5" />
                                        Balance Sheet
                                    </CardTitle>
                                    <CardDescription className="text-sm sm:text-base">
                                        Financial position showing assets, liabilities, and equity
                                    </CardDescription>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => refetchBS()}
                                        disabled={isLoadingBS}
                                        size="sm"
                                        className="w-full sm:w-auto"
                                    >
                                        Refresh
                                    </Button>
                                    <Button 
                                        onClick={handleDownloadBS}
                                        disabled={downloadingBS || !balanceSheet}
                                        size="sm"
                                        className="w-full sm:w-auto"
                                    >
                                        {downloadingBS ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Download className="h-4 w-4 mr-2" />
                                        )}
                                        Download PDF
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoadingBS ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : balanceSheet ? (
                                <BalanceSheetDisplay data={balanceSheet} />
                            ) : errorBS ? (
                                <div className="text-center text-muted-foreground py-8">
                                    Error loading balance sheet
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No data available for the selected date
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Component to display Profit & Loss data
function ProfitLossDisplay({ data }: { data: ProfitLossStatement }) {
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Net Revenue</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700 break-words">{formatCurrency(data.revenue.netRevenue, data.companyInfo.currencySymbol)}</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Gross Profit</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700 break-words">{formatCurrency(data.grossProfit, data.companyInfo.currencySymbol)}</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg sm:col-span-2 lg:col-span-1">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Net Income</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-700 break-words">{formatCurrency(data.netIncome, data.companyInfo.currencySymbol)}</p>
                </div>
            </div>

            {/* Financial Ratios */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                <div className="text-center p-2 sm:p-3 border rounded">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Gross Margin</p>
                    <p className="text-sm sm:text-lg font-semibold">{formatPercentage(data.ratios.grossMargin)}</p>
                </div>
                <div className="text-center p-2 sm:p-3 border rounded">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Operating Margin</p>
                    <p className="text-sm sm:text-lg font-semibold">{formatPercentage(data.ratios.operatingMargin)}</p>
                </div>
                <div className="text-center p-2 sm:p-3 border rounded">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Net Margin</p>
                    <p className="text-sm sm:text-lg font-semibold">{formatPercentage(data.ratios.netMargin)}</p>
                </div>
                <div className="text-center p-2 sm:p-3 border rounded">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Sales Count</p>
                    <p className="text-sm sm:text-lg font-semibold">{data.revenue.salesCount}</p>
                </div>
            </div>

            {/* Growth Indicators */}
            {data.comparison.previousPeriod && (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-sm sm:text-base">Growth vs Previous Period</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm">Revenue Growth:</span>
                            <Badge variant={data.comparison.growth.revenueGrowth >= 0 ? "default" : "destructive"} className="text-xs">
                                {formatPercentage(data.comparison.growth.revenueGrowth)}
                            </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm">Gross Profit Growth:</span>
                            <Badge variant={data.comparison.growth.grossProfitGrowth >= 0 ? "default" : "destructive"} className="text-xs">
                                {formatPercentage(data.comparison.growth.grossProfitGrowth)}
                            </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm">Net Income Growth:</span>
                            <Badge variant={data.comparison.growth.netIncomeGrowth >= 0 ? "default" : "destructive"} className="text-xs">
                                {formatPercentage(data.comparison.growth.netIncomeGrowth)}
                            </Badge>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Component to display Cash Flow data
function CashFlowDisplay({ data }: { data: CashFlowStatement }) {
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Cash Flow Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Operating Cash</p>
                    <p className="text-lg sm:text-xl font-bold text-green-700 break-words">{formatCurrency(data.operatingActivities.netOperatingCash, data.companyInfo.currencySymbol)}</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Investing Cash</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-700 break-words">{formatCurrency(data.investingActivities.netInvestingCash, data.companyInfo.currencySymbol)}</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Financing Cash</p>
                    <p className="text-lg sm:text-xl font-bold text-purple-700 break-words">{formatCurrency(data.financingActivities.netFinancingCash, data.companyInfo.currencySymbol)}</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg sm:col-span-2 lg:col-span-1">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Net Cash Flow</p>
                    <p className="text-lg sm:text-xl font-bold text-orange-700 break-words">{formatCurrency(data.netCashFlow, data.companyInfo.currencySymbol)}</p>
                </div>
            </div>

            {/* Cash Flow Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Operating Activities */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm sm:text-base">Operating Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs sm:text-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                            <span className="truncate">Cash from Sales:</span>
                            <span className="font-medium text-right">{formatCurrency(data.operatingActivities.cashFromSales, data.companyInfo.currencySymbol)}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                            <span className="truncate">Cash from Customers:</span>
                            <span className="font-medium text-right">{formatCurrency(data.operatingActivities.cashFromCustomers, data.companyInfo.currencySymbol)}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                            <span className="truncate">Cash to Suppliers:</span>
                            <span className="font-medium text-red-600 text-right">({formatCurrency(data.operatingActivities.cashToSuppliers, data.companyInfo.currencySymbol)})</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                            <span className="truncate">Cash for Expenses:</span>
                            <span className="font-medium text-red-600 text-right">({formatCurrency(data.operatingActivities.cashForExpenses, data.companyInfo.currencySymbol)})</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Investing Activities */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm sm:text-base">Investing Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs sm:text-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                            <span className="truncate">Equipment Purchases:</span>
                            <span className="font-medium text-red-600 text-right">({formatCurrency(data.investingActivities.equipmentPurchases, data.companyInfo.currencySymbol)})</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                            <span className="truncate">Asset Sales:</span>
                            <span className="font-medium text-right">{formatCurrency(data.investingActivities.assetSales, data.companyInfo.currencySymbol)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Financing Activities */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm sm:text-base">Financing Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs sm:text-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                            <span className="truncate">Owner Investments:</span>
                            <span className="font-medium text-right">{formatCurrency(data.financingActivities.ownerInvestments, data.companyInfo.currencySymbol)}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                            <span className="truncate">Loan Payments:</span>
                            <span className="font-medium text-red-600 text-right">({formatCurrency(data.financingActivities.loanPayments, data.companyInfo.currencySymbol)})</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Component to display Balance Sheet data
function BalanceSheetDisplay({ data }: { data: BalanceSheet }) {
    const isBalanced = Math.abs(data.assets.totalAssets - data.totalLiabilitiesAndEquity) < 0.01;
    
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Balance Check */}
            <div className={`p-3 sm:p-4 rounded-lg border-2 ${isBalanced ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-4">
                    <div className="text-center">
                        <p className="text-xs sm:text-sm text-muted-foreground">Total Assets</p>
                        <p className="text-lg sm:text-xl font-bold break-words">{formatCurrency(data.assets.totalAssets, data.companyInfo.currencySymbol)}</p>
                    </div>
                    <div className="text-lg sm:text-2xl font-bold">=</div>
                    <div className="text-center">
                        <p className="text-xs sm:text-sm text-muted-foreground">Liabilities + Equity</p>
                        <p className="text-lg sm:text-xl font-bold break-words">{formatCurrency(data.totalLiabilitiesAndEquity, data.companyInfo.currencySymbol)}</p>
                    </div>
                    {!isBalanced && (
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mx-auto sm:mx-0" />
                    )}
                </div>
            </div>

            {/* Balance Sheet Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Assets */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg sm:text-xl">Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Current Assets */}
                        <div>
                            <h4 className="font-semibold mb-2 text-sm sm:text-base">Current Assets</h4>
                            <div className="space-y-1 text-xs sm:text-sm pl-2 sm:pl-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <span className="truncate">Cash & Cash Equivalents:</span>
                                    <span className="font-medium text-right">{formatCurrency(data.assets.currentAssets.cash, data.companyInfo.currencySymbol)}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <span className="truncate">Accounts Receivable:</span>
                                    <span className="font-medium text-right">{formatCurrency(data.assets.currentAssets.accountsReceivable, data.companyInfo.currencySymbol)}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <span className="truncate">Inventory:</span>
                                    <span className="font-medium text-right">{formatCurrency(data.assets.currentAssets.inventory, data.companyInfo.currencySymbol)}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 font-medium border-t pt-1">
                                    <span className="truncate">Total Current Assets:</span>
                                    <span className="text-right">{formatCurrency(data.assets.currentAssets.totalCurrentAssets, data.companyInfo.currencySymbol)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Fixed Assets */}
                        <div>
                            <h4 className="font-semibold mb-2 text-sm sm:text-base">Fixed Assets</h4>
                            <div className="space-y-1 text-xs sm:text-sm pl-2 sm:pl-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <span className="truncate">Equipment:</span>
                                    <span className="font-medium text-right">{formatCurrency(data.assets.fixedAssets.equipment, data.companyInfo.currencySymbol)}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <span className="truncate">Less: Depreciation:</span>
                                    <span className="font-medium text-right">({formatCurrency(data.assets.fixedAssets.accumulatedDepreciation, data.companyInfo.currencySymbol)})</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 font-medium border-t pt-1">
                                    <span className="truncate">Net Fixed Assets:</span>
                                    <span className="text-right">{formatCurrency(data.assets.fixedAssets.netFixedAssets, data.companyInfo.currencySymbol)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center font-bold text-base sm:text-lg border-t-2 pt-2">
                            <span className="truncate">TOTAL ASSETS:</span>
                            <span className="text-right">{formatCurrency(data.assets.totalAssets, data.companyInfo.currencySymbol)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Liabilities & Equity */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg sm:text-xl">Liabilities & Equity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Current Liabilities */}
                        <div>
                            <h4 className="font-semibold mb-2 text-sm sm:text-base">Current Liabilities</h4>
                            <div className="space-y-1 text-xs sm:text-sm pl-2 sm:pl-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <span className="truncate">Accounts Payable:</span>
                                    <span className="font-medium text-right">{formatCurrency(data.liabilities.currentLiabilities.accountsPayable, data.companyInfo.currencySymbol)}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <span className="truncate">Accrued Expenses:</span>
                                    <span className="font-medium text-right">{formatCurrency(data.liabilities.currentLiabilities.accrualExpenses, data.companyInfo.currencySymbol)}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 font-medium border-t pt-1">
                                    <span className="truncate">Total Current Liabilities:</span>
                                    <span className="text-right">{formatCurrency(data.liabilities.currentLiabilities.totalCurrentLiabilities, data.companyInfo.currencySymbol)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Long-term Liabilities */}
                        <div>
                            <h4 className="font-semibold mb-2 text-sm sm:text-base">Long-term Liabilities</h4>
                            <div className="space-y-1 text-xs sm:text-sm pl-2 sm:pl-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <span className="truncate">Long-term Loans:</span>
                                    <span className="font-medium text-right">{formatCurrency(data.liabilities.longTermLiabilities.loans, data.companyInfo.currencySymbol)}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 font-medium border-t pt-1">
                                    <span className="truncate">Total Long-term Liabilities:</span>
                                    <span className="text-right">{formatCurrency(data.liabilities.longTermLiabilities.totalLongTermLiabilities, data.companyInfo.currencySymbol)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center font-medium border-t pt-2">
                            <span className="truncate">TOTAL LIABILITIES:</span>
                            <span className="text-right">{formatCurrency(data.liabilities.totalLiabilities, data.companyInfo.currencySymbol)}</span>
                        </div>

                        {/* Equity */}
                        <div>
                            <h4 className="font-semibold mb-2 text-sm sm:text-base">Owner's Equity</h4>
                            <div className="space-y-1 text-xs sm:text-sm pl-2 sm:pl-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <span className="truncate">Owner's Capital:</span>
                                    <span className="font-medium text-right">{formatCurrency(data.equity.ownerEquity, data.companyInfo.currencySymbol)}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <span className="truncate">Retained Earnings:</span>
                                    <span className="font-medium text-right">{formatCurrency(data.equity.retainedEarnings, data.companyInfo.currencySymbol)}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 font-medium border-t pt-1">
                                    <span className="truncate">Total Equity:</span>
                                    <span className="text-right">{formatCurrency(data.equity.totalEquity, data.companyInfo.currencySymbol)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center font-bold text-base sm:text-lg border-t-2 pt-2">
                            <span className="truncate">TOTAL LIABILITIES & EQUITY:</span>
                            <span className="text-right">{formatCurrency(data.totalLiabilitiesAndEquity, data.companyInfo.currencySymbol)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
