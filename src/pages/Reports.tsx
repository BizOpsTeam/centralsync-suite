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
    });

    const { data: revenueForecast, isLoading: forecastLoading } = useQuery({
        queryKey: ["revenueForecast", period],
        queryFn: () => getRevenueForecast(accessToken!, period, 3, dateRange.startDate, dateRange.endDate),
        enabled: !!accessToken,
    });

    const { data: topProducts, isLoading: productsLoading } = useQuery({
        queryKey: ["topProducts", period],
        queryFn: () => getTopProducts(accessToken!, 10, period),
    });



    const { data: salesOverTime, isLoading: salesLoading } = useQuery({
        queryKey: ["salesOverTime", period],
        queryFn: () => getSalesOverTime(accessToken!, period),
    });

    const { data: salesByChannel, isLoading: channelLoading } = useQuery({
        queryKey: ["salesByChannel", period],
        queryFn: () => getSalesByChannel(accessToken!, period),
    });



    const { data: averageOrder, isLoading: orderLoading } = useQuery({
        queryKey: ["averageOrder", period],
        queryFn: () => getAverageOrderValue(accessToken!, period),
    });

    const { data: discountImpact, isLoading: discountLoading } = useQuery({
        queryKey: ["discountImpact", period],
        queryFn: () => getDiscountImpact(accessToken!, period),
    });

    const { data: stockouts, isLoading: stockoutsLoading } = useQuery({
        queryKey: ["stockouts", period],
        queryFn: () => getStockouts(accessToken!, period),
    });

    const { data: slowMoving, isLoading: slowMovingLoading } = useQuery({
        queryKey: ["slowMoving", period],
        queryFn: () => getSlowMovingInventory(accessToken!, period),
    });

    const { data: salesForecast, isLoading: forecastSalesLoading } = useQuery({
        queryKey: ["salesForecast", period],
        queryFn: () => getSalesForecast(accessToken!, period),
    });

    const { data: expenseAnalytics, isLoading: expenseLoading } = useQuery({
        queryKey: ["expenseAnalytics", period],
        queryFn: () => getExpenseAnalytics(accessToken!, period),
    });

    const { data: budgetAnalytics, isLoading: budgetLoading } = useQuery({
        queryKey: ["budgetAnalytics"],
        queryFn: () => getBudgetAnalytics(accessToken!),
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-muted-foreground">
                        Comprehensive financial statements and business reports
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={() => handleDownloadReport("All")}>
                        <Download className="mr-2 h-4 w-4" />
                        Export All
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Report Filters</CardTitle>
                    <CardDescription>
                        Customize the date range and period for your reports
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) =>
                                    setDateRange({ ...dateRange, startDate: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) =>
                                    setDateRange({ ...dateRange, endDate: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="period">Period</Label>
                            <Select value={period} onValueChange={setPeriod}>
                                <SelectTrigger>
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="financial">Financial</TabsTrigger>
                    <TabsTrigger value="sales">Sales</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                </TabsList>

                {/* Financial Reports */}
                <TabsContent value="financial" className="space-y-6">
                    {/* Profit & Loss Statement */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Profit & Loss Statement</CardTitle>
                                    <CardDescription>
                                        {format(new Date(dateRange.startDate), "MMM dd, yyyy")} -{" "}
                                        {format(new Date(dateRange.endDate), "MMM dd, yyyy")}
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadReport("Profit & Loss")}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {profitLossLoading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : profitLoss ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {formatCurrency(profitLoss.revenue)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Revenue</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">
                                                {formatCurrency(profitLoss.cogs)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Cost of Goods</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {formatCurrency(profitLoss.grossProfit)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Gross Profit</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {formatCurrency(profitLoss.netProfit)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Net Profit</div>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>Total Sales: {profitLoss?.breakdown?.salesCount || 0}</div>
                                        <div>Total Items: {profitLoss?.breakdown?.saleItemsCount || 0}</div>
                                        <div>Total Expenses: {profitLoss?.breakdown?.expenseCount || 0}</div>
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
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Revenue Forecast</CardTitle>
                                    <CardDescription>Projected revenue for the next 3 periods</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadReport("Revenue Forecast")}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {forecastLoading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : revenueForecast ? (
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={[...(revenueForecast.history || []), ...(revenueForecast.forecast || [])]}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="period" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#8884d8"
                                                strokeWidth={2}
                                                dot={{ fill: "#8884d8" }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="predictedRevenue"
                                                stroke="#82ca9d"
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                                dot={{ fill: "#82ca9d" }}
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
                <TabsContent value="sales" className="space-y-6">
                    {/* Sales Over Time */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Sales Over Time</CardTitle>
                                    <CardDescription>Sales performance over the selected period</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadReport("Sales Report")}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {salesLoading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : salesOverTime ? (
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={salesOverTime}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="period" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                            <Bar dataKey="totalAmount" fill="#8884d8" />
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Products</CardTitle>
                            <CardDescription>Best performing products by sales volume</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {productsLoading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : topProducts ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Units Sold</TableHead>
                                            <TableHead>Revenue</TableHead>
                                            <TableHead>Times Sold</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topProducts.map((product) => (
                                            <TableRow key={product.productId}>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell>{product.totalSold}</TableCell>
                                                <TableCell>{formatCurrency(product.totalRevenue)}</TableCell>
                                                <TableCell>{product.timesSold}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No product data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sales by Channel */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales by Channel</CardTitle>
                            <CardDescription>Revenue breakdown by sales channel</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {channelLoading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : salesByChannel ? (
                                <div className="h-80">
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
                                                outerRadius={80}
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Analytics</CardTitle>
                            <CardDescription>Average order value and discount impact</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {orderLoading ? (
                                    <div className="text-center py-8">Loading...</div>
                                ) : averageOrder ? (
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-green-600">
                                                {formatCurrency(averageOrder.averageOrderValue)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Average Order Value</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
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
                                    <div className="text-center py-8">Loading...</div>
                                ) : discountImpact ? (
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-orange-600">
                                                {formatCurrency(discountImpact.totalDiscount)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Total Discounts</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
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
                <TabsContent value="inventory" className="space-y-6">
                    {/* Stockouts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stockout Alerts</CardTitle>
                            <CardDescription>Products currently out of stock</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stockoutsLoading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : stockouts && stockouts.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Last Sold</TableHead>
                                            <TableHead>Total Sold</TableHead>
                                            <TableHead>Estimated Lost Sales</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stockouts.map((item) => (
                                            <TableRow key={item.productId}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>
                                                    {item.lastSold
                                                        ? format(new Date(item.lastSold), "MMM dd, yyyy")
                                                        : "Never"}
                                                </TableCell>
                                                <TableCell>{item.totalSold}</TableCell>
                                                <TableCell>{formatCurrency(item.estimatedLostSales)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No stockout alerts
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Slow Moving Inventory */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Slow Moving Inventory</CardTitle>
                            <CardDescription>Products with low sales velocity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {slowMovingLoading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : slowMoving && slowMoving.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Current Stock</TableHead>
                                            <TableHead>Units Sold</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {slowMoving.map((item) => (
                                            <TableRow key={item.productId}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.stock}</TableCell>
                                                <TableCell>{item.totalSold}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">Slow Moving</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No slow moving inventory
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sales Forecast */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Forecast</CardTitle>
                            <CardDescription>Projected sales for the next 3 periods</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {forecastSalesLoading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : salesForecast ? (
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={salesForecast}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="period" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                            <Bar dataKey="forecast" fill="#82ca9d" />
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
                <TabsContent value="expenses" className="space-y-6">
                    {/* Expense Analytics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Expense Overview</CardTitle>
                            <CardDescription>Expense summary and breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {expenseLoading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : expenseAnalytics ? (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">
                                            {formatCurrency(expenseAnalytics.totalAmount)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Total Expenses</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {expenseAnalytics.totalCount}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Total Transactions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {expenseAnalytics.approvedCount}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Approved</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {expenseAnalytics.pendingCount}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Pending</div>
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Budget Tracking</CardTitle>
                            <CardDescription>Budget utilization and performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {budgetLoading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : budgetAnalytics && budgetAnalytics.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Allocated</TableHead>
                                            <TableHead>Spent</TableHead>
                                            <TableHead>Utilization</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {budgetAnalytics.map((budget) => (
                                            <TableRow key={budget.id}>
                                                <TableCell className="font-medium">
                                                    {budget.category?.name || "Unknown"}
                                                </TableCell>
                                                <TableCell>{formatCurrency(budget.allocated)}</TableCell>
                                                <TableCell>{formatCurrency(budget.spent)}</TableCell>
                                                <TableCell>{budget.utilization.toFixed(1)}%</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            budget.status === "exceeded"
                                                                ? "destructive"
                                                                : budget.status === "warning"
                                                                    ? "secondary"
                                                                    : "default"
                                                        }
                                                    >
                                                        {budget.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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