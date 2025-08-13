import { useQuery } from "@tanstack/react-query";
import { fetchInvoices, type Invoice } from "@/api/invoices";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { CreditCard } from "lucide-react";
import { oneDay } from "@/lib/cacheTimes";

export function InvoiceList() {
    const { accessToken } = useAuth();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["invoices"],
        queryFn: () => fetchInvoices(accessToken!, { page: 1, limit: 20 }),
        enabled: !!accessToken,
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                ))}
            </div>
        );
    }

    if (isError || !data?.invoices) {
        return (
            <div className="text-center text-muted-foreground py-12">
                {isError ? "Failed to load invoices." : "No invoices found."}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.invoices.map((invoice: Invoice) => (
                <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            #{invoice.invoiceNumber}
                            <Badge variant="outline" className="ml-2">
                                {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                            </Badge>
                        </CardTitle>
                        <Badge
                            variant={
                                invoice.status === "PAID"
                                    ? "default"
                                    : invoice.status === "PARTIAL"
                                    ? "secondary"
                                    : "destructive"
                            }
                            className="capitalize"
                        >
                            {invoice.status}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {invoice.sale?.paymentMethod || "N/A"}
                                </span>
                            </div>
                            <span className="text-lg font-bold text-primary">
                                {invoice.currencySymbol || "$"}
                                {invoice.amountDue.toFixed(2)}
                            </span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                            Customer: {invoice.sale?.customer?.name || "N/A"}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span>
                                Due: {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                            </span>
                            <span>
                                Paid: {invoice.currencySymbol || "$"}
                                {invoice.paidAmount.toFixed(2)}
                            </span>
                        </div>

                    </CardContent>
                </Card>
            ))}
        </div>
    );
}