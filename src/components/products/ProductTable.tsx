
import { useState } from "react";
import { Edit, Trash2, Eye, Copy, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface ProductTableProps {
  products: Product[];
  selectedProducts: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

type SortField = 'name' | 'sku' | 'price' | 'stock' | 'category';
type SortDirection = 'asc' | 'desc';

export function ProductTable({ products, selectedProducts, onSelectionChange }: ProductTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(products.map(p => p.id));
    } else {
      onSelectionChange([]);
    }
  };

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

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => handleSort(field)}
        className="h-auto p-0 font-medium hover:bg-transparent"
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedProducts.length === products.length}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Product</TableHead>
            <SortableHeader field="name">Name</SortableHeader>
            <SortableHeader field="sku">SKU</SortableHeader>
            <SortableHeader field="category">Category</SortableHeader>
            <SortableHeader field="price">Price</SortableHeader>
            <TableHead>Cost</TableHead>
            <SortableHeader field="stock">Stock</SortableHeader>
            <TableHead>Status</TableHead>
            <TableHead>Variants</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Checkbox
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={(checked) => handleProductSelect(product.id, checked as boolean)}
                />
              </TableCell>
              <TableCell>
                <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium text-foreground">{product.name}</div>
                </div>
              </TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">{product.sku}</code>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{product.category}</Badge>
              </TableCell>
              <TableCell className="font-medium">${product.price}</TableCell>
              <TableCell className="text-muted-foreground">${product.cost}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{product.stock} units</div>
                  {getStockBadge(product.stock, product.lowStock)}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                  {product.status}
                </Badge>
              </TableCell>
              <TableCell>
                {product.variants.length > 0 ? (
                  <div className="space-y-1">
                    {product.variants.map((variant, index) => (
                      <Badge key={index} variant="secondary" className="text-xs mr-1">
                        {variant.name}: {variant.options.length}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">None</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
