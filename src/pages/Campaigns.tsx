import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { CampaignAnalytics } from "@/components/campaigns/CampaignAnalytics";
import { CreateCampaign } from "@/components/campaigns/CreateCampaign";
import { Plus, Mail, BarChart3, Target } from "lucide-react";

export default function Campaigns() {
    const [activeTab, setActiveTab] = useState("campaigns");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleCampaignCreated = () => {
        setShowCreateModal(false);
        // The campaign list will automatically refresh due to query invalidation
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
                    <p className="text-muted-foreground">Manage your email campaigns and track performance</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Campaign
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">+2 from last week</p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2,847</div>
                        <p className="text-xs text-muted-foreground">+15% from last month</p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">68.4%</div>
                        <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="campaigns" className="space-y-4">
                    <CampaignList />
                </TabsContent>
                
                <TabsContent value="analytics" className="space-y-4">
                    <CampaignAnalytics />
                </TabsContent>
            </Tabs>

            {/* Create Campaign Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-background rounded-lg border shadow-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold">Create New Campaign</h2>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        ×
                                    </Button>
                                </div>
                                <CreateCampaign onSuccess={handleCampaignCreated} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}