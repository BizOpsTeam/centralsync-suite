import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { X, Plus, Minus, Trash2, Search, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { createSale } from "@/api/sales";
import { getProducts } from "@/api/products";
import { useAuth } from "@/contexts/AuthContext";
import type { ISalePayload } from "@/types/Sale";
import type { IProduct } from "@/types/Product";

interface QuickSaleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface CartItem {
    product: IProduct;
    quantity: number;
}

export function QuickSaleModal({ open, onOpenChange }: QuickSaleModalProps) {
    const { accessToken } = useAuth();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState<IProduct[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");

    // Fetch products
    useEffect(() => {
        if (open && accessToken) {
            const fetchProducts = async () => {
                try {
                    const productsData = await getProducts(accessToken, "", "", 1, 100);
                    setProducts(productsData);
                } catch (error) {
                    console.error("Error fetching products:", error);
                    toast.error("Failed to load products");
                }
            };
            fetchProducts();
        }
    }, [open, accessToken]);

    // Create sale mutation
    const createSaleMutation = useMutation({
        mutationFn: (data: ISalePayload) => createSale(accessToken!, data),
        onSuccess: () => {
            toast.success("Sale completed successfully!");
            queryClient.invalidateQueries({ queryKey: ["sales"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            onOpenChange(false);
            setCart([]);
            setSearchTerm("");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to create sale");
        },
    });

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToCart = (product: IProduct) => {
        const existingItem = cart.find(item => item.product.id === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.product.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            setCart(cart.filter(item => item.product.id !== productId));
        } else {
            setCart(cart.map(item =>
                item.product.id === productId ? { ...item, quantity: newQuantity } : item
            ));
        }
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };

    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = total * 0.1; // 10% tax
    const grandTotal = total + tax;

    const handleCompleteSale = () => {
        if (cart.length === 0) {
            toast.error("Please add at least one item to the cart");
            return;
        }

        const saleData: ISalePayload = {
            items: cart.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                discount: 0,
                tax: 0,
            })),
            paymentMethod,
            channel: "STORE",
            notes: "Quick sale",
            currencyCode: "USD",
            currencySymbol: "$",
            taxRate: 10,
        };

        createSaleMutation.mutate(saleData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Quick Sale
                    </DialogTitle>
                    <DialogDescription>
                        Fast and simple sale creation. Add products and complete the transaction.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Product Selection */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5" />
                                    Add Products
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                
                                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                                    {filteredProducts.map((product) => (
                                        <Card 
                                            key={product.id} 
                                            className="cursor-pointer hover:shadow-md transition-shadow"
                                            onClick={() => addToCart(product)}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium text-sm">{product.name}</h3>
                                                        <p className="text-xs text-muted-foreground">
                                                            SKU: {product.sku} • Stock: {product.stock}
                                                        </p>
                                                    </div>
                                                    <Badge variant="secondary">
                                                        ${product.price}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Cart & Payment */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cart ({cart.length} items)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cart.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        Add products to start
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {cart.map((item) => (
                                            <div key={item.product.id} className="border rounded-lg p-3">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-sm">{item.product.name}</h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            ${item.product.price} × {item.quantity}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFromCart(item.product.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-12 text-center text-sm">{item.quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Payment Method</Label>
                                    <Select
                                        value={paymentMethod}
                                        onValueChange={(value) => setPaymentMethod(value as "CASH" | "CARD")}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CASH">Cash</SelectItem>
                                            <SelectItem value="CARD">Card</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Totals */}
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax (10%):</span>
                                        <span>${tax.toFixed(2)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total:</span>
                                        <span>${grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => onOpenChange(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCompleteSale}
                                        disabled={createSaleMutation.isPending || cart.length === 0}
                                        className="flex-1"
                                    >
                                        {createSaleMutation.isPending ? "Processing..." : "Complete Sale"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 