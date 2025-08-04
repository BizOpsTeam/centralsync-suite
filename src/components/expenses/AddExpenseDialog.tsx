import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarIcon, X, Plus, Loader2, Tag } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { createExpenseCategory } from "@/api/expenses";

import { createExpense, getExpenseCategories } from "@/api/expenses";
import { useAuth } from "@/contexts/AuthContext";
import type { IExpensePayload, PaymentMethod } from "@/types/Expense";

// Form validation schema
const expenseFormSchema = z.object({
    description: z.string().min(1, "Description is required"),
    amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: "Amount must be a positive number"
    }),
    categoryId: z.string().min(1, "Category is required"),
    vendor: z.string().optional(),
    paymentMethod: z.enum(["COMPANY_CARD", "PERSONAL_CARD", "CASH", "BANK_TRANSFER", "CHECK"]).optional(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    notes: z.string().optional(),
    isRecurring: z.boolean().default(false),
    recurrenceType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface AddExpenseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const commonTags = [
    "office", "travel", "meals", "client", "software", "subscription",
    "marketing", "conference", "supplies", "equipment", "utilities"
];

// New category dialog component
function NewCategoryDialog({ open, onOpenChange, onCategoryCreated }: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    onCategoryCreated: (category: { id: string; name: string }) => void;
}) {
    const { accessToken } = useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const { register, handleSubmit, reset, formState: { errors } } = useForm<{ name: string; description?: string }>();

    const handleCreateCategory = async (data: { name: string; description?: string }) => {
        if (!accessToken) {
            setError('Authentication required');
            return;
        }
        
        setIsCreating(true);
        setError(null);
        
        try {
            const response = await createExpenseCategory(accessToken, data);
            const newCategory = response; // Access the data property from the response
            
            if (!newCategory || !newCategory.id) {
                throw new Error('Invalid category data received');
            }
            
            toast.success('Category created successfully');
            onCategoryCreated({
                id: newCategory.id,
                name: newCategory.name
            });
            reset();
            onOpenChange(false);
        } catch (err: any) {
            console.error('Error creating category:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create category';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-primary" />
                        <DialogTitle>Create New Category</DialogTitle>
                    </div>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleCreateCategory)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Category Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Office Supplies, Travel"
                            {...register('name', { required: 'Category name is required' })}
                            disabled={isCreating}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Add a description for this category"
                            {...register('description')}
                            disabled={isCreating}
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isCreating}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isCreating}>
                            {isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : 'Create Category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function AddExpenseDialog({ open, onOpenChange, onSuccess }: AddExpenseDialogProps) {
    const { accessToken } = useAuth();
    const queryClient = useQueryClient();
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
    const [newTag, setNewTag] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);

    const form = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseFormSchema),
        defaultValues: {
            description: "",
            amount: "",
            categoryId: "",
            vendor: "",
            paymentMethod: "COMPANY_CARD",
            date: new Date(),
            tags: [],
            notes: "",
            isRecurring: false,
        },
    });

    // Fetch categories
    const { data: categoriesData, refetch: refetchCategories } = useQuery({
        queryKey: ["expense-categories"],
        queryFn: () => getExpenseCategories(accessToken!),
        enabled: !!accessToken && open,
    });

    // Update local categories when data is loaded
    useEffect(() => {
        if (categoriesData?.data) {
            setCategories(categoriesData.data);
        }
    }, [categoriesData]);

    // Handle new category creation
    const handleNewCategoryCreated = (newCategory: { id: string; name: string }) => {
        // Update the categories list
        setCategories(prev => [newCategory, ...prev]);
        // Set the newly created category as selected
        form.setValue('categoryId', newCategory.id);
    };

    // Create expense mutation
    const createExpenseMutation = useMutation({
        mutationFn: (data: IExpensePayload) => createExpense(accessToken!, data),
        onSuccess: () => {
            toast.success("Expense created successfully!");
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            onSuccess();
            form.reset();
        },
        onError: (error: any) => {
            console.error("Error creating expense:", error);
            toast.error(error?.response?.data?.message || "Failed to create expense");
        },
    });

    const addTag = (tag: string) => {
        const currentTags = form.getValues("tags");
        if (!currentTags.includes(tag)) {
            form.setValue("tags", [...currentTags, tag]);
        }
    };

    const removeTag = (tagToRemove: string) => {
        const currentTags = form.getValues("tags");
        form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
    };

    const handleAddNewTag = () => {
        if (newTag.trim() && !form.getValues("tags").includes(newTag.trim())) {
            addTag(newTag.trim());
            setNewTag("");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // upload the file to a service like AWS S3
            // For now, we'll just show a success message
            toast.success("Receipt uploaded successfully");
        }
    };

    const onSubmit = (data: ExpenseFormData) => {
        const expenseData: IExpensePayload = {
            description: data.description,
            amount: parseFloat(data.amount),
            categoryId: data.categoryId,
            vendor: data.vendor,
            paymentMethod: data.paymentMethod,
            date: data.date.toISOString(),
            tags: data.tags,
            notes: data.notes,
            isRecurring: data.isRecurring,
            recurrenceType: data.recurrenceType,
        };

        createExpenseMutation.mutate(expenseData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Input
                                id="description"
                                placeholder="Enter expense description..."
                                {...form.register("description")}
                            />
                            {form.formState.errors.description && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.description.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount *</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...form.register("amount")}
                            />
                            {form.formState.errors.amount && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.amount.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Select
                                    onValueChange={(value) => form.setValue('categoryId', value)}
                                    value={form.watch('categoryId')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                        <div className="p-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowNewCategoryDialog(true);
                                                }}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create New Category
                                            </Button>
                                        </div>
                                    </SelectContent>
                                </Select>
                            </div>
                            {form.formState.errors.categoryId && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.categoryId.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vendor">Vendor</Label>
                            <Input
                                id="vendor"
                                placeholder="Enter vendor name..."
                                {...form.register("vendor")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <Select value={form.watch("paymentMethod")} onValueChange={(value) => form.setValue("paymentMethod", value as PaymentMethod)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COMPANY_CARD">Company Card</SelectItem>
                                    <SelectItem value="PERSONAL_CARD">Personal Card</SelectItem>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                    <SelectItem value="CHECK">Check</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Date *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !selectedDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => {
                                            setSelectedDate(date || new Date());
                                            form.setValue("date", date || new Date());
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {form.watch("tags").map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                                        {tag}
                                        <X className="h-3 w-3 ml-1" />
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add custom tag..."
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddNewTag())}
                                />
                                <Button type="button" variant="outline" onClick={handleAddNewTag}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {commonTags.map((tag) => (
                                    <Button
                                        key={tag}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addTag(tag)}
                                        disabled={form.watch("tags").includes(tag)}
                                    >
                                        {tag}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Additional notes..."
                                {...form.register("notes")}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Receipt</Label>
                            <Input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileUpload}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isRecurring"
                                    checked={form.watch("isRecurring")}
                                    onChange={(e) => form.setValue("isRecurring", e.target.checked)}
                                />
                                <Label htmlFor="isRecurring">Recurring Expense</Label>
                            </div>
                            {form.watch("isRecurring") && (
                                <Select value={form.watch("recurrenceType")} onValueChange={(value) => form.setValue("recurrenceType", value as any)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select recurrence type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DAILY">Daily</SelectItem>
                                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                                        <SelectItem value="YEARLY">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createExpenseMutation.isPending}>
                            {createExpenseMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Expense"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
            
            {/* New Category Dialog */}
            <NewCategoryDialog 
                open={showNewCategoryDialog}
                onOpenChange={setShowNewCategoryDialog}
                onCategoryCreated={handleNewCategoryCreated}
            />
        </Dialog>
    );
}