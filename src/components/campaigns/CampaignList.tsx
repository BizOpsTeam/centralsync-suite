import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, MoreHorizontal, Mail, MessageSquare, Calendar, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  name: string;
  type: "email" | "sms";
  status: "draft" | "scheduled" | "sent" | "paused";
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  scheduledDate?: string;
  createdAt: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Summer Sale Announcement",
    type: "email",
    status: "sent",
    recipients: 1250,
    sent: 1250,
    opened: 875,
    clicked: 245,
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    name: "New Product Launch",
    type: "email",
    status: "scheduled",
    recipients: 2100,
    sent: 0,
    opened: 0,
    clicked: 0,
    scheduledDate: "2024-02-01",
    createdAt: "2024-01-20"
  },
  {
    id: "3",
    name: "Abandoned Cart Reminder",
    type: "sms",
    status: "sent",
    recipients: 340,
    sent: 340,
    opened: 298,
    clicked: 89,
    createdAt: "2024-01-18"
  }
];

export function CampaignList() {
  const [campaigns] = useState<Campaign[]>(mockCampaigns);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { toast } = useToast();

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    const matchesType = typeFilter === "all" || campaign.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "sent": return "default";
      case "scheduled": return "secondary";
      case "draft": return "outline";
      case "paused": return "destructive";
      default: return "outline";
    }
  };

  const handleDuplicate = (campaignId: string) => {
    toast({
      title: "Campaign duplicated",
      description: "Campaign has been duplicated successfully.",
    });
  };

  const handleDelete = (campaignId: string) => {
    toast({
      title: "Campaign deleted",
      description: "Campaign has been deleted successfully.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaign Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {campaign.type === "email" ? (
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground capitalize">
                      {campaign.type}
                    </span>
                    <Badge variant={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(campaign.id)}>
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>View Report</DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(campaign.id)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recipients */}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{campaign.recipients.toLocaleString()} recipients</span>
              </div>

              {/* Schedule info */}
              {campaign.scheduledDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Scheduled for {new Date(campaign.scheduledDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Performance metrics */}
              {campaign.status === "sent" && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{campaign.sent}</div>
                    <div className="text-xs text-muted-foreground">Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{campaign.opened}</div>
                    <div className="text-xs text-muted-foreground">Opened</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{campaign.clicked}</div>
                    <div className="text-xs text-muted-foreground">Clicked</div>
                  </div>
                </div>
              )}

              {/* Open rate */}
              {campaign.status === "sent" && campaign.sent > 0 && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    {((campaign.opened / campaign.sent) * 100).toFixed(1)}% open rate
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No campaigns found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first campaign to get started"}
          </p>
        </div>
      )}
    </div>
  );
}