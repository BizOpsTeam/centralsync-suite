
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { fetchProductCategories } from "@/api/productCategories";
import { useQuery } from "@tanstack/react-query";
import type { TCategory } from "@/types/Product";


const productSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional(),
    categoryId: z.string().min(1, "Category is required"),
    price: z.number().min(0, "Price must be positive"),
    stock: z.number().min(0, "Stock must be positive"),
    images: z.array(z.string()).optional(),
    cost: z.number().min(0, "Cost must be positive"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface AddProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onProductAdded?: () => void;
}

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

export function AddProductDialog({
    open,
    onOpenChange,
    onProductAdded,
}: AddProductDialogProps) {
    const { accessToken } = useAuth()
    const [activeTab, setActiveTab] = useState("basic");
    const [imagePreviews, setImagePreviews] = useState<Array<{ url: string; file: File | null }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const { data: categories, isPending: isLoadingCategories, error: categoriesError } = useQuery({
        queryKey: ['product-categories'],
        queryFn: () => fetchProductCategories(accessToken!),
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
    })

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            categoryId: "",
            cost: 0,
            price: 0,
            stock: 0,
            images: [],
        },
    });

    const handleImageUpload = (files: FileList) => {
        const newPreviews: Array<{ url: string; file: File | null }> = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file) {
                // Create a preview URL for the image
                const previewUrl = URL.createObjectURL(file);
                newPreviews.push({
                    url: previewUrl,
                    file: file
                });
            }
        }

        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleImageUpload(files);
        }
    };

    const removeImage = (index: number) => {
        setImagePreviews(prev => {
            const newPreviews = [...prev];
            // Revoke the object URL to avoid memory leaks
            URL.revokeObjectURL(newPreviews[index].url);
            newPreviews.splice(index, 1);
            return newPreviews;
        });
    };

    const onSubmit = async (data: ProductFormData) => {
        setIsLoading(true);

        try {
            const formData = new FormData();

            // Append all form fields
            Object.entries(data).forEach(([key, value]) => {
                if (key !== 'images' && value !== undefined) {
                    formData.append(key, String(value));
                }
            });

            // Append image files
            imagePreviews.forEach((preview) => {
                if (preview.file) {
                    formData.append('images', preview.file);
                }
            });

            const response = await fetch(`${BASE_URL}/products`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    // Don't set Content-Type header - let the browser set it with the boundary
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || "Failed to create product");
            }

            // Clean up object URLs
            imagePreviews.forEach(preview => {
                URL.revokeObjectURL(preview.url);
            });

            toast.success("Product created successfully!");
            form.reset();
            setImagePreviews([]);
            onOpenChange(false);
            onProductAdded?.();
        } catch (error) {
            console.error("Error creating product:", error);
            toast.error(error instanceof Error ? error.message : "Failed to create product. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter product name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter product description"
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />

                                                        {isLoadingCategories ? (
                                                            <SelectContent>
                                                                <SelectItem value="" disabled>Loading...</SelectItem>
                                                            </SelectContent>
                                                        ) : categoriesError ? (
                                                            <SelectContent>
                                                                {"Error Getting Categories"}
                                                            </SelectContent>
                                                        ) : (
                                                            <SelectContent>
                                                                {categories.map((category: TCategory) => (
                                                                    <SelectItem key={category.id} value={category.id}>
                                                                        {category.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        )}
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((category: TCategory) => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div>
                                    <Label>Product Images</Label>
                                    <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileChange}
                                        />
                                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <div className="mt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isLoading}
                                            >
                                                Upload Images
                                            </Button>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                PNG, JPG, GIF up to 10MB each (max 5 images)
                                            </p>
                                        </div>

                                        {/* Image Previews */}
                                        {imagePreviews.length > 0 && (
                                            <div className="mt-4 grid grid-cols-3 gap-2">
                                                {imagePreviews.map((preview, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={preview.url}
                                                            alt={`Preview ${index + 1}`}
                                                            className="h-24 w-full object-cover rounded-md"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="pricing" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Selling Price *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="cost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cost Price *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>
                            <TabsContent value="inventory" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="stock"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Stock *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />


                                </div>


                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Create Product
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
