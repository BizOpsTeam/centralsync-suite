
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

interface FilterSidebarProps {
  filters: {
    category: string;
    status: string;
    stockLevel: string;
    priceRange: number[];
  };
  onFiltersChange: (filters: any) => void;
  productCount: number;
}

const categories = [
  "Electronics",
  "Clothing", 
  "Food & Beverage",
  "Home & Garden",
  "Books",
  "Sports & Outdoors",
  "Health & Beauty",
  "Toys & Games",
];

export function FilterSidebar({ filters, onFiltersChange, productCount }: FilterSidebarProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: '',
      status: '',
      stockLevel: '',
      priceRange: [0, 1000]
    });
  };

  const hasActiveFilters = filters.category || filters.status || filters.stockLevel || 
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000);

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {productCount} products found
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div>
          <Label className="text-sm font-medium">Category</Label>
          <RadioGroup
            value={filters.category}
            onValueChange={(value) => updateFilter('category', value)}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="category-all" />
              <Label htmlFor="category-all" className="text-sm cursor-pointer">
                All Categories
              </Label>
            </div>
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <RadioGroupItem value={category} id={`category-${category}`} />
                <Label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                  {category}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* Status Filter */}
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <RadioGroup
            value={filters.status}
            onValueChange={(value) => updateFilter('status', value)}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="status-all" />
              <Label htmlFor="status-all" className="text-sm cursor-pointer">
                All Status
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="active" id="status-active" />
              <Label htmlFor="status-active" className="text-sm cursor-pointer">
                Active
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="inactive" id="status-inactive" />
              <Label htmlFor="status-inactive" className="text-sm cursor-pointer">
                Inactive
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {/* Stock Level Filter */}
        <div>
          <Label className="text-sm font-medium">Stock Level</Label>
          <RadioGroup
            value={filters.stockLevel}
            onValueChange={(value) => updateFilter('stockLevel', value)}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="stock-all" />
              <Label htmlFor="stock-all" className="text-sm cursor-pointer">
                All Stock Levels
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="inStock" id="stock-in" />
              <Label htmlFor="stock-in" className="text-sm cursor-pointer">
                In Stock
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="stock-low" />
              <Label htmlFor="stock-low" className="text-sm cursor-pointer">
                Low Stock
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="outOfStock" id="stock-out" />
              <Label htmlFor="stock-out" className="text-sm cursor-pointer">
                Out of Stock
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {/* Price Range Filter */}
        <div>
          <Label className="text-sm font-medium">Price Range</Label>
          <div className="mt-4 space-y-3">
            <Slider
              min={0}
              max={1000}
              step={10}
              value={filters.priceRange}
              onValueChange={(value) => updateFilter('priceRange', value)}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <>
            <Separator />
            <Button variant="outline" onClick={clearFilters} className="w-full">
              Clear All Filters
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
