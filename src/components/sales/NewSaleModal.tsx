import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { X, Plus, Minus, Trash2, Search, Calculator } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { fetchCustomers } from "@/api/customers";
import { useAuth } from "@/contexts/AuthContext";
import type { ISalePayload, ISaleItem } from "@/types/Sale";
import type { IProduct } from "@/types/Product";
import type { Customer } from "@/types/Customer";

// Form validation schema
const saleFormSchema = z.object({
    customerId: z.string().optional(),
    items: z.array(z.object({
        productId: z.string().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        discount: z.number().min(0).max(100).optional(),
        tax: z.number().min(0).optional(),
    })).min(1, "At least one item is required"),
    paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER", "CREDIT"]),
    channel: z.string().optional(),
    notes: z.string().optional(),
    currencyCode: z.string().optional(),
    currencySymbol: z.string().optional(),
    taxRate: z.number().nonnegative().optional().default(0),
});

type SaleFormData = z.infer<typeof saleFormSchema>;

interface NewSaleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface CartItem extends ISaleItem {
    product: IProduct;
    totalPrice: number;
    discountAmount: number;
    taxAmount: number;
}

export function NewSaleModal({ open, onOpenChange }: NewSaleModalProps) {
    const { accessToken } = useAuth();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [customerSearchTerm, setCustomerSearchTerm] = useState("");
    const [products, setProducts] = useState<IProduct[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const form = useForm<SaleFormData>({
        resolver: zodResolver(saleFormSchema),
        defaultValues: {
            items: [],
            paymentMethod: "CASH",
            channel: "STORE",
            notes: "",
            currencyCode: "USD",
            currencySymbol: "$",
            taxRate: 0,
        },
    });


    // Fetch products and customers
    useEffect(() => {
        if (open && accessToken) {
            const fetchData = async () => {
                try {
                    const [productsData, customersData] = await Promise.all([
                        getProducts(accessToken, "", "", 1, 100),
                        fetchCustomers(accessToken, 1, 100, ""),
                    ]);
                    setProducts(productsData);
                    setCustomers(customersData.data);
                } catch (error) {
                    console.error("Error fetching data:", error);
                    toast.error("Failed to load products and customers");
                }
            };
            fetchData();
        }
    }, [open, accessToken]);

    // Create sale mutation
    const createSaleMutation = useMutation({
        mutationFn: (data: ISalePayload) => createSale(accessToken!, data),
        onSuccess: () => {
            toast.success("Sale created successfully!");
            queryClient.invalidateQueries({ queryKey: ["sales"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["todaySales"] });
            onOpenChange(false);
            form.reset();
            setCart([]);
            setSelectedCustomer(null);
        },
        onError: (error: any) => {
            console.log("error", error);
            toast.error(error?.response?.data?.message || "Failed to create sale");
        },
    });

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(customerSearchTerm.toLowerCase())
    );

    const addToCart = (product: IProduct) => {
        const existingItem = cart.find(item => item.productId === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            const newItem: CartItem = {
                productId: product.id,
                quantity: 1,
                discount: 0,
                tax: 0,
                product,
                totalPrice: product.price,
                discountAmount: 0,
                taxAmount: 0,
            };
            setCart([...cart, newItem]);
        }
    };

    const updateCartItem = (productId: string, updates: Partial<CartItem>) => {
        setCart(cart.map(item =>
            item.productId === productId ? { ...item, ...updates } : item
        ));
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const calculateTotals = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const totalDiscount = cart.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
        const totalTax = cart.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
        const total = subtotal - totalDiscount + totalTax;
        
        return { subtotal, totalDiscount, totalTax, total };
    };

    const { subtotal, totalDiscount, totalTax, total } = calculateTotals();

    const onSubmit = (data: SaleFormData) => {
        console.log(data);
        console.log("cart", cart);
        console.log("selectedCustomer", selectedCustomer);
        console.log("Submit data");
        if (cart.length === 0) {
            toast.error("Please add at least one item to the cart");
            return;
        }

        const saleData: ISalePayload = {
            customerId: selectedCustomer?.id,
            items: cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                discount: item.discount || 0,
                tax: item.tax || 0,
            })),
            paymentMethod: data.paymentMethod,
            channel: data.channel,
            notes: data.notes,
            currencyCode: data.currencyCode,
            currencySymbol: data.currencySymbol,
            taxRate: data.taxRate,
        };
        console.log("saleData", saleData);
        createSaleMutation.mutate(saleData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        New Sale
                    </DialogTitle>
                    <DialogDescription>
                        Create a new sale transaction. Add products, select customer, and complete the payment.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Selection */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5" />
                                    Product Search
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="Search products by name or SKU..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                                    {filteredProducts.map((product) => (
                                        <Card 
                                            key={product.id} 
                                            className="cursor-pointer hover:shadow-md transition-shadow"
                                            onClick={() => addToCart(product)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium">{product.name}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            Description: {product.description?.substring(0, 40)}...
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Stock: {product.stock}
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

                        {/* Customer Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer (Optional)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="Search customers..."
                                    value={customerSearchTerm}
                                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                                />
                                
                                <div className="max-h-32 overflow-y-auto">
                                    {filteredCustomers.map((customer) => (
                                        <div
                                            key={customer.id}
                                            className={`p-3 border rounded-lg cursor-pointer hover:bg-accent ${
                                                selectedCustomer?.id === customer.id ? 'bg-accent' : ''
                                            }`}
                                            onClick={() => setSelectedCustomer(customer)}
                                        >
                                            <div className="font-medium">{customer.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {customer.email} • {customer.phone}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {selectedCustomer && (
                                    <div className="p-3 bg-accent rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-medium">{selectedCustomer.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {selectedCustomer.email}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedCustomer(null)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
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
                                        Add products to start a sale
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {cart.map((item) => (
                                            <div key={item.productId} className="border rounded-lg p-3">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{item.product.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            ${item.product.price} × {item.quantity}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFromCart(item.productId)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => updateCartItem(item.productId, {
                                                            quantity: Math.max(1, item.quantity - 1)
                                                        })}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-12 text-center">{item.quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => updateCartItem(item.productId, {
                                                            quantity: item.quantity + 1
                                                        })}
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

                        {/* Payment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="paymentMethod">Payment Method</Label>
                                    <Select
                                        value={form.watch("paymentMethod")}
                                        onValueChange={(value) => form.setValue("paymentMethod", value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CASH">Cash</SelectItem>
                                            <SelectItem value="CARD">Card</SelectItem>
                                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                            <SelectItem value="CREDIT">Credit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="channel">Channel</Label>
                                    <Select
                                        value={form.watch("channel")}
                                        onValueChange={(value) => form.setValue("channel", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="STORE">Store</SelectItem>
                                            <SelectItem value="ONLINE">Online</SelectItem>
                                            <SelectItem value="PHONE">Phone</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        placeholder="Add any notes about this sale..."
                                        {...form.register("notes")}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Totals */}
                        <Card>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Discount:</span>
                                    <span>-${totalDiscount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax:</span>
                                    <span>${totalTax.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>

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
                                onClick={() => onSubmit(form.getValues())}
                                disabled={createSaleMutation.isPending || cart.length === 0}
                                className="flex-1"
                            >
                                {createSaleMutation.isPending ? "Creating..." : "Complete Sale"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 