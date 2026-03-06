import { apiClient } from "../client";
import type { PaginatedRequest, PaginatedResponse } from "../types";
import type { AdResponse, AdPricingTier } from "./ads.service";
import type { BotResponse } from "./bots.service";
import type { WalletTransaction } from "./wallet.service";
import type { UserProfile } from "./auth.service";

export interface AdminStats {
  activeAds: number;
  activeAdsCount?: number;
  impressions: number;
  clicks: number;
  spent: number;
  ctr: number;
  totalRevenue: number;
  platformEarnings: number;
  platformFeePercentage: number;
  // Dashboard uchun qo'shimcha fieldlar
  pendingModeration?: number;
  activeBots?: number;
  totalSpent?: number;
}

export interface AdminAnalytics {
  categories: {
    name: string;
    value: number;
    revenue?: number;
    color?: string;
  }[];
  chartData: {
    date: string;
    impressions: number;
    spent: number;
    clicks: number;
  }[];
}

export const adminService = {
  // --- Ad Moderation ---
  async getPendingAds(
    params?: PaginatedRequest,
  ): Promise<PaginatedResponse<AdResponse>> {
    const response = await apiClient.get<PaginatedResponse<AdResponse>>(
      "/admin/moderation/ads/pending",
      { params },
    );
    return response.data;
  },
  async getAllModerationAds(
    params?: PaginatedRequest & { status?: string },
  ): Promise<PaginatedResponse<AdResponse>> {
    const response = await apiClient.get<PaginatedResponse<AdResponse>>(
      "/admin/moderation/ads/all",
      { params },
    );
    return response.data;
  },
  async getAllCampaigns(
    params?: PaginatedRequest & { status?: string; type?: string },
  ): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get<PaginatedResponse<any>>(
      "/admin/moderation/campaigns/all",
      { params },
    );
    return response.data;
  },
  async getModerationAdDetails(adId: string): Promise<AdResponse> {
    const response = await apiClient.get<AdResponse>(
      `/admin/moderation/ads/${adId}`,
    );
    return response.data;
  },
  async approveAd(adId: string): Promise<void> {
    await apiClient.post(`/admin/moderation/ads/${adId}/approve`);
  },
  async rejectAd(adId: string, reason?: string): Promise<void> {
    await apiClient.post(`/admin/moderation/ads/${adId}/reject`, { reason });
  },
  async requestAdEdit(adId: string, feedback: string): Promise<void> {
    await apiClient.post(`/admin/moderation/ads/${adId}/request-edit`, {
      feedback,
    });
  },
  async pauseAd(adId: string): Promise<void> {
    await apiClient.post(`/admin/ads/${adId}/pause`);
  },
  async resumeAd(adId: string): Promise<void> {
    await apiClient.post(`/admin/ads/${adId}/resume`);
  },
  async deleteAd(adId: string): Promise<void> {
    await apiClient.delete(`/admin/ads/${adId}`);
  },

  // --- Bot Moderation ---
  async getPendingBots(
    params?: PaginatedRequest,
  ): Promise<PaginatedResponse<BotResponse>> {
    const response = await apiClient.get<PaginatedResponse<BotResponse>>(
      "/admin/moderation/bots",
      { params },
    );
    return response.data;
  },
  async getAllModerationBots(
    params?: PaginatedRequest & { status?: string },
  ): Promise<PaginatedResponse<BotResponse>> {
    const response = await apiClient.get<PaginatedResponse<BotResponse>>(
      "/admin/moderation/bots/all",
      { params },
    );
    return response.data;
  },
  async approveBot(botId: string): Promise<void> {
    await apiClient.post(`/admin/moderation/bots/${botId}/approve`);
  },
  async rejectBot(botId: string, reason?: string): Promise<void> {
    await apiClient.post(`/admin/moderation/bots/${botId}/reject`, { reason });
  },

  // --- Withdrawals ---
  async getPendingWithdrawals(
    params?: PaginatedRequest,
  ): Promise<PaginatedResponse<WalletTransaction>> {
    const response = await apiClient.get<PaginatedResponse<WalletTransaction>>(
      "/admin/withdrawals/pending",
      { params },
    );
    return response.data;
  },
  async getAllWithdrawals(
    params?: PaginatedRequest & { status?: string },
  ): Promise<PaginatedResponse<WalletTransaction>> {
    const response = await apiClient.get<PaginatedResponse<WalletTransaction>>(
      "/admin/withdrawals/all",
      { params },
    );
    return response.data;
  },
  async approveWithdrawal(id: string): Promise<void> {
    await apiClient.post(`/admin/withdrawals/${id}/approve`);
  },
  async rejectWithdrawal(id: string, reason?: string): Promise<void> {
    await apiClient.post(`/admin/withdrawals/${id}/reject`, { reason });
  },

  // --- Users Management ---
  async getAllUsers(
    params?: PaginatedRequest,
  ): Promise<PaginatedResponse<UserProfile>> {
    const response = await apiClient.get<PaginatedResponse<UserProfile>>(
      "/admin/users",
      { params },
    );
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
  async topUpUserWallet(
    id: string,
    amount: number,
    reason: string,
  ): Promise<void> {
    await apiClient.post(`/admin/users/${id}/topup`, { amount, reason });
  },

  // --- Pricing Management ---
  async getAllPricingTiers(): Promise<AdPricingTier[]> {
    const response = await apiClient.get<AdPricingTier[]>(
      "/admin/pricing/tiers",
    );
    return response.data;
  },
  async getActivePricingTiers(): Promise<AdPricingTier[]> {
    const response = await apiClient.get<AdPricingTier[]>(
      "/admin/pricing/tiers/active",
    );
    return response.data;
  },
  async createPricingTier(
    data: Partial<AdPricingTier>,
  ): Promise<AdPricingTier> {
    const response = await apiClient.post<AdPricingTier>(
      "/admin/pricing/tiers",
      data,
    );
    return response.data;
  },
  async updatePricingTier(
    id: string,
    data: Partial<AdPricingTier>,
  ): Promise<AdPricingTier> {
    const response = await apiClient.put<AdPricingTier>(
      `/admin/pricing/tiers/${id}`,
      data,
    );
    return response.data;
  },
  async deletePricingTier(id: string): Promise<void> {
    await apiClient.delete(`/admin/pricing/tiers/${id}`);
  },
  async bulkCreatePricingTiers(tiers: Partial<AdPricingTier>[]): Promise<void> {
    await apiClient.post("/admin/pricing/tiers/bulk", { tiers });
  },
  async getPlatformFee(): Promise<{ feePercentage: number }> {
    const response = await apiClient.get<{ feePercentage: number }>(
      "/admin/pricing/platform-fee",
    );
    return response.data;
  },
  async updatePlatformFee(feePercentage: number): Promise<void> {
    await apiClient.put("/admin/pricing/platform-fee", { feePercentage });
  },
  async calculatePricingPreview(params: any): Promise<any> {
    const response = await apiClient.post("/admin/pricing/calculate", params);
    return response.data;
  },
  async getPricingStats(): Promise<any> {
    const response = await apiClient.get("/admin/pricing/stats");
    return response.data;
  },

  // --- Stats & Analytics ---
  async getAdminStats(): Promise<AdminStats> {
    const [overviewRes, pricingRes] = await Promise.all([
      apiClient.get("/ads/stats/overview"),
      apiClient.get("/admin/pricing/stats"),
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
      { activeAds: 0, impressions: 0, clicks: 0, spent: 0 },
    );
    const ctr =
      totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;

    // /admin/pricing/stats → tuzilishini tekshirib ko'ramiz
    const pr = pricingRes.data?.data ?? pricingRes.data ?? {};
    const toFloat = (v: unknown) => {
      const n = parseFloat(String(v ?? 0));
      return isNaN(n) ? 0 : n;
    };

    return {
      activeAds: totals.activeAds,
      impressions: totals.impressions,
      clicks: totals.clicks,
      spent: totals.spent,
      ctr: parseFloat(ctr.toFixed(2)),
      totalRevenue: toFloat(pr.totalRevenue ?? pr.revenue),
      platformEarnings: toFloat(pr.platformEarnings ?? pr.earnings),
      platformFeePercentage: toFloat(
        pr.platformFeePercentage ?? pr.feePercentage,
      ),
    };
  },

  async getAdminAnalytics(period?: string): Promise<AdminAnalytics> {
    const params = period ? { period } : {};
    const response = await apiClient.get("/ads/stats/overview", { params });
    const statsArr: any[] = response.data?.data?.stats ?? [];

    return {
      categories: [],
      chartData: statsArr.map((s) => ({
        date: new Date(s.date).toLocaleDateString("uz-UZ", {
          day: "2-digit",
          month: "2-digit",
        }),
        impressions: s.impressions ?? 0,
        spent: s.spent ?? 0,
        clicks: s.clicks ?? 0,
      })),
    };
  },

  async getRevenueChart(period: string = "14d"): Promise<{ date: string; revenue: number; impressions: number; clicks: number }[]> {
    const [overviewRes, pricingRes] = await Promise.allSettled([
      apiClient.get("/ads/stats/overview", { params: { period } }),
      apiClient.get("/admin/pricing/stats"),
    ]);
    const statsArr: any[] = overviewRes.status === "fulfilled"
      ? (overviewRes.value.data?.data?.stats ?? [])
      : [];
    const toFloat = (v: unknown) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };
    const feePercent = pricingRes.status === "fulfilled"
      ? toFloat((pricingRes.value.data?.data ?? pricingRes.value.data)?.platformFeePercentage ?? (pricingRes.value.data?.data ?? pricingRes.value.data)?.feePercentage ?? 10)
      : 10;

    return statsArr.map((s) => ({
      date: new Date(s.date).toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" }),
      revenue: toFloat(s.spent) * (feePercent / 100),
      impressions: s.impressions ?? 0,
      clicks: s.clicks ?? 0,
    }));
  },

  // --- Detailed Stats ---
  async getImpressions(params?: any): Promise<any> {
    const response = await apiClient.get("/admin/detailed-stats/impressions", {
      params,
    });
    return response.data;
  },
  async getImpressionsExport(params?: any): Promise<any[]> {
    const response = await apiClient.get(
      "/admin/detailed-stats/impressions/export",
      { params },
    );
    return response.data?.data || [];
  },
  async getClicks(params?: any): Promise<any> {
    const response = await apiClient.get("/admin/detailed-stats/clicks", {
      params,
    });
    return response.data;
  },
  async getClicksExport(params?: any): Promise<any[]> {
    const response = await apiClient.get(
      "/admin/detailed-stats/clicks/export",
      { params },
    );
    return response.data?.data || [];
  },
  async getBotUsersAdmin(botId: string, params?: any): Promise<any> {
    const response = await apiClient.get(
      `/admin/detailed-stats/bot/${botId}/users`,
      { params },
    );
    return response.data;
  },
  async getBotUsersExport(botId: string, params?: any): Promise<any[]> {
    const response = await apiClient.get(
      `/admin/detailed-stats/bot/${botId}/export`,
      { params },
    );
    return response.data?.data || [];
  },
  async getAllBroadcasts(params?: any): Promise<any> {
    const response = await apiClient.get("/admin/broadcasts", { params });
    return response.data;
  },
  async approveBroadcast(id: string): Promise<void> {
    await apiClient.post(`/admin/broadcasts/${id}/approve`);
  },
  async rejectBroadcast(id: string, reason: string): Promise<void> {
    await apiClient.post(`/admin/broadcasts/${id}/reject`, { reason });
  },
  async requestBroadcastEdit(id: string, feedback: string): Promise<void> {
    await apiClient.post(`/admin/broadcasts/${id}/request-edit`, { feedback });
  },
  async pauseBroadcast(id: string): Promise<void> {
    await apiClient.post(`/admin/broadcasts/${id}/pause`);
  },
  async resumeBroadcast(id: string): Promise<void> {
    await apiClient.post(`/admin/broadcasts/${id}/resume`);
  },
  async getAllBots(params?: any): Promise<any> {
    const response = await apiClient.get("/admin/moderation/bots/all", {
      params,
    });
    return response.data;
  },
};
