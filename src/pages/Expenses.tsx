import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { ExpenseAnalytics } from "@/components/expenses/ExpenseAnalytics";
import { BudgetTracker } from "@/components/expenses/BudgetTracker";

export default function Expenses() {
  const [activeTab, setActiveTab] = useState("expenses");

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Expense Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Track and manage your business expenses</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expenses" className="text-xs sm:text-sm">Expenses</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
          <TabsTrigger value="budgets" className="text-xs sm:text-sm">Budgets</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4 sm:space-y-6">
          <ExpenseList />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
          <ExpenseAnalytics />
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4 sm:space-y-6">
          <BudgetTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}