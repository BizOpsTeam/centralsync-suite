import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Plus, TrendingUp, TrendingDown, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  period: "monthly" | "quarterly" | "yearly";
  status: "on-track" | "warning" | "exceeded";
}

const mockBudgets: Budget[] = [
  {
    id: "1",
    category: "Office Supplies",
    allocated: 1500,
    spent: 1250,
    period: "monthly",
    status: "on-track"
  },
  {
    id: "2",
    category: "Travel",
    allocated: 3000,
    spent: 3450,
    period: "monthly",
    status: "exceeded"
  },
  {
    id: "3",
    category: "Software",
    allocated: 800,
    spent: 750,
    period: "monthly",
    status: "warning"
  },
  {
    id: "4",
    category: "Marketing",
    allocated: 2000,
    spent: 980,
    period: "monthly",
    status: "on-track"
  },
  {
    id: "5",
    category: "Meals & Entertainment",
    allocated: 1200,
    spent: 1180,
    period: "monthly",
    status: "warning"
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

export function BudgetTracker() {
  const [budgets] = useState<Budget[]>(mockBudgets);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: "",
    allocated: "",
    period: "monthly" as const
  });
  const { toast } = useToast();

  const totalAllocated = budgets.reduce((sum, budget) => sum + budget.allocated, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const utilizationRate = (totalSpent / totalAllocated) * 100;

  const getStatusColor = (status: Budget["status"]) => {
    switch (status) {
      case "on-track": return "default";
      case "warning": return "secondary";
      case "exceeded": return "destructive";
      default: return "outline";
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return "bg-red-500";
    if (percentage > 85) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleAddBudget = () => {
    if (!newBudget.category || !newBudget.allocated) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Budget created",
      description: `Budget for ${newBudget.category} has been set.`,
    });

    setNewBudget({
      category: "",
      allocated: "",
      period: "monthly"
    });
    setShowAddDialog(false);
  };

  const exceedingBudgets = budgets.filter(b => b.status === "exceeded").length;
  const warningBudgets = budgets.filter(b => b.status === "warning").length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAllocated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {utilizationRate.toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exceeded Budgets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{exceedingBudgets}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningBudgets}</div>
            <p className="text-xs text-muted-foreground">Close to limit</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Budget Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Budget Categories</h2>
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
                <Select value={newBudget.category} onValueChange={(value) => setNewBudget(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => !budgets.some(b => b.category === cat)).map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allocated">Allocated Amount</Label>
                <Input
                  id="allocated"
                  type="number"
                  placeholder="0.00"
                  value={newBudget.allocated}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, allocated: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Period</Label>
                <Select value={newBudget.period} onValueChange={(value) => setNewBudget(prev => ({ ...prev, period: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBudget}>
                  Add Budget
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.allocated) * 100;
          const remaining = budget.allocated - budget.spent;
          
          return (
            <Card key={budget.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{budget.category}</CardTitle>
                  <Badge variant={getStatusColor(budget.status)}>
                    {budget.status.replace("-", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spent: ${budget.spent.toLocaleString()}</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Budget: ${budget.allocated.toLocaleString()}</span>
                    <span>
                      {remaining >= 0 ? `$${remaining.toLocaleString()} left` : `$${Math.abs(remaining).toLocaleString()} over`}
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                {budget.status === "exceeded" && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    Budget exceeded by ${Math.abs(remaining).toLocaleString()}
                  </div>
                )}

                {budget.status === "warning" && percentage > 85 && (
                  <div className="flex items-center gap-2 text-yellow-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    {(100 - percentage).toFixed(1)}% remaining
                  </div>
                )}

                <div className="text-xs text-muted-foreground capitalize">
                  {budget.period} budget
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No budgets set</h3>
          <p className="text-muted-foreground mb-4">
            Create budgets to track your spending by category
          </p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Budget
          </Button>
        </div>
      )}
    </div>
  );
}