export interface ICampaign {
    id: string;
    name: string;
    message: string;
    broadcastToAll: boolean;
    schedule?: string;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
    recipients: ICampaignRecipient[];
}

export interface ICampaignRecipient {
    id: string;
    campaignId: string;
    customerId: string;
    customer?: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
    };
}

export interface ICampaignPayload {
    name: string;
    message: string;
    broadcastToAll: boolean;
    recipients: string[]; // array of customer IDs
    schedule?: string; // ISO string
}

export interface ICampaignsResponse {
    data: ICampaign[];
    message: string;
}

export interface ICampaignStats {
    totalCampaigns: number;
    totalRecipients: number;
    sentCampaigns: number;
    scheduledCampaigns: number;
    averageRecipients: number;
}

export interface ICampaignFilter {
    search?: string;
    status?: 'all' | 'scheduled' | 'sent' | 'draft';
    dateRange?: {
        start: string;
        end: string;
    };
} 