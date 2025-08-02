import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, Plus, Receipt, MoreHorizontal, Calendar, DollarSign, TrendingUp, FileText } from "lucide-react";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { useToast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  vendor: string;
  paymentMethod: string;
  status: "pending" | "approved" | "rejected";
  receiptUrl?: string;
  tags: string[];
}

const mockExpenses: Expense[] = [
  {
    id: "1",
    description: "Office supplies - Staples",
    amount: 245.50,
    category: "Office Supplies",
    date: "2024-01-20",
    vendor: "Staples",
    paymentMethod: "Company Card",
    status: "approved",
    receiptUrl: "#",
    tags: ["office", "supplies"]
  },
  {
    id: "2",
    description: "Software subscription - Adobe Creative Suite",
    amount: 79.99,
    category: "Software",
    date: "2024-01-19",
    vendor: "Adobe",
    paymentMethod: "Company Card",
    status: "approved",
    tags: ["software", "subscription"]
  },
  {
    id: "3",
    description: "Business lunch with client",
    amount: 125.75,
    category: "Meals & Entertainment",
    date: "2024-01-18",
    vendor: "Restaurant ABC",
    paymentMethod: "Personal Card",
    status: "pending",
    tags: ["meals", "client"]
  },
  {
    id: "4",
    description: "Travel expenses - Conference",
    amount: 1250.00,
    category: "Travel",
    date: "2024-01-15",
    vendor: "Various",
    paymentMethod: "Company Card",
    status: "approved",
    receiptUrl: "#",
    tags: ["travel", "conference"]
  }
];

const categories = [
  "Office Supplies",
  "Software",
  "Meals & Entertainment",
  "Travel",
  "Marketing",
  "Utilities",
  "Professional Services",
  "Equipment",
  "Other"
];

export function ExpenseList() {
  const [expenses] = useState<Expense[]>(mockExpenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = filteredExpenses.filter(e => e.status === "pending").length;

  const getStatusColor = (status: Expense["status"]) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  const handleApprove = (expenseId: string) => {
    toast({
      title: "Expense approved",
      description: "The expense has been approved successfully.",
    });
  };

  const handleReject = (expenseId: string) => {
    toast({
      title: "Expense rejected",
      description: "The expense has been rejected.",
      variant: "destructive",
    });
  };

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
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
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
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
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
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{expense.description}</div>
                      <div className="flex gap-1 mt-1">
                        {expense.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.vendor}</TableCell>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(expense.status)}>
                      {expense.status}
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        {expense.status === "pending" && (
                          <>
                            <DropdownMenuItem onClick={() => handleApprove(expense.id)}>
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReject(expense.id)}>
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
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
        onSuccess={() => setShowAddDialog(false)}
      />
    </div>
  );
}