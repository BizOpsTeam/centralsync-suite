import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';

interface SalesData {
  name: string;
  sales: number;
}

export function SalesChart() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get('/api/sales/stats');
        // Transform the backend data to match the chart's expected format
        const formattedData = response.data.map((item: any) => ({
          name: item.month, // Assuming the backend returns month names
          sales: item.totalSales // Assuming the backend returns total sales
        }));
        setSalesData(formattedData);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load sales data',
          variant: 'destructive',
        });
        // Fallback to empty data
        setSalesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [toast]);

  // Fallback data in case of loading or error
  const chartData = loading || salesData.length === 0 ? [
    { name: "Jan", sales: 0 },
    { name: "Feb", sales: 0 },
    { name: "Mar", sales: 0 },
    { name: "Apr", sales: 0 },
    { name: "May", sales: 0 },
    { name: "Jun", sales: 0 },
  ] : salesData;

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Sales Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip />
                <Bar 
                  dataKey="sales" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}