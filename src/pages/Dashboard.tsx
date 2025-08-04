import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Package, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchDashboardMetrics } from "@/api/dashboard";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import type { IDashBoardMetrics } from '@/types/Product';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { useNavigate } from 'react-router-dom';

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  loading = false
}: {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}) => {
  const changeColor = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-500 dark:text-gray-400',
  }[changeType];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {change && (
          <p className={`text-xs ${changeColor} mt-1`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Format values based on the data type
const formatValue = (value: number | undefined, isCurrency = false, isPercent = false): string => {
  if (value === undefined || value === null) return '--';
  
  if (isCurrency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  
  if (isPercent) {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  }
  
  return value.toLocaleString();
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<IDashBoardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const loadMetrics = async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      const data = await fetchDashboardMetrics(accessToken);
      console.log("data", data)
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard metrics. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh data every 5 minutes
  useEffect(() => {
    loadMetrics();
    
    const interval = setInterval(() => {
      loadMetrics();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [accessToken]);
  
  // Loading state
  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'sale':
        navigate('/sales');
        break;
      case 'invoice':
        navigate('/invoices');
        break;
      case 'campaign':
        navigate('/campaigns');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your business performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadMetrics}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics" disabled>
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={formatValue(metrics.totalRevenue, true)}
              change={formatValue(metrics.salesGrowth, false, true)}
              changeType={metrics.salesGrowth >= 0 ? 'positive' : 'negative'}
              icon={DollarSign}
              loading={loading}
            />
            <MetricCard
              title="Active Customers"
              value={metrics.activeCustomers.toString()}
              change=""
              changeType="neutral"
              icon={Users}
              loading={loading}
            />
            <MetricCard
              title="Products Sold"
              value={metrics.productsSold.toString()}
              change=""
              changeType="neutral"
              icon={Package}
              loading={loading}
            />
            <MetricCard
              title="Sales Growth"
              value={formatValue(metrics.salesGrowth, false, true)}
              changeType={metrics.salesGrowth >= 0 ? 'positive' : 'negative'}
              icon={TrendingUp}
              loading={loading}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SalesChart salesDataOverTime={metrics.salesOverTime}/>
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-10 w-10 rounded-md" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))
                  ) : (
                    metrics.topProducts.map((product) => (
                      <div key={product.product.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{product.product.name}</p>
                            <p className="text-xs text-gray-500">
                              {product.totalSold} sold • {formatValue(product.totalRevenue, true)}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {formatValue(product.totalRevenue, true)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                Recent activity will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Analytics view coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Reports view coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div>
        {/* <SalesChart />
        <RecentActivity /> */}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Process New Sale</h3>
          <p className="text-primary-foreground/80 mb-4">Quick checkout for walk-in customers</p>
          <button 
            onClick={() => handleQuickAction('sale')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Start Sale →
          </button>
        </div>
        
        <div className="bg-gradient-to-br from-success to-success/80 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Create Invoice</h3>
          <p className="text-success-foreground/80 mb-4">Generate professional invoices</p>
          <button 
            onClick={() => handleQuickAction('invoice')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            New Invoice →
          </button>
        </div>
        
        <div className="bg-gradient-to-br from-warning to-warning/80 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Send Campaign</h3>
          <p className="text-warning-foreground/80 mb-4">Reach out to your customers</p>
          <button 
            onClick={() => handleQuickAction('campaign')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Create Campaign →
          </button>
        </div>
      </div>
    </div>
  );
}