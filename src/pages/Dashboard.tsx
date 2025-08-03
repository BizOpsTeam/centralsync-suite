import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Package } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { dashboardService } from "@/api/dashboard";
import { useToast } from "@/components/ui/use-toast";

interface DashboardMetrics {
  totalRevenue: number;
  salesGrowth: number;
  activeCustomers: number;
  productsSold: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.fetchDashboardMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard metrics',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [toast]);

  // Format values based on the data
  const formatValue = (value: number | undefined, isCurrency = false, isPercent = false) => {
    if (value === undefined) return '--';
    if (isCurrency) return dashboardService.formatter.format(value);
    if (isPercent) return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    return dashboardService.formatNumber(value);
  };

  // Calculate change type based on value
  const getChangeType = (value: number | undefined): 'positive' | 'negative' | 'neutral' => {
    if (value === undefined) return 'neutral';
    return value >= 0 ? 'positive' : 'negative';
  };
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Good morning, Admin!</h1>
        <p className="text-muted-foreground">Here's what's happening with your business today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<MetricCard
          title="Total Revenue"
          value={loading ? 'Loading...' : formatValue(metrics?.totalRevenue, true)}
          change={formatValue(metrics?.salesGrowth, false, true)}
          changeType={getChangeType(metrics?.salesGrowth)}
          icon={DollarSign}
          loading={loading}
        />
        <MetricCard
          title="Sales Growth"
          value={loading ? '--' : formatValue(metrics?.salesGrowth, false, true)}
          change={metrics ? 'vs. last period' : ''}
          changeType={getChangeType(metrics?.salesGrowth)}
          icon={TrendingUp}
          loading={loading}
        />
        <MetricCard
          title="Active Customers"
          value={loading ? '--' : formatValue(metrics?.activeCustomers)}
          change={metrics ? '+5.2% from last month' : ''}
          changeType="positive"
          icon={Users}
          loading={loading}
        />
        <MetricCard
          title="Products Sold"
          value={loading ? '--' : formatValue(metrics?.productsSold)}
          change={metrics ? '12% increase' : ''}
          changeType="positive"
          icon={Package}
          loading={loading}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SalesChart />
        <RecentActivity />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Process New Sale</h3>
          <p className="text-primary-foreground/80 mb-4">Quick checkout for walk-in customers</p>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Start Sale →
          </button>
        </div>
        
        <div className="bg-gradient-to-br from-success to-success/80 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Create Invoice</h3>
          <p className="text-success-foreground/80 mb-4">Generate professional invoices</p>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md text-sm font-medium transition-colors">
            New Invoice →
          </button>
        </div>
        
        <div className="bg-gradient-to-br from-warning to-warning/80 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Send Campaign</h3>
          <p className="text-warning-foreground/80 mb-4">Reach out to your customers</p>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Create Campaign →
          </button>
        </div>
      </div>
    </div>
  );
}