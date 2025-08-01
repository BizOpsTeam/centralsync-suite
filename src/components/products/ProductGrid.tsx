
import { Edit, Trash2, Eye, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  lowStock: boolean;
  category: string;
  image: string;
  status: string;
  variants: Array<{ name: string; options: string[] }>;
}

interface ProductGridProps {
  products: Product[];
  selectedProducts: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export function ProductGrid({ products, selectedProducts, onSelectionChange }: ProductGridProps) {
  const handleProductSelect = (productId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedProducts, productId]);
    } else {
      onSelectionChange(selectedProducts.filter(id => id !== productId));
    }
  };

  const getStockBadge = (stock: number, lowStock: boolean) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (lowStock) {
      return <Badge variant="secondary" className="bg-warning text-warning-foreground">Low Stock</Badge>;
    }
    return <Badge variant="outline" className="bg-success/10 text-success border-success/20">In Stock</Badge>;
  };

  if (products.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-muted-foreground">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="group hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            {/* Header with Checkbox and Actions */}
            <div className="flex items-start justify-between mb-3">
              <Checkbox
                checked={selectedProducts.includes(product.id)}
                onCheckedChange={(checked) => handleProductSelect(product.id, checked as boolean)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="sr-only">Actions</span>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Product
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Product Image */}
            <div className="aspect-square bg-muted/50 rounded-lg mb-3 flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>

            {/* Product Info */}
            <div className="space-y-2">
              <div>
                <h3 className="font-medium text-sm text-foreground line-clamp-2" title={product.name}>
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-foreground">${product.price}</p>
                  <p className="text-xs text-muted-foreground">Cost: ${product.cost}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{product.stock} units</p>
                  {getStockBadge(product.stock, product.lowStock)}
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Category</p>
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              </div>

              {product.variants.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-1">Variants</p>
                  <div className="flex flex-wrap gap-1">
                    {product.variants.map((variant, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {variant.name}: {variant.options.length}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
