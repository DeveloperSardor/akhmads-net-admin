import { apiClient } from '../client';
import type { PaginatedRequest, PaginatedResponse } from '../types';
import type { AdResponse, AdPricingTier } from './ads.service';
import type { BotResponse } from './bots.service';
import type { WalletTransaction } from './wallet.service';
import type { UserProfile } from './auth.service';

export interface AdminStats {
    activeAds: number;
    impressions: number;
    clicks: number;
    spent: number;
    ctr: number;
    totalRevenue: number;
    platformEarnings: number;
    platformFeePercentage: number;
}

export interface AdminAnalytics {
    categories: { name: string; value: number; revenue?: number; color?: string }[];
    chartData: { date: string; impressions: number; spent: number; clicks: number }[];
}

export const adminService = {
    // --- Ad Moderation ---
    async getPendingAds(params?: PaginatedRequest): Promise<PaginatedResponse<AdResponse>> {
        const response = await apiClient.get<PaginatedResponse<AdResponse>>('/admin/moderation/ads/pending', { params });
        return response.data;
    },
    async getAllModerationAds(params?: PaginatedRequest & { status?: string }): Promise<PaginatedResponse<AdResponse>> {
        const response = await apiClient.get<PaginatedResponse<AdResponse>>('/admin/moderation/ads/all', { params });
        return response.data;
    },
    async getModerationAdDetails(adId: string): Promise<AdResponse> {
        const response = await apiClient.get<AdResponse>(`/admin/moderation/ads/${adId}`);
        return response.data;
    },
    async approveAd(adId: string): Promise<void> {
        await apiClient.post(`/admin/moderation/ads/${adId}/approve`);
    },
    async rejectAd(adId: string, reason?: string): Promise<void> {
        await apiClient.post(`/admin/moderation/ads/${adId}/reject`, { reason });
    },
    async requestAdEdit(adId: string, instruction: string): Promise<void> {
        await apiClient.post(`/admin/moderation/ads/${adId}/request-edit`, { instruction });
    },

    // --- Bot Moderation ---
    async getPendingBots(params?: PaginatedRequest): Promise<PaginatedResponse<BotResponse>> {
        const response = await apiClient.get<PaginatedResponse<BotResponse>>('/admin/moderation/bots', { params });
        return response.data;
    },
    async getAllModerationBots(params?: PaginatedRequest & { status?: string }): Promise<PaginatedResponse<BotResponse>> {
        const response = await apiClient.get<PaginatedResponse<BotResponse>>('/admin/moderation/bots/all', { params });
        return response.data;
    },
    async approveBot(botId: string): Promise<void> {
        await apiClient.post(`/admin/moderation/bots/${botId}/approve`);
    },
    async rejectBot(botId: string, reason?: string): Promise<void> {
        await apiClient.post(`/admin/moderation/bots/${botId}/reject`, { reason });
    },

    // --- Withdrawals ---
    async getPendingWithdrawals(params?: PaginatedRequest): Promise<PaginatedResponse<WalletTransaction>> {
        const response = await apiClient.get<PaginatedResponse<WalletTransaction>>('/admin/withdrawals/pending', { params });
        return response.data;
    },
    async getAllWithdrawals(params?: PaginatedRequest & { status?: string }): Promise<PaginatedResponse<WalletTransaction>> {
        const response = await apiClient.get<PaginatedResponse<WalletTransaction>>('/admin/withdrawals/all', { params });
        return response.data;
    },
    async approveWithdrawal(id: string): Promise<void> {
        await apiClient.post(`/admin/withdrawals/${id}/approve`);
    },
    async rejectWithdrawal(id: string, reason?: string): Promise<void> {
        await apiClient.post(`/admin/withdrawals/${id}/reject`, { reason });
    },

    // --- Users Management ---
    async getAllUsers(params?: PaginatedRequest): Promise<PaginatedResponse<UserProfile>> {
        const response = await apiClient.get<PaginatedResponse<UserProfile>>('/admin/users', { params });
        return response.data;
    },
    async getUserDetails(id: string): Promise<UserProfile> {
        const response = await apiClient.get<UserProfile>(`/admin/users/${id}`);
        return response.data;
    },
    async updateUserRole(id: string, role: string): Promise<void> {
        await apiClient.put(`/admin/users/${id}/role`, { role });
    },
    async banUser(id: string, reason: string): Promise<void> {
        await apiClient.post(`/admin/users/${id}/ban`, { reason });
    },
    async unbanUser(id: string): Promise<void> {
        await apiClient.post(`/admin/users/${id}/unban`);
    },

    // --- Pricing Management ---
    async getAllPricingTiers(): Promise<AdPricingTier[]> {
        const response = await apiClient.get<AdPricingTier[]>('/admin/pricing/tiers');
        return response.data;
    },
    async getActivePricingTiers(): Promise<AdPricingTier[]> {
        const response = await apiClient.get<AdPricingTier[]>('/admin/pricing/tiers/active');
        return response.data;
    },
    async createPricingTier(data: Partial<AdPricingTier>): Promise<AdPricingTier> {
        const response = await apiClient.post<AdPricingTier>('/admin/pricing/tiers', data);
        return response.data;
    },
    async updatePricingTier(id: string, data: Partial<AdPricingTier>): Promise<AdPricingTier> {
        const response = await apiClient.put<AdPricingTier>(`/admin/pricing/tiers/${id}`, data);
        return response.data;
    },
    async deletePricingTier(id: string): Promise<void> {
        await apiClient.delete(`/admin/pricing/tiers/${id}`);
    },
    async bulkCreatePricingTiers(tiers: Partial<AdPricingTier>[]): Promise<void> {
        await apiClient.post('/admin/pricing/tiers/bulk', { tiers });
    },
    async getPlatformFee(): Promise<{ feePercentage: number }> {
        const response = await apiClient.get<{ feePercentage: number }>('/admin/pricing/platform-fee');
        return response.data;
    },
    async updatePlatformFee(feePercentage: number): Promise<void> {
        await apiClient.put('/admin/pricing/platform-fee', { feePercentage });
    },
    async calculatePricingPreview(params: any): Promise<any> {
        const response = await apiClient.post('/admin/pricing/calculate', params);
        return response.data;
    },
    async getPricingStats(): Promise<any> {
        const response = await apiClient.get('/admin/pricing/stats');
        return response.data;
    },

    // --- Stats & Analytics ---
    async getAdminStats(): Promise<AdminStats> {
        const [overviewRes, pricingRes] = await Promise.all([
            apiClient.get('/ads/stats/overview'),
            apiClient.get('/admin/pricing/stats'),
        ]);

        // /ads/stats/overview → { data: { stats: [...] } }
        const statsArr: any[] = overviewRes.data?.data?.stats ?? [];
        const totals = statsArr.reduce(
            (acc, s) => ({
                activeAds: Math.max(acc.activeAds, s.activeAds ?? 0),
                impressions: acc.impressions + (s.impressions ?? 0),
                clicks: acc.clicks + (s.clicks ?? 0),
                spent: acc.spent + (s.spent ?? 0),
            }),
            { activeAds: 0, impressions: 0, clicks: 0, spent: 0 }
        );
        const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;

        // /admin/pricing/stats → tuzilishini tekshirib ko'ramiz
        const pr = pricingRes.data?.data ?? pricingRes.data ?? {};
        const toFloat = (v: unknown) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };

        return {
            activeAds: totals.activeAds,
            impressions: totals.impressions,
            clicks: totals.clicks,
            spent: totals.spent,
            ctr: parseFloat(ctr.toFixed(2)),
            totalRevenue: toFloat(pr.totalRevenue ?? pr.revenue),
            platformEarnings: toFloat(pr.platformEarnings ?? pr.earnings),
            platformFeePercentage: toFloat(pr.platformFeePercentage ?? pr.feePercentage),
        };
    },

    async getAdminAnalytics(): Promise<AdminAnalytics> {
        const response = await apiClient.get('/ads/stats/overview');
        const statsArr: any[] = response.data?.data?.stats ?? [];

        return {
            categories: [],
            chartData: statsArr.map(s => ({
                date: new Date(s.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' }),
                impressions: s.impressions ?? 0,
                spent: s.spent ?? 0,
                clicks: s.clicks ?? 0,
            })),
        };
    },
};