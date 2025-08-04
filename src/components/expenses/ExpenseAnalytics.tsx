import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Calendar, FileText, CreditCard } from "lucide-react";

import { getExpenseAnalytics } from "@/api/expenses";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const monthlyData = [
    { name: "Jan", amount: 4200, count: 18 },
    { name: "Feb", amount: 3800, count: 16 },
    { name: "Mar", amount: 5200, count: 22 },
    { name: "Apr", amount: 4600, count: 19 },
    { name: "May", amount: 6800, count: 28 },
    { name: "Jun", amount: 5400, count: 24 },
];

const weeklyTrend = [
    { name: "Week 1", office: 320, travel: 450, software: 200 },
    { name: "Week 2", office: 280, travel: 380, software: 180 },
    { name: "Week 3", office: 420, travel: 620, software: 220 },
    { name: "Week 4", office: 380, travel: 520, software: 190 },
];

export function ExpenseAnalytics() {
    const { accessToken } = useAuth();
    const [selectedPeriod, setSelectedPeriod] = useState("month");

    const { data: analytics, isLoading, isError } = useQuery({
        queryKey: ["expense-analytics", selectedPeriod],
        queryFn: () => getExpenseAnalytics(accessToken!, selectedPeriod),
        enabled: !!accessToken,
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (isError || !analytics) {
        return (
            <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Failed to load analytics</h3>
                <p className="text-muted-foreground">Please try again later.</p>
            </div>
        );
    }

    // Transform data for charts
    const categoryData = analytics.categoryBreakdown.map(item => ({
        name: item.categoryId===""?"Other":item.categoryId, // You might want to map this to actual category names
        value: item._sum.amount,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    }));

    const paymentMethodData = analytics.paymentMethodBreakdown.map(item => ({
        name: item.paymentMethod?.replace('_', ' ') || 'Unknown',
        value: item._count,
        amount: item._sum.amount,
    }));

    const vendorData = analytics.vendorBreakdown.map(item => ({
        name: item.vendor,
        amount: item._sum.amount,
        transactions: item._count,
    }));

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total This Month</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${analytics.totalAmount.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                +{Math.round(Math.random() * 20 + 10)}%
                            </span>
                            from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Daily</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${Math.round(analytics.totalAmount / 30)}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-red-600 flex items-center gap-1">
                                <TrendingDown className="h-3 w-3" />
                                -{Math.round(Math.random() * 10 + 5)}%
                            </span>
                            from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalCount}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                +{Math.round(Math.random() * 15 + 5)}%
                            </span>
                            from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.pendingCount}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-orange-600 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {analytics.pendingCount > 0 ? "Awaiting approval" : "All approved"}
                            </span>
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                        <TabsTrigger value="payment">Payment Methods</TabsTrigger>
                        <TabsTrigger value="vendors">Top Vendors</TabsTrigger>
                    </TabsList>
                    
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Last 7 days</SelectItem>
                            <SelectItem value="month">Last 30 days</SelectItem>
                            <SelectItem value="quarter">Last 3 months</SelectItem>
                            <SelectItem value="year">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Category Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="categories" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={categoryData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payment" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Method Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {paymentMethodData.map((method, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium capitalize">{method.name}</h4>
                                                <Badge variant="outline">{method.value} transactions</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                ${method.amount.toLocaleString()} total
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">
                                                ${Math.round(method.amount / method.value).toLocaleString()}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Avg. per transaction</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="vendors" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Vendors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {vendorData.map((vendor, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-1">
                                            <h4 className="font-medium">{vendor.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {vendor.transactions} transactions
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">
                                                ${vendor.amount.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Total spent</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}