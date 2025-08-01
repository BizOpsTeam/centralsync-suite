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
import { Search, Plus, MoreHorizontal, Eye, Edit, Send, FileText, CheckCircle } from "lucide-react";

interface Quote {
  id: string;
  number: string;
  customer: string;
  amount: number;
  status: "draft" | "sent" | "accepted" | "declined" | "expired";
  expiryDate: string;
  createdDate: string;
}

export function QuotesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock quotes
  const quotes: Quote[] = [
    {
      id: "1",
      number: "QUO-001",
      customer: "John Doe",
      amount: 2500.00,
      status: "sent",
      expiryDate: "2024-02-15",
      createdDate: "2024-01-15"
    },
    {
      id: "2",
      number: "QUO-002",
      customer: "ACME Corporation",
      amount: 15000.00,
      status: "accepted",
      expiryDate: "2024-02-20",
      createdDate: "2024-01-10"
    },
    {
      id: "3",
      number: "QUO-003",
      customer: "Jane Smith",
      amount: 1200.00,
      status: "draft",
      expiryDate: "2024-02-25",
      createdDate: "2024-01-20"
    },
    {
      id: "4",
      number: "QUO-004",
      customer: "Tech Solutions Ltd",
      amount: 8500.00,
      status: "expired",
      expiryDate: "2024-01-15",
      createdDate: "2024-01-01"
    }
  ];

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Quote["status"]) => {
    const variants = {
      draft: "secondary",
      sent: "default",
      accepted: "default",
      declined: "destructive",
      expired: "secondary"
    };
    
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      accepted: "bg-green-100 text-green-800",
      declined: "bg-red-100 text-red-800",
      expired: "bg-orange-100 text-orange-800"
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
            Quotes & Estimates
          </CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Quote
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quotes..."
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
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quotes Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.number}</TableCell>
                  <TableCell>{quote.customer}</TableCell>
                  <TableCell>${quote.amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(quote.status)}</TableCell>
                  <TableCell>{new Date(quote.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(quote.createdDate).toLocaleDateString()}</TableCell>
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
                          <FileText className="h-4 w-4 mr-2" />
                          Convert to Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Accepted
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredQuotes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No quotes found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}