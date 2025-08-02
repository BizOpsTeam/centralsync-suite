import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { CreateCampaign } from "@/components/campaigns/CreateCampaign";
import { CampaignAnalytics } from "@/components/campaigns/CampaignAnalytics";

export default function Campaigns() {
  const [activeTab, setActiveTab] = useState("campaigns");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Campaign Management</h1>
        <p className="text-muted-foreground">Create and manage your marketing campaigns</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="create">Create Campaign</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <CampaignList />
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <CreateCampaign onSuccess={() => setActiveTab("campaigns")} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <CampaignAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}