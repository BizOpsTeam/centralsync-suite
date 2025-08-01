import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Eye, Edit, Send, Download } from "lucide-react";

interface Invoice {
  id: string;
  number: string;
  customer: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string;
  createdDate: string;
}

export function InvoiceList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock invoices
  const invoices: Invoice[] = [
    {
      id: "1",
      number: "INV-001",
      customer: "John Doe",
      amount: 1250.00,
      status: "paid",
      dueDate: "2024-01-15",
      createdDate: "2024-01-01"
    },
    {
      id: "2",
      number: "INV-002",
      customer: "ACME Corporation",
      amount: 3500.00,
      status: "sent",
      dueDate: "2024-01-20",
      createdDate: "2024-01-05"
    },
    {
      id: "3",
      number: "INV-003",
      customer: "Jane Smith",
      amount: 890.00,
      status: "overdue",
      dueDate: "2024-01-10",
      createdDate: "2023-12-25"
    },
    {
      id: "4",
      number: "INV-004",
      customer: "Tech Solutions Ltd",
      amount: 2100.00,
      status: "draft",
      dueDate: "2024-01-25",
      createdDate: "2024-01-08"
    }
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Invoice["status"]) => {
    const variants = {
      draft: "secondary",
      sent: "default",
      paid: "default",
      overdue: "destructive"
    };
    
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800"
    };

    return (
      <Badge variant={variants[status] as any} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Invoice Management
          </CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Invoices Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.number}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(invoice.createdDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No invoices found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}