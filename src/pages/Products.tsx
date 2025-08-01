
import { useState } from "react";
import { Search, Plus, Filter, Download, Grid, List, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductTable } from "@/components/products/ProductTable";
import { AddProductDialog } from "@/components/products/AddProductDialog";
import { FilterSidebar } from "@/components/products/FilterSidebar";
import { BulkActions } from "@/components/products/BulkActions";

const mockProducts = [
  {
    id: "1",
    name: "Wireless Bluetooth Headphones",
    sku: "WBH-001",
    price: 89.99,
    cost: 45.00,
    stock: 25,
    lowStock: false,
    category: "Electronics",
    image: "/placeholder.svg",
    status: "active",
    variants: [
      { name: "Color", options: ["Black", "White", "Blue"] },
      { name: "Size", options: ["Small", "Medium", "Large"] }
    ]
  },
  {
    id: "2",
    name: "Organic Coffee Beans",
    sku: "OCB-002",
    price: 24.99,
    cost: 12.00,
    stock: 5,
    lowStock: true,
    category: "Food & Beverage",
    image: "/placeholder.svg",
    status: "active",
    variants: []
  },
  {
    id: "3",
    name: "Cotton T-Shirt",
    sku: "CTS-003",
    price: 19.99,
    cost: 8.50,
    stock: 100,
    lowStock: false,
    category: "Clothing",
    image: "/placeholder.svg",
    status: "active",
    variants: [
      { name: "Size", options: ["XS", "S", "M", "L", "XL"] },
      { name: "Color", options: ["White", "Black", "Gray", "Navy"] }
    ]
  },
  {
    id: "4",
    name: "Desk Lamp",
    sku: "DL-004",
    price: 45.99,
    cost: 22.00,
    stock: 0,
    lowStock: true,
    category: "Home & Garden",
    image: "/placeholder.svg",
    status: "inactive",
    variants: []
  }
];

export default function Products() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    stockLevel: '',
    priceRange: [0, 1000]
  });

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesStatus = !filters.status || product.status === filters.status;
    const matchesStockLevel = !filters.stockLevel || 
      (filters.stockLevel === 'low' && product.lowStock) ||
      (filters.stockLevel === 'inStock' && product.stock > 0) ||
      (filters.stockLevel === 'outOfStock' && product.stock === 0);
    
    return matchesSearch && matchesCategory && matchesStatus && matchesStockLevel;
  });

  const lowStockCount = mockProducts.filter(p => p.lowStock).length;
  const outOfStockCount = mockProducts.filter(p => p.stock === 0).length;
  const totalValue = mockProducts.reduce((sum, p) => sum + (p.stock * p.cost), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Catalog</h1>
          <p className="text-muted-foreground">Manage your inventory and product information</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{mockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-warning rounded-full" />
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-warning">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-destructive rounded-full" />
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-destructive">{outOfStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Inventory Value</p>
              <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name or SKU..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilterSidebar(!showFilterSidebar)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <BulkActions
              selectedCount={selectedProducts.length}
              onClearSelection={() => setSelectedProducts([])}
              onBulkEdit={() => {}}
              onBulkDelete={() => {}}
              onBulkStatusChange={() => {}}
            />
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Filter Sidebar */}
        {showFilterSidebar && (
          <div className="w-64 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              productCount={filteredProducts.length}
            />
          </div>
        )}

        {/* Product Display */}
        <div className="flex-1">
          {viewMode === 'grid' ? (
            <ProductGrid
              products={filteredProducts}
              selectedProducts={selectedProducts}
              onSelectionChange={setSelectedProducts}
            />
          ) : (
            <ProductTable
              products={filteredProducts}
              selectedProducts={selectedProducts}
              onSelectionChange={setSelectedProducts}
            />
          )}
        </div>
      </div>

      {/* Add Product Dialog */}
      <AddProductDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}
