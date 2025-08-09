import { useQuery } from "@tanstack/react-query";
import { getSales } from "@/api/sales";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { CreditCard } from "lucide-react";
import type { ISale } from "@/types/Sale";

export function SalesList() {
    const { accessToken } = useAuth();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["sales"],
        queryFn: () => getSales(accessToken!, "", 1, 20),
        enabled: !!accessToken,
    });

    console.log(data);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                ))}
            </div>
        );
    }

    if (isError || !data?.data) {
        return (
            <div className="text-center text-muted-foreground py-12">
                {isError ? "Failed to load sales." : "No sales found."}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.data.map((sale: ISale) => (
                <Card key={sale.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            {sale.customer?.name || "Walk-in Customer"}
                            <Badge variant="outline" className="ml-2">
                                {format(new Date(sale.createdAt), "MMM d, yyyy")}
                            </Badge>
                        </CardTitle>
                        <Badge
                            variant={
                                sale.status === "completed"
                                    ? "default"
                                    : sale.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                            }
                            className="capitalize"
                        >
                            {sale.status}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{sale.paymentMethod}</span>
                            </div>
                            <span className="text-lg font-bold text-primary">
                                {sale.currencySymbol || "$"}
                                {sale.totalAmount.toFixed(2)}
                            </span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                            {sale.saleItems && sale.saleItems.length} item{sale.saleItems && sale.saleItems.length !== 1 && "s"}:
                            {sale.saleItems && (
                                <ul className="list-disc ml-4">
                                    {sale.saleItems.slice(0, 3).map((item, idx) => (
                                        <li key={idx}>
                                            {item.quantity} × {item.product.name}
                                        </li>
                                    ))}
                                    {sale.saleItems.length > 3 && (
                                        <li>...and {sale.saleItems.length - 3} more</li>
                                    )}
                                </ul>
                            )}
                        </div>
                        {sale.notes && (
                            <div className="text-xs italic text-muted-foreground">
                                {sale.notes}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}