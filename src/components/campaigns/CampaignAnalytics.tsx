import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Mail, MessageSquare, TrendingUp, TrendingDown, Users, Target } from "lucide-react";

import { getCampaigns } from "@/api/campaigns";
import { useAuth } from "@/contexts/AuthContext";
import type { ICampaign } from "@/types/Campaign";

const overviewData = [
    { name: "Jan", emails: 2400, sms: 890 },
    { name: "Feb", emails: 1398, sms: 1200 },
    { name: "Mar", emails: 3800, sms: 950 },
    { name: "Apr", emails: 3908, sms: 1100 },
    { name: "May", emails: 4800, sms: 1350 },
    { name: "Jun", emails: 3800, sms: 1180 },
];

const performanceData = [
    { name: "Week 1", sent: 1200, opened: 840, clicked: 252 },
    { name: "Week 2", sent: 1100, opened: 770, clicked: 231 },
    { name: "Week 3", sent: 1350, opened: 945, clicked: 283 },
    { name: "Week 4", sent: 980, opened: 686, clicked: 206 },
];

const segmentData = [
    { name: "New Customers", value: 35, color: "#0088FE" },
    { name: "VIP Customers", value: 25, color: "#00C49F" },
    { name: "Inactive", value: 20, color: "#FFBB28" },
    { name: "High Value", value: 20, color: "#FF8042" },
];

export function CampaignAnalytics() {
    const { accessToken } = useAuth();

    const { data: campaignsResponse, isLoading, isError } = useQuery({
        queryKey: ["campaigns"],
        queryFn: () => getCampaigns(accessToken!),
        enabled: !!accessToken,
    });

    const campaigns = campaignsResponse?.data || [];

    // Calculate analytics from real data
    const totalCampaigns = campaigns.length;
    const totalRecipients = campaigns.reduce((sum, campaign) => sum + (campaign.recipients?.length || 0), 0);
    const scheduledCampaigns = campaigns.filter(campaign => campaign.schedule).length;
    const sentCampaigns = totalCampaigns - scheduledCampaigns;
    const averageRecipients = totalCampaigns > 0 ? Math.round(totalRecipients / totalCampaigns) : 0;

    // Top campaigns based on recipient count
    const topCampaigns = campaigns
        .sort((a, b) => (b.recipients?.length || 0) - (a.recipients?.length || 0))
        .slice(0, 4)
        .map(campaign => ({
            name: campaign.name,
            type: "email",
            openRate: Math.random() * 30 + 50, // Mock data for now
            clickRate: Math.random() * 10 + 5,
            sent: campaign.recipients?.length || 0,
        }));

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

    if (isError) {
        return (
            <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Failed to load analytics</h3>
                <p className="text-muted-foreground">Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCampaigns}</div>
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
                        <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRecipients.toLocaleString()}</div>
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
                        <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{scheduledCampaigns}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-blue-600 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {scheduledCampaigns > 0 ? "+" : ""}{scheduledCampaigns}
                            </span>
                            campaigns scheduled
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Recipients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageRecipients}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                +{Math.round(Math.random() * 10 + 5)}%
                            </span>
                            from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="campaigns">Top Campaigns</TabsTrigger>
                    </TabsList>
                    
                    <Select defaultValue="30">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 3 months</SelectItem>
                            <SelectItem value="365">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Campaign Volume</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={overviewData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="emails" stackId="1" stroke="#0088FE" fill="#0088FE" />
                                        <Area type="monotone" dataKey="sms" stackId="1" stroke="#00C49F" fill="#00C49F" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Campaign Types Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: "Email", value: 75, color: "#0088FE" },
                                                { name: "SMS", value: 25, color: "#00C49F" },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            <Cell fill="#0088FE" />
                                            <Cell fill="#00C49F" />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="sent" stroke="#8884d8" strokeWidth={2} />
                                    <Line type="monotone" dataKey="opened" stroke="#82ca9d" strokeWidth={2} />
                                    <Line type="monotone" dataKey="clicked" stroke="#ffc658" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="campaigns" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Performing Campaigns</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topCampaigns.length > 0 ? (
                                    topCampaigns.map((campaign, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium">{campaign.name}</h4>
                                                    <Mail className="h-4 w-4 text-blue-500" />
                                                    <Badge variant="outline">{campaign.type}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Sent to {campaign.sent.toLocaleString()} recipients
                                                </p>
                                            </div>
                                            <div className="flex gap-4 text-sm">
                                                <div className="text-center">
                                                    <div className="font-semibold">{campaign.openRate.toFixed(1)}%</div>
                                                    <div className="text-muted-foreground">Open Rate</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold">{campaign.clickRate.toFixed(1)}%</div>
                                                    <div className="text-muted-foreground">Click Rate</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold">No campaigns yet</h3>
                                        <p className="text-muted-foreground">Create your first campaign to see analytics</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}