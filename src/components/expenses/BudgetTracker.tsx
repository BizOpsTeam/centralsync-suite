import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Plus, TrendingUp, TrendingDown, Target, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { getBudgetAnalytics, createBudget, getExpenseCategories } from "@/api/expenses";
import { useAuth } from "@/contexts/AuthContext";
import type { IBudgetAnalytics, BudgetPeriod } from "@/types/Expense";

export function BudgetTracker() {
    const { accessToken } = useAuth();
    const queryClient = useQueryClient();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newBudget, setNewBudget] = useState({
        categoryId: "",
        allocated: "",
        period: "MONTHLY" as BudgetPeriod
    });
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

    // Fetch budget analytics
    const { data: budgetsResponse, isLoading, isError } = useQuery({
        queryKey: ["budget-analytics"],
        queryFn: () => getBudgetAnalytics(accessToken!),
        enabled: !!accessToken,
    });

    // Fetch categories
    const { data: categoriesResponse } = useQuery({
        queryKey: ["expense-categories"],
        queryFn: () => getExpenseCategories(accessToken!),
        enabled: !!accessToken,
        onSuccess: (data) => {
            setCategories(data.data);
        },
    });

    // Create budget mutation
    const createBudgetMutation = useMutation({
        mutationFn: (data: { categoryId: string; allocated: number; period: BudgetPeriod }) => 
            createBudget(accessToken!, data),
        onSuccess: () => {
            toast.success("Budget created successfully!");
            queryClient.invalidateQueries({ queryKey: ["budget-analytics"] });
            setShowAddDialog(false);
            setNewBudget({ categoryId: "", allocated: "", period: "MONTHLY" });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to create budget");
        },
    });

    const budgets = budgetsResponse?.data || [];

    const totalAllocated = budgets.reduce((sum, budget) => sum + budget.allocated, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const utilizationRate = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    const getStatusColor = (status: IBudgetAnalytics["status"]) => {
        switch (status) {
            case "on-track": return "default";
            case "warning": return "secondary";
            case "exceeded": return "destructive";
            default: return "outline";
        }
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return "bg-red-500";
        if (percentage >= 80) return "bg-yellow-500";
        return "bg-green-500";
    };

    const handleAddBudget = () => {
        if (!newBudget.categoryId || !newBudget.allocated) {
            toast.error("Please fill in all required fields");
            return;
        }

        const allocated = parseFloat(newBudget.allocated);
        if (isNaN(allocated) || allocated <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        createBudgetMutation.mutate({
            categoryId: newBudget.categoryId,
            allocated,
            period: newBudget.period,
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Failed to load budgets</h3>
                <p className="text-muted-foreground">Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalAllocated.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Allocated amount</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Actual spending</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{utilizationRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Budget usage</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(totalAllocated - totalSpent).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Available budget</p>
                    </CardContent>
                </Card>
            </div>

            {/* Budget List */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Budget Categories</h2>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Budget
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Budget</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={newBudget.categoryId} onValueChange={(value) => setNewBudget(prev => ({ ...prev, categoryId: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Allocated Amount</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={newBudget.allocated}
                                    onChange={(e) => setNewBudget(prev => ({ ...prev, allocated: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Period</Label>
                                <Select value={newBudget.period} onValueChange={(value) => setNewBudget(prev => ({ ...prev, period: value as BudgetPeriod }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                        <SelectItem value="YEARLY">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddBudget} disabled={createBudgetMutation.isPending}>
                                    {createBudgetMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Budget"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {budgets.map((budget) => (
                    <Card key={budget.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{budget.category.name}</CardTitle>
                                <Badge variant={getStatusColor(budget.status)}>
                                    {budget.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Spent: ${budget.spent.toLocaleString()}</span>
                                    <span>Budget: ${budget.allocated.toLocaleString()}</span>
                                </div>
                                <Progress 
                                    value={budget.utilization} 
                                    className="h-2"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{budget.utilization.toFixed(1)}% used</span>
                                    <span>${budget.remaining.toLocaleString()} remaining</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="font-medium">Period</div>
                                    <div className="text-muted-foreground capitalize">{budget.period.toLowerCase()}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Status</div>
                                    <div className="text-muted-foreground capitalize">{budget.status}</div>
                                </div>
                            </div>

                            {budget.status === "exceeded" && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-700">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-sm font-medium">Budget exceeded!</span>
                                    </div>
                                    <p className="text-xs text-red-600 mt-1">
                                        You've spent ${(budget.spent - budget.allocated).toLocaleString()} more than allocated.
                                    </p>
                                </div>
                            )}

                            {budget.status === "warning" && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-yellow-700">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-sm font-medium">Approaching limit</span>
                                    </div>
                                    <p className="text-xs text-yellow-600 mt-1">
                                        You've used {budget.utilization.toFixed(1)}% of your budget.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {budgets.length === 0 && (
                <div className="text-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No budgets set</h3>
                    <p className="text-muted-foreground">Create your first budget to start tracking expenses.</p>
                </div>
            )}
        </div>
    );
}