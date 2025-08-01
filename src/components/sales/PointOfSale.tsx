import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus, Trash2, CreditCard, DollarSign, Receipt } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku: string;
}

export function PointOfSale() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  // Mock products
  const products = [
    { id: "1", name: "Wireless Headphones", price: 99.99, sku: "WH001", stock: 25 },
    { id: "2", name: "Bluetooth Speaker", price: 79.99, sku: "BS002", stock: 15 },
    { id: "3", name: "Phone Case", price: 19.99, sku: "PC003", stock: 50 },
    { id: "4", name: "Charging Cable", price: 14.99, sku: "CC004", stock: 30 },
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: typeof products[0]) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        sku: product.sku
      }]);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = total * 0.1; // 10% tax
  const grandTotal = total + tax;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Search & Selection */}
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
              className="w-full"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addToCart(product)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.sku}</p>
                        <p className="text-lg font-bold text-primary">${product.price}</p>
                      </div>
                      <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                        Stock: {product.stock}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart & Checkout */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Shopping Cart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Selection */}
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                <SelectItem value="john-doe">John Doe</SelectItem>
                <SelectItem value="jane-smith">Jane Smith</SelectItem>
                <SelectItem value="acme-corp">ACME Corporation</SelectItem>
              </SelectContent>
            </Select>

            <Separator />

            {/* Cart Items */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">${item.price} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button size="icon" variant="outline" className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-6 w-6"
                        onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
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

            {/* Payment Buttons */}
            <div className="space-y-2">
              <Button className="w-full" disabled={cart.length === 0}>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay with Card
              </Button>
              <Button variant="outline" className="w-full" disabled={cart.length === 0}>
                <DollarSign className="h-4 w-4 mr-2" />
                Cash Payment
              </Button>
              <Button variant="secondary" className="w-full" disabled={cart.length === 0}>
                <Receipt className="h-4 w-4 mr-2" />
                Save as Quote
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}