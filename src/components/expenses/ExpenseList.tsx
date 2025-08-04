import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Receipt, MoreHorizontal, Calendar, DollarSign, TrendingUp, FileText, CheckCircle, XCircle, Edit, Trash2, Plus } from "lucide-react";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { ApproveExpenseDialog } from "./ApproveExpenseDialog";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

import { getExpenses, approveExpense, rejectExpense, deleteExpense, getExpenseCategories } from "@/api/expenses";
import { useAuth } from "@/contexts/AuthContext";
import type { ExpenseStatus } from "@/types/Expense";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function ExpenseList() {
    const { accessToken } = useAuth();
    const queryClient = useQueryClient();
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);
    const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showAddDialog, setShowAddDialog] = useState(false);

    // Fetch expenses
    const { data: expensesResponse, isLoading, isError } = useQuery({
        queryKey: ["expenses"],
        queryFn: () => getExpenses(accessToken!),
        enabled: !!accessToken,
    });

    // Fetch categories
    const { data: categoriesResponse } = useQuery({
        queryKey: ["expense-categories"],
        queryFn: () => getExpenseCategories(accessToken!),
        enabled: !!accessToken,
    });

    // Mutations
    const approveExpenseMutation = useMutation({
        mutationFn: ({ expenseId, notes }: { expenseId: string; notes?: string }) =>
            approveExpense(accessToken!, expenseId, notes),
        onSuccess: () => {
            toast.success("Expense approved successfully");
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
        onError: (error: any) => {
            console.error("Error approving expense:", error);
            toast.error(error?.response?.data?.message || "Failed to approve expense");
        },
    });

    const rejectExpenseMutation = useMutation({
        mutationFn: ({ expenseId, notes }: { expenseId: string; notes?: string }) =>
            rejectExpense(accessToken!, expenseId, notes),
        onSuccess: () => {
            toast.success("Expense rejected");
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
        onError: (error: any) => {
            console.error("Error rejecting expense:", error);
            toast.error(error?.response?.data?.message || "Failed to reject expense");
        },
    });

    const deleteExpenseMutation = useMutation({
        mutationFn: (expenseId: string) => deleteExpense(accessToken!, expenseId),
        onSuccess: () => {
            toast.success("Expense deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
        onError: (error: any) => {
            console.error("Error deleting expense:", error);
            toast.error(error?.response?.data?.message || "Failed to delete expense");
        },
    });

    const expenses = expensesResponse?.data || [];
    const categories = categoriesResponse?.data || [];

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || expense.categoryId === categoryFilter;
        const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const pendingExpenses = filteredExpenses.filter(e => e.status === "PENDING").length;

    const getStatusColor = (status: ExpenseStatus) => {
        switch (status) {
            case "APPROVED": return "default";
            case "PENDING": return "secondary";
            case "REJECTED": return "destructive";
            default: return "outline";
        }
    };

    const handleApprove = (expenseId: string) => {
        setSelectedExpenseId(expenseId);
        setApprovalModalOpen(true);
    };

    const handleApproveConfirm = (notes: string) => {
        if (selectedExpenseId) {
            approveExpenseMutation.mutate({ 
                expenseId: selectedExpenseId, 
                notes: notes || undefined 
            });
            setApprovalModalOpen(false);
        }
    };

    const handleReject = (expenseId: string) => {
        const notes = prompt("Enter rejection reason (optional):");
        rejectExpenseMutation.mutate({ expenseId, notes: notes || undefined });
    };

    const handleDelete = (expenseId: string) => {
        if (confirm("Are you sure you want to delete this expense?")) {
            deleteExpenseMutation.mutate(expenseId);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-[180px]" />
                    <Skeleton className="h-10 w-[180px]" />
                    <Skeleton className="h-10 w-[120px]" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Failed to load expenses</h3>
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
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingExpenses}</div>
                        <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredExpenses.length}</div>
                        <p className="text-xs text-muted-foreground">Total transactions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Amount</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(totalExpenses / filteredExpenses.length || 0).toFixed(0)}</div>
                        <p className="text-xs text-muted-foreground">Per expense</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Add Button */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search expenses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                </Button>
            </div>

            {/* Expenses Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Receipt</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredExpenses.map((expense) => {
                                const category = categories.find(c => c.id === expense.categoryId);
                                return (
                                    <TableRow key={expense.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{expense.description}</div>
                                                <div className="flex gap-1 mt-1">
                                                    {expense.tags?.map((tag, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{category?.name || "Unknown"}</TableCell>
                                        <TableCell>{expense.vendor || "N/A"}</TableCell>
                                        <TableCell>{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                                        <TableCell className="font-medium">${expense.amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(expense.status)}>
                                                {expense.status.toLowerCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {expense.receiptUrl ? (
                                                <Button variant="outline" size="sm">
                                                    <Receipt className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">No receipt</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    {expense.status === "PENDING" && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => handleApprove(expense.id)}>
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Approve
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleReject(expense.id)}>
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Reject
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(expense.id)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {filteredExpenses.length === 0 && (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">No expenses found</h3>
                            <p className="text-muted-foreground">
                                {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                                    ? "Try adjusting your filters"
                                    : "Add your first expense to get started"}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AddExpenseDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onSuccess={() => {
                    setShowAddDialog(false);
                    queryClient.invalidateQueries({ queryKey: ["expenses"] });
                }}
            />

            <ApproveExpenseDialog
                isOpen={approvalModalOpen}
                onClose={() => setApprovalModalOpen(false)}
                onApprove={handleApproveConfirm}
                isLoading={approveExpenseMutation.isPending}
            />
        </div>
    );
}