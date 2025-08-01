import { DollarSign, TrendingUp, Users, Package } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default function Dashboard() {
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
          value="$12,345"
          change="+12.5%"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          title="Sales Growth"
          value="23.4%"
          change="+4.2%"
          changeType="positive"
          icon={TrendingUp}
        />
        <MetricCard
          title="Active Customers"
          value="1,247"
          change="+8.1%"
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          title="Products Sold"
          value="456"
          change="-2.4%"
          changeType="negative"
          icon={Package}
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