import { apiClient } from '../client';

export interface AdvertiserOverview {
    activeAdsCount: number;
    totalSpent: number;
    totalImpressions: number;
    ctr: number;
    chartData: { date: string; spent: number; impressions: number }[];
}

export interface BotOwnerOverview {
    activeBotsCount: number;
    totalEarned: number;
    totalSubscribers: number;
    chartData: { date: string; earned: number; subscribers: number }[];
}

export interface BotDetailedStats {
    viewsGenerated: number;
    earnings: number;
    activeCampaigns: number;
}

export const analyticsService = {
    /**
     * Dashboard overview for Advertisers
     */
    async getAdvertiserOverview(): Promise<AdvertiserOverview> {
        const response = await apiClient.get<AdvertiserOverview>('/analytics/advertiser/overview');
        return response.data;
    },

    /**
     * Dashboard overview for Bot Owners / Publishers
     */
    async getBotOwnerOverview(): Promise<BotOwnerOverview> {
        const response = await apiClient.get<BotOwnerOverview>('/analytics/owner/overview');
        return response.data;
    },

    /**
     * Analytics breakdown for a specific bot within a given period (e.g. '7d', '30d')
     */
    async getBotDetailedStats(botId: string, period: string = '7d'): Promise<BotDetailedStats> {
        const response = await apiClient.get<BotDetailedStats>(`/analytics/owner/bot/${botId}`, { params: { period } });
        return response.data;
    }
};
