import axios from "axios";
import { BASE_URL } from "./dashboard";
import type { ICampaign, ICampaignPayload, ICampaignsResponse } from "@/types/Campaign";

export const getCampaigns = async (token: string): Promise<ICampaignsResponse> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const response = await axios.get(`${BASE_URL}/campaigns`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return response.data;
};

export const createCampaign = async (token: string, campaignData: ICampaignPayload): Promise<ICampaign> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const response = await axios.post(`${BASE_URL}/campaigns`, campaignData, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return response.data.data;
};

export const deleteCampaign = async (token: string, campaignId: string): Promise<void> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    await axios.delete(`${BASE_URL}/campaigns/${campaignId}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
};

export const updateCampaign = async (token: string, campaignId: string, campaignData: Partial<ICampaignPayload>): Promise<ICampaign> => {
    if (!token) {
        throw new Error("No token provided");
    }
    
    const response = await axios.patch(`${BASE_URL}/campaigns/${campaignId}`, campaignData, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    return response.data.data;
}; 