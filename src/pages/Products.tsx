
import { useEffect, useState } from "react";
import { Search, Plus, Grid, List, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductTable } from "@/components/products/ProductTable";
import { AddProductDialog } from "@/components/products/AddProductDialog";
import { AddCategoryDialog } from "@/components/products/AddCategoryDialog";
import { BulkActions } from "@/components/products/BulkActions";
import { type IProduct } from "@/types/Product";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "@/api/products";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { oneDay } from "@/lib/cacheTimes";


export default function Products() {
    const { accessToken } = useAuth();
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [filters, _setFilters] = useState({
        category: "",
        status: "",
        stockStatus: "",
        priceRange: [0, 1000]
    });
    const queryClient = useQueryClient();
    // Get products 
    const { data: products, isLoading: isLoadingProducts, error: productsError } = useQuery({
        queryKey: ['products'],
        queryFn: () => getProducts(accessToken!, searchQuery, selectedCategory, 1, 20),
        staleTime: oneDay, // 1 day - data is fresh for 1 day
        gcTime: oneDay, // 1 day - keep in cache for 1 day
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 2, // Retry failed requests 2 times
    });

    //revalidate search when any of the query params changes
    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
    }, [searchQuery, selectedCategory, filters,]);

    const filteredProducts = products ? products?.filter((product: IProduct) => {
        // Apply category filter if selected
        if (selectedCategory && product.category.name !== selectedCategory) {
            return false;
        }
        // Apply other filters here
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = !filters.category || product.category.name === filters.category;
        const matchesStockLevel = !filters.stockStatus ||
            (filters.stockStatus === 'low' && product.stock < 10) ||
            (filters.stockStatus === 'inStock' && product.stock > 0) ||
            (filters.stockStatus === 'outOfStock' && product.stock === 0);

        return matchesSearch && matchesCategory && matchesStockLevel;
    }) : [];

    const lowStockCount = filteredProducts.filter(p => p.stock < 10).length;
    const outOfStockCount = filteredProducts.filter(p => p.stock === 0).length;
    const totalValue = filteredProducts.reduce((sum, p) => sum + (p.stock * p.price), 0);

    //toast error if there's any
    useEffect(() => {
        if (productsError) {
            toast.error(productsError.message);
        }
    }, [productsError]);

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Product Catalog</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Manage your inventory and product information</p>
                </div>
                <Button onClick={() => setShowAddDialog(true)} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Package className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Products</p>
                                <p className="text-xl sm:text-2xl font-bold">{products?.length}</p>
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
                                <p className="text-xl sm:text-2xl font-bold text-warning">{lowStockCount}</p>
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
                                <p className="text-xl sm:text-2xl font-bold text-destructive">{outOfStockCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="sm:col-span-2 lg:col-span-1">
                    <CardContent className="p-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Inventory Value</p>
                            <p className="text-xl sm:text-2xl font-bold">${totalValue.toFixed(2)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Controls Bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center space-x-2 flex-wrap gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search products..."
                                    className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            {/* <CategoryFilter 
                value={selectedCategory} 
                onValueChange={setSelectedCategory} 
              /> */}
                            <AddCategoryDialog onCategoryAdded={() => setSelectedCategory("")} />
                            {/* <FilterSidebar filters={filters} onFilterChange={setFilters} /> */}
                        </div>

                        <div className="flex gap-2 items-center w-full sm:w-auto">
                            {/* <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilterSidebar(!showFilterSidebar)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button> */}

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

                            {/* <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Export</span>
                            </Button> */}
                        </div>
                    </div>

                    {selectedProducts.length > 0 && (
                        <BulkActions
                            selectedCount={selectedProducts.length}
                            onClearSelection={() => setSelectedProducts([])}
                            onBulkEdit={() => { }}
                            onBulkDelete={() => { }}
                            onBulkStatusChange={() => { }}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Main Content */}
            <div className="flex gap-6">
                {/* Filter Sidebar */}
                {/* {showFilterSidebar && (
          <div className="w-64 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              productCount={filteredProducts.length}
            />
          </div>
        )} */}

                {/* Product Display */}

                {isLoadingProducts ? (
                    <ProductTableSkeleton />
                ) : (
                    <div className="flex-1">
                        {viewMode === 'grid' ? (
                            <ProductGrid
                                products={filteredProducts || []}
                                selectedProducts={selectedProducts}
                                onSelectionChange={setSelectedProducts}
                            />
                        ) : (
                            <ProductTable
                                products={filteredProducts || []}
                                selectedProducts={selectedProducts}
                                onSelectionChange={setSelectedProducts}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Add Product Dialog */}
            <AddProductDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
            />
        </div>
    );
}



const ProductTableSkeleton = () => {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className="h-16 w-12" />
            <Skeleton className="h-16 w-12" />
            <Skeleton className="h-16 w-12" />
        </div>
    );
}
