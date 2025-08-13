import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesList } from "@/components/sales/SalesList";
import { InvoiceList } from "@/components/sales/InvoiceList";
import { NewSaleModal } from "@/components/sales/NewSaleModal";
import { QuickSaleModal } from "@/components/sales/QuickSaleModal";
import { Plus, Receipt } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getThisMonthSalesCount, getTodaySalesCount } from "@/api/sales";
import { useAuth } from "@/contexts/AuthContext";
import { oneDay } from "@/lib/cacheTimes";

export default function Sales() {
    const [activeTab, setActiveTab] = useState("sales");
    const [showNewSaleModal, setShowNewSaleModal] = useState(false);
    const [showQuickSaleModal, setShowQuickSaleModal] = useState(false);
    const { accessToken } = useAuth();

    //getTodaySales
    const { data: todaySales, isLoading: isTodaySalesLoading } = useQuery({
        queryKey: ["todaySales"],
        queryFn: () => getTodaySalesCount(accessToken!),
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    //getThisMonthSales
    const { data: thisMonthSales, isLoading: isThisMonthSalesLoading } = useQuery({
        queryKey: ["thisMonthSales"],
        queryFn: () => getThisMonthSalesCount(accessToken!),
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });


    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Sales & Invoicing</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Manage sales, invoices, and customer transactions</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => setShowNewSaleModal(true)} size="sm" className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        New Sale
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{isTodaySalesLoading ? "Loading..." : todaySales?.totalSales}</div>
                        <p className="text-xs text-muted-foreground">{todaySales && todaySales.percentageDifference ? todaySales.percentageDifference : "0%"} from yesterday</p>
                    </CardContent>
                </Card>



                <Card className="sm:col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{isThisMonthSalesLoading ? "Loading..." : thisMonthSales?.totalSales}</div>
                        <p className="text-xs text-muted-foreground">{thisMonthSales && thisMonthSales.percentageDifference ? thisMonthSales.percentageDifference : "0%"} from last month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="sales" className="text-xs sm:text-sm">Sales</TabsTrigger>
                    <TabsTrigger value="invoices" className="text-xs sm:text-sm">Invoices</TabsTrigger>
                    {/* <TabsTrigger value="quotes" className="text-xs sm:text-sm">Quotes</TabsTrigger> */}
                </TabsList>

                <TabsContent value="sales" className="space-y-4">
                    <SalesList />
                </TabsContent>

                <TabsContent value="invoices" className="space-y-4">
                    <InvoiceList />
                </TabsContent>

                {/* <TabsContent value="quotes" className="space-y-4">
                    <QuotesList />
                </TabsContent> */}
            </Tabs>

            {/* New Sale Modal */}
            <NewSaleModal
                open={showNewSaleModal}
                onOpenChange={setShowNewSaleModal}
            />

            {/* Quick Sale Modal */}
            <QuickSaleModal
                open={showQuickSaleModal}
                onOpenChange={setShowQuickSaleModal}
            />
        </div>
    );
}