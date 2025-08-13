import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    Download,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    AlertTriangle,
    BarChart3,
} from "lucide-react";
import {
    getProfitLoss,
    getRevenueForecast,
    getTopProducts,
    getSalesOverTime,
    getSalesByChannel,
    getAverageOrderValue,
    getDiscountImpact,
    getStockouts,
    getSlowMovingInventory,
    getSalesForecast,
    getExpenseAnalytics,
    getBudgetAnalytics,
} from "@/api/reports";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { oneDay } from "@/lib/cacheTimes";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function Reports() {
    const { toast } = useToast();
    const { accessToken } = useAuth();
    const [dateRange, setDateRange] = useState({
        startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd"),
    });
    const [period, setPeriod] = useState("month");
    const [activeTab, setActiveTab] = useState("financial");

    // Queries
    const { data: profitLoss, isLoading: profitLossLoading } = useQuery({
        queryKey: ["profitLoss", dateRange],
        queryFn: () => getProfitLoss(accessToken!, dateRange.startDate, dateRange.endDate),
        enabled: !!accessToken,
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    const { data: revenueForecast, isLoading: forecastLoading } = useQuery({
        queryKey: ["revenueForecast", period],
        queryFn: () => getRevenueForecast(accessToken!, period, 3, dateRange.startDate, dateRange.endDate),
        enabled: !!accessToken,
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    const { data: topProducts, isLoading: productsLoading } = useQuery({
        queryKey: ["topProducts", period],
        queryFn: () => getTopProducts(accessToken!, 10, period),
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    const { data: salesOverTime, isLoading: salesLoading } = useQuery({
        queryKey: ["salesOverTime", period],
        queryFn: () => getSalesOverTime(accessToken!, period),
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    const { data: salesByChannel, isLoading: channelLoading } = useQuery({
        queryKey: ["salesByChannel", period],
        queryFn: () => getSalesByChannel(accessToken!, period),
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    const { data: averageOrder, isLoading: orderLoading } = useQuery({
        queryKey: ["averageOrder", period],
        queryFn: () => getAverageOrderValue(accessToken!, period),
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    const { data: discountImpact, isLoading: discountLoading } = useQuery({
        queryKey: ["discountImpact", period],
        queryFn: () => getDiscountImpact(accessToken!, period),
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    const { data: stockouts, isLoading: stockoutsLoading } = useQuery({
        queryKey: ["stockouts", period],
        queryFn: () => getStockouts(accessToken!, period),
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    const { data: slowMoving, isLoading: slowMovingLoading } = useQuery({
        queryKey: ["slowMoving", period],
        queryFn: () => getSlowMovingInventory(accessToken!, period),
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    const { data: salesForecast, isLoading: forecastSalesLoading } = useQuery({
        queryKey: ["salesForecast", period],
        queryFn: () => getSalesForecast(accessToken!, period),
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    const { data: expenseAnalytics, isLoading: expenseLoading } = useQuery({
        queryKey: ["expenseAnalytics", period],
        queryFn: () => getExpenseAnalytics(accessToken!, period),
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    const { data: budgetAnalytics, isLoading: budgetLoading } = useQuery({
        queryKey: ["budgetAnalytics"],
        queryFn: () => getBudgetAnalytics(accessToken!),
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    const handleDownloadReport = async (reportType: string) => {
        try {
            // This would typically generate a PDF report
            toast({
                title: "Report Download",
                description: `${reportType} report download started`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to download report",
                variant: "destructive",
            });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        return `${(value * 100).toFixed(1)}%`;
    };

    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 sm:space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                        Comprehensive financial statements and business reports
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDownloadReport("All")}
                        className="w-full sm:w-auto"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Export All</span>
                        <span className="sm:hidden">Export</span>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Report Filters
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Customize the date range and period for your reports
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate" className="text-sm">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) =>
                                    setDateRange({ ...dateRange, startDate: e.target.value })
                                }
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate" className="text-sm">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) =>
                                    setDateRange({ ...dateRange, endDate: e.target.value })
                                }
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                            <Label htmlFor="period" className="text-sm">Period</Label>
                            <Select value={period} onValueChange={setPeriod}>
                                <SelectTrigger className="text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="day">Daily</SelectItem>
                                    <SelectItem value="week">Weekly</SelectItem>
                                    <SelectItem value="month">Monthly</SelectItem>
                                    <SelectItem value="year">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
                    <TabsTrigger value="financial" className="text-xs sm:text-sm py-2 px-3">
                        <span className="hidden sm:inline">Financial</span>
                        <span className="sm:hidden">Finance</span>
                    </TabsTrigger>
                    <TabsTrigger value="sales" className="text-xs sm:text-sm py-2 px-3">
                        Sales
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="text-xs sm:text-sm py-2 px-3">
                        <span className="hidden sm:inline">Inventory</span>
                        <span className="sm:hidden">Stock</span>
                    </TabsTrigger>
                    <TabsTrigger value="expenses" className="text-xs sm:text-sm py-2 px-3">
                        Expenses
                    </TabsTrigger>
                </TabsList>

                {/* Financial Reports */}
                <TabsContent value="financial" className="space-y-4 sm:space-y-6">
                    {/* Profit & Loss Statement */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Profit & Loss Statement
                                    </CardTitle>
                                    <CardDescription className="text-sm sm:text-base">
                                        {format(new Date(dateRange.startDate), "MMM dd, yyyy")} -{" "}
                                        {format(new Date(dateRange.endDate), "MMM dd, yyyy")}
                                        <br />
                                        <span className="text-xs text-muted-foreground">
                                            * Only approved expenses are included in calculations
                                        </span>
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadReport("Profit & Loss")}
                                    className="w-full sm:w-auto"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {profitLossLoading ? (
                                <div className="flex justify-center items-center h-32 sm:h-40">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                        <p className="text-sm text-muted-foreground">Loading...</p>
                                    </div>
                                </div>
                            ) : profitLoss ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                        <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                                            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700 mb-1">
                                                {formatCurrency(profitLoss.revenue)}
                                            </div>
                                            <div className="text-xs sm:text-sm text-muted-foreground">Revenue</div>
                                        </div>
                                        <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
                                            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-700 mb-1">
                                                {formatCurrency(profitLoss.cogs)}
                                            </div>
                                            <div className="text-xs sm:text-sm text-muted-foreground">Cost of Goods</div>
                                        </div>
                                        <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                                            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700 mb-1">
                                                {formatCurrency(profitLoss.grossProfit)}
                                            </div>
                                            <div className="text-xs sm:text-sm text-muted-foreground">Gross Profit</div>
                                        </div>
                                        <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
                                            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-700 mb-1">
                                                {formatCurrency(profitLoss.netProfit)}
                                            </div>
                                            <div className="text-xs sm:text-sm text-muted-foreground">Net Profit</div>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                                        <div className="flex justify-between sm:justify-center">
                                            <span className="text-muted-foreground">Total Sales:</span>
                                            <span className="font-medium">{profitLoss?.breakdown?.salesCount || 0}</span>
                                        </div>
                                        <div className="flex justify-between sm:justify-center">
                                            <span className="text-muted-foreground">Total Items:</span>
                                            <span className="font-medium">{profitLoss?.breakdown?.saleItemsCount || 0}</span>
                                        </div>
                                        <div className="flex justify-between sm:justify-center">
                                            <span className="text-muted-foreground">Approved Expenses:</span>
                                            <span className="font-medium">{profitLoss?.breakdown?.approvedExpenseCount || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Revenue Forecast */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Revenue Forecast
                                    </CardTitle>
                                    <CardDescription className="text-sm sm:text-base">Projected revenue for the next 3 periods</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadReport("Revenue Forecast")}
                                    className="w-full sm:w-auto"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {forecastLoading ? (
                                <div className="flex justify-center items-center h-32 sm:h-40">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                        <p className="text-sm text-muted-foreground">Loading...</p>
                                    </div>
                                </div>
                            ) : revenueForecast ? (
                                <div className="h-48 sm:h-64 lg:h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={[...(revenueForecast.history || []), ...(revenueForecast.forecast || [])]}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="period" fontSize={12} />
                                            <YAxis fontSize={12} />
                                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#8884d8"
                                                strokeWidth={2}
                                                dot={{ fill: "#8884d8", r: 4 }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="predictedRevenue"
                                                stroke="#82ca9d"
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                                dot={{ fill: "#82ca9d", r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No forecast data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Sales Reports */}
                <TabsContent value="sales" className="space-y-4 sm:space-y-6">
                    {/* Sales Over Time */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Sales Over Time
                                    </CardTitle>
                                    <CardDescription className="text-sm sm:text-base">Sales performance over the selected period</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadReport("Sales Report")}
                                    className="w-full sm:w-auto"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {salesLoading ? (
                                <div className="flex justify-center items-center h-32 sm:h-40">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                        <p className="text-sm text-muted-foreground">Loading...</p>
                                    </div>
                                </div>
                            ) : salesOverTime ? (
                                <div className="h-48 sm:h-64 lg:h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={salesOverTime}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="period" fontSize={12} />
                                            <YAxis fontSize={12} />
                                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                            <Bar dataKey="totalAmount" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No sales data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Products */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Top Products
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base">Best performing products by sales volume</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {productsLoading ? (
                                <div className="flex justify-center items-center h-32 sm:h-40">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                        <p className="text-sm text-muted-foreground">Loading...</p>
                                    </div>
                                </div>
                            ) : topProducts ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-xs sm:text-sm">Product</TableHead>
                                                <TableHead className="text-xs sm:text-sm">Units Sold</TableHead>
                                                <TableHead className="text-xs sm:text-sm">Revenue</TableHead>
                                                <TableHead className="text-xs sm:text-sm">Times Sold</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {topProducts.map((product) => (
                                                <TableRow key={product.productId}>
                                                    <TableCell className="font-medium text-xs sm:text-sm">
                                                        <div className="truncate max-w-24 sm:max-w-32 lg:max-w-48">
                                                            {product.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs sm:text-sm">{product.totalSold}</TableCell>
                                                    <TableCell className="text-xs sm:text-sm">{formatCurrency(product.totalRevenue)}</TableCell>
                                                    <TableCell className="text-xs sm:text-sm">{product.timesSold}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No product data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sales by Channel */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg sm:text-xl">Sales by Channel</CardTitle>
                            <CardDescription className="text-sm sm:text-base">Revenue breakdown by sales channel</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {channelLoading ? (
                                <div className="flex justify-center items-center h-32 sm:h-40">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                        <p className="text-sm text-muted-foreground">Loading...</p>
                                    </div>
                                </div>
                            ) : salesByChannel ? (
                                <div className="h-48 sm:h-64 lg:h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={salesByChannel}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) =>
                                                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                                                }
                                                outerRadius={60}
                                                fill="#8884d8"
                                                dataKey="totalAmount"
                                            >
                                                {salesByChannel.map((_entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No channel data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Average Order Value */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg sm:text-xl">Order Analytics</CardTitle>
                            <CardDescription className="text-sm sm:text-base">Average order value and discount impact</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {orderLoading ? (
                                    <div className="flex justify-center items-center h-32">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                                            <p className="text-xs text-muted-foreground">Loading...</p>
                                        </div>
                                    </div>
                                ) : averageOrder ? (
                                    <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                                        <div className="text-center">
                                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-700 mb-1">
                                                {formatCurrency(averageOrder.averageOrderValue)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Average Order Value</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                            <div>
                                                <div className="font-medium">Total Orders</div>
                                                <div className="text-muted-foreground">{averageOrder.totalOrders}</div>
                                            </div>
                                            <div>
                                                <div className="font-medium">Total Revenue</div>
                                                <div className="text-muted-foreground">
                                                    {formatCurrency(averageOrder.totalAmount)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {discountLoading ? (
                                    <div className="flex justify-center items-center h-32">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                                            <p className="text-xs text-muted-foreground">Loading...</p>
                                        </div>
                                    </div>
                                ) : discountImpact ? (
                                    <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
                                        <div className="text-center">
                                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-700 mb-1">
                                                {formatCurrency(discountImpact.totalDiscount)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Total Discounts</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                            <div>
                                                <div className="font-medium">Discount Rate</div>
                                                <div className="text-muted-foreground">
                                                    {formatPercentage(discountImpact.discountRate)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-medium">Avg Discount</div>
                                                <div className="text-muted-foreground">
                                                    {formatCurrency(discountImpact.averageDiscount)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Inventory Reports */}
                <TabsContent value="inventory" className="space-y-4 sm:space-y-6">
                    {/* Stockouts */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Stockout Alerts
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base">Products currently out of stock</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stockoutsLoading ? (
                                <div className="flex justify-center items-center h-32 sm:h-40">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                        <p className="text-sm text-muted-foreground">Loading...</p>
                                    </div>
                                </div>
                            ) : stockouts && stockouts.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-xs sm:text-sm">Product</TableHead>
                                                <TableHead className="text-xs sm:text-sm">Last Sold</TableHead>
                                                <TableHead className="text-xs sm:text-sm">Total Sold</TableHead>
                                                <TableHead className="text-xs sm:text-sm">Lost Sales</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stockouts.map((item) => (
                                                <TableRow key={item.productId}>
                                                    <TableCell className="font-medium text-xs sm:text-sm">
                                                        <div className="truncate max-w-24 sm:max-w-32 lg:max-w-48">
                                                            {item.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs sm:text-sm">
                                                        {item.lastSold
                                                            ? format(new Date(item.lastSold), "MMM dd, yyyy")
                                                            : "Never"}
                                                    </TableCell>
                                                    <TableCell className="text-xs sm:text-sm">{item.totalSold}</TableCell>
                                                    <TableCell className="text-xs sm:text-sm">{formatCurrency(item.estimatedLostSales)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No stockout alerts
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Slow Moving Inventory */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                <TrendingDown className="h-5 w-5 text-orange-500" />
                                Slow Moving Inventory
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base">Products with low sales velocity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {slowMovingLoading ? (
                                <div className="flex justify-center items-center h-32 sm:h-40">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                        <p className="text-sm text-muted-foreground">Loading...</p>
                                    </div>
                                </div>
                            ) : slowMoving && slowMoving.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-xs sm:text-sm">Product</TableHead>
                                                <TableHead className="text-xs sm:text-sm">Current Stock</TableHead>
                                                <TableHead className="text-xs sm:text-sm">Units Sold</TableHead>
                                                <TableHead className="text-xs sm:text-sm">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {slowMoving.map((item) => (
                                                <TableRow key={item.productId}>
                                                    <TableCell className="font-medium text-xs sm:text-sm">
                                                        <div className="truncate max-w-24 sm:max-w-32 lg:max-w-48">
                                                            {item.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs sm:text-sm">{item.stock}</TableCell>
                                                    <TableCell className="text-xs sm:text-sm">{item.totalSold}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="text-xs">Slow Moving</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No slow moving inventory
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sales Forecast */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Sales Forecast
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base">Projected sales for the next 3 periods</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {forecastSalesLoading ? (
                                <div className="flex justify-center items-center h-32 sm:h-40">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                        <p className="text-sm text-muted-foreground">Loading...</p>
                                    </div>
                                </div>
                            ) : salesForecast ? (
                                <div className="h-48 sm:h-64 lg:h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={salesForecast}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="period" fontSize={12} />
                                            <YAxis fontSize={12} />
                                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                            <Bar dataKey="forecast" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No forecast data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Expense Reports */}
                <TabsContent value="expenses" className="space-y-4 sm:space-y-6">
                    {/* Expense Analytics */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg sm:text-xl">Expense Overview</CardTitle>
                            <CardDescription className="text-sm sm:text-base">Expense summary and breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {expenseLoading ? (
                                <div className="flex justify-center items-center h-32 sm:h-40">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                        <p className="text-sm text-muted-foreground">Loading...</p>
                                    </div>
                                </div>
                            ) : expenseAnalytics ? (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                    <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
                                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-700 mb-1">
                                            {formatCurrency(expenseAnalytics.totalAmount)}
                                        </div>
                                        <div className="text-xs sm:text-sm text-muted-foreground">Total Expenses</div>
                                    </div>
                                    <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700 mb-1">
                                            {expenseAnalytics.totalCount}
                                        </div>
                                        <div className="text-xs sm:text-sm text-muted-foreground">Total Transactions</div>
                                    </div>
                                    <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700 mb-1">
                                            {expenseAnalytics.approvedCount}
                                        </div>
                                        <div className="text-xs sm:text-sm text-muted-foreground">Approved</div>
                                    </div>
                                    <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
                                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-700 mb-1">
                                            {expenseAnalytics.pendingCount}
                                        </div>
                                        <div className="text-xs sm:text-sm text-muted-foreground">Pending</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No expense data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Budget Analytics */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg sm:text-xl">Budget Tracking</CardTitle>
                            <CardDescription className="text-sm sm:text-base">Budget utilization and performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {budgetLoading ? (
                                <div className="flex justify-center items-center h-32 sm:h-40">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                        <p className="text-sm text-muted-foreground">Loading...</p>
                                    </div>
                                </div>
                            ) : budgetAnalytics && budgetAnalytics.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-xs sm:text-sm">Category</TableHead>
                                                <TableHead className="text-xs sm:text-sm">Allocated</TableHead>
                                                <TableHead className="text-xs sm:text-sm">Spent</TableHead>
                                                <TableHead className="text-xs sm:text-sm">Utilization</TableHead>
                                                <TableHead className="text-xs sm:text-sm">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {budgetAnalytics.map((budget) => (
                                                <TableRow key={budget.id}>
                                                    <TableCell className="font-medium text-xs sm:text-sm">
                                                        <div className="truncate max-w-20 sm:max-w-32 lg:max-w-48">
                                                            {budget.category?.name || "Unknown"}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs sm:text-sm">{formatCurrency(budget.allocated)}</TableCell>
                                                    <TableCell className="text-xs sm:text-sm">{formatCurrency(budget.spent)}</TableCell>
                                                    <TableCell className="text-xs sm:text-sm">{budget.utilization.toFixed(1)}%</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                budget.status === "exceeded"
                                                                    ? "destructive"
                                                                    : budget.status === "warning"
                                                                        ? "secondary"
                                                                        : "default"
                                                            }
                                                            className="text-xs"
                                                        >
                                                            {budget.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No budget data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 