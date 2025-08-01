import { Search, Plus, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const customers = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+1234567890", status: "active", totalOrders: 12, totalSpent: "$2,340" },
  { id: 2, name: "Sarah Wilson", email: "sarah@example.com", phone: "+1234567891", status: "active", totalOrders: 8, totalSpent: "$1,280" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", phone: "+1234567892", status: "inactive", totalOrders: 3, totalSpent: "$450" },
  { id: 4, name: "Emily Brown", email: "emily@example.com", phone: "+1234567893", status: "active", totalOrders: 15, totalSpent: "$3,200" },
];

export default function Customers() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer relationships</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search customers..." className="pl-10" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-foreground">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm font-medium">{customer.totalOrders} orders</p>
                    <p className="text-sm text-muted-foreground">{customer.totalSpent} spent</p>
                  </div>
                  
                  <Badge 
                    variant={customer.status === "active" ? "default" : "secondary"}
                    className={customer.status === "active" ? "bg-success text-success-foreground" : ""}
                  >
                    {customer.status}
                  </Badge>
                  
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}