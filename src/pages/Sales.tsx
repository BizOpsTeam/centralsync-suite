import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesList } from "@/components/sales/SalesList";
import { InvoiceList } from "@/components/sales/InvoiceList";
import { QuotesList } from "@/components/sales/QuotesList";
import { NewSaleModal } from "@/components/sales/NewSaleModal";
import { QuickSaleModal } from "@/components/sales/QuickSaleModal";
import { Plus, Receipt, FileText, Calculator, Zap } from "lucide-react";

export default function Sales() {
  const [activeTab, setActiveTab] = useState("sales");
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [showQuickSaleModal, setShowQuickSaleModal] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales & Invoicing</h1>
          <p className="text-muted-foreground">Manage sales, invoices, and customer transactions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewSaleModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
          <Button variant="outline" onClick={() => setShowQuickSaleModal(true)}>
            <Zap className="h-4 w-4 mr-2" />
            Quick Sale
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,350</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">$8,450 total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Quotes</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">$15,250 potential</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4">
          <SalesList />
        </TabsContent>
        
        <TabsContent value="invoices" className="space-y-4">
          <InvoiceList />
        </TabsContent>
        
        <TabsContent value="quotes" className="space-y-4">
          <QuotesList />
        </TabsContent>
      </Tabs>

      {/* New Sale Modal */}
      <NewSaleModal 
        open={showNewSaleModal} 
        onOpenChange={setShowNewSaleModal} 
      />

      {/* Quick Sale Modal */}
      <QuickSaleModal 
        open={showQuickSaleModal} 
        onOpenChange={setShowQuickSaleModal} 
      />
    </div>
  );
}