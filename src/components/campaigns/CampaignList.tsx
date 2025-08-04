import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, MoreHorizontal, Mail, MessageSquare, Calendar, Users, TrendingUp, Trash2, Edit, Copy, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

import { getCampaigns, deleteCampaign } from "@/api/campaigns";
import { useAuth } from "@/contexts/AuthContext";
import type { ICampaign } from "@/types/Campaign";

export function CampaignList() {
    const { accessToken } = useAuth();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Fetch campaigns
    const { data: campaignsResponse, isLoading, isError } = useQuery({
        queryKey: ["campaigns"],
        queryFn: () => getCampaigns(accessToken!),
        enabled: !!accessToken,
    });

    // Delete campaign mutation
    const deleteCampaignMutation = useMutation({
        mutationFn: (campaignId: string) => deleteCampaign(accessToken!, campaignId),
        onSuccess: () => {
            toast.success("Campaign deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete campaign");
        },
    });

    const campaigns = campaignsResponse?.data || [];

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             campaign.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || getCampaignStatus(campaign) === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getCampaignStatus = (campaign: ICampaign) => {
        if (campaign.schedule) {
            const scheduledDate = new Date(campaign.schedule);
            const now = new Date();
            return scheduledDate > now ? "scheduled" : "sent";
        }
        return "sent";
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "sent": return "default";
            case "scheduled": return "secondary";
            case "draft": return "outline";
            default: return "outline";
        }
    };

    const handleDelete = (campaignId: string) => {
        if (confirm("Are you sure you want to delete this campaign?")) {
            deleteCampaignMutation.mutate(campaignId);
        }
    };

    const handleDuplicate = (campaign: ICampaign) => {
        // This would typically open a create campaign modal with pre-filled data
        toast.success("Campaign duplicated - implement create modal");
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-[180px]" />
                    <Skeleton className="h-10 w-[180px]" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Failed to load campaigns</h3>
                <p className="text-muted-foreground">Please try again later.</p>
            </div>
        );
    }

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
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Campaign Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCampaigns.map((campaign) => {
                    const status = getCampaignStatus(campaign);
                    const recipientCount = campaign.recipients?.length || 0;
                    
                    return (
                        <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                Email Campaign
                                            </span>
                                            <Badge variant={getStatusColor(status)}>
                                                {status}
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
                                            <DropdownMenuItem>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDuplicate(campaign)}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Duplicate
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => handleDelete(campaign.id)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
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
                                    <span className="text-sm">
                                        {recipientCount.toLocaleString()} recipients
                                    </span>
                                </div>

                                {/* Schedule info */}
                                {campaign.schedule && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {campaign.broadcastToAll ? "Broadcast to all customers" : "Custom recipients"}
                                        </span>
                                    </div>
                                )}

                                {/* Message preview */}
                                <div className="text-sm text-muted-foreground">
                                    {campaign.message.length > 100 
                                        ? `${campaign.message.substring(0, 100)}...` 
                                        : campaign.message
                                    }
                                </div>

                                {/* Created date */}
                                <div className="text-xs text-muted-foreground">
                                    Created: {format(new Date(campaign.createdAt), "MMM d, yyyy")}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filteredCampaigns.length === 0 && (
                <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No campaigns found</h3>
                    <p className="text-muted-foreground">
                        {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your filters"
                            : "Create your first campaign to get started"}
                    </p>
                </div>
            )}
        </div>
    );
}