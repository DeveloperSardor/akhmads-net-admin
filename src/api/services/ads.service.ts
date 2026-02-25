import { apiClient } from '../client';
import type { PaginatedRequest, PaginatedResponse } from '../types';

export interface AdPricingTier {
    id: string;
    name: string;
    minCpm: number;
    features: string[];
}

export interface AdEstimateRequest {
    impressions: number;
    category: string;
    cpmBid: number;
}

export interface AdEstimateResponse {
    estimatedCost: number;
    estimatedReach: number;
    recommendedCpm: number;
}

export interface AdTargetingOptions {
    languages: { code: string; name: string }[];
    countries: { code: string; name: string }[];
    categories: string[];
}

export interface CreateAdRequest {
    contentType: 'TEXT' | 'IMAGE' | 'VIDEO';
    title?: string;
    text?: string;
    mediaUrl?: string;
    targetImpressions: number;
    cpmBid: number;
    buttons?: { text: string; url: string }[];
    targeting?: {
        languages?: string[];
        countries?: string[];
        categories?: string[];
    };
}

export interface AdPreviewRequest {
    contentType: 'TEXT' | 'IMAGE' | 'VIDEO';
    title?: string;
    text?: string;
    mediaUrl?: string;
    buttons?: { text: string; url: string }[];
}

export interface AdScheduleRequest {
    startDate: string;
    endDate: string;
    timezone: string;
    activeDays: number[];
    activeHours: number[];
}

export interface AdResponse {
    id: string;
    status: 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'REJECTED' | 'ARCHIVED';
    title?: string;
    createdAt: string;
    updatedAt: string;
    // ... other fields based on DB model
}

export interface AdStatsOverviewResponse {
    totalImpressions: number;
    totalSpend: number;
    activeAdsCount: number;
    averageCtr: number;
}

export interface AdPerformanceResponse {
    impressions: number;
    clicks: number;
    ctr: number;
    spent: number;
    remainingBudget: number;
}

export const adsService = {
    // --- Pricing & Estimates ---
    async getPricingTiers(): Promise<AdPricingTier[]> {
        const response = await apiClient.get<AdPricingTier[]>('/ads/pricing');
        return response.data;
    },
    async getPricingEstimate(data: AdEstimateRequest): Promise<AdEstimateResponse> {
        const response = await apiClient.post<AdEstimateResponse>('/ads/pricing/estimate', data);
        return response.data;
    },
    async getTargetingOptions(): Promise<AdTargetingOptions> {
        const response = await apiClient.get<AdTargetingOptions>('/ads/targeting/options');
        return response.data;
    },

    // --- Ad Creation & Preview ---
    async createAd(data: CreateAdRequest): Promise<AdResponse> {
        const response = await apiClient.post<AdResponse>('/ads', data);
        return response.data;
    },
    async previewAd(data: AdPreviewRequest): Promise<any> {
        const response = await apiClient.post('/ads/preview', data);
        return response.data;
    },

    // --- Fetching Ads ---
    async getMyAds(params?: PaginatedRequest & { status?: string }): Promise<PaginatedResponse<AdResponse>> {
        const response = await apiClient.get<PaginatedResponse<AdResponse>>('/ads', { params });
        return response.data;
    },
    async getSavedAds(): Promise<AdResponse[]> {
        const response = await apiClient.get<AdResponse[]>('/ads/saved');
        return response.data;
    },
    async getAdById(adId: string): Promise<AdResponse> {
        const response = await apiClient.get<AdResponse>(`/ads/${adId}`);
        return response.data;
    },

    // --- Media Uploads ---
    async uploadMedia(file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('media', file);
        const response = await apiClient.post<{ url: string }>('/ads/upload-media', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    async uploadMediaBase64(base64Data: string): Promise<{ url: string }> {
        const response = await apiClient.post<{ url: string }>('/ads/upload-base64', { base64Data });
        return response.data;
    },

    // --- Ad Lifecycle Management ---
    async updateAd(adId: string, data: Partial<CreateAdRequest>): Promise<AdResponse> {
        const response = await apiClient.put<AdResponse>(`/ads/${adId}`, data);
        return response.data;
    },
    async deleteAd(adId: string): Promise<void> {
        await apiClient.delete(`/ads/${adId}`);
    },
    async submitForReview(adId: string): Promise<void> {
        await apiClient.post(`/ads/${adId}/submit`);
    },
    async pauseAd(adId: string): Promise<void> {
        await apiClient.post(`/ads/${adId}/pause`);
    },
    async resumeAd(adId: string): Promise<void> {
        await apiClient.post(`/ads/${adId}/resume`);
    },
    async duplicateAd(adId: string): Promise<AdResponse> {
        const response = await apiClient.post<AdResponse>(`/ads/${adId}/duplicate`);
        return response.data;
    },
    async archiveAd(adId: string): Promise<void> {
        await apiClient.post(`/ads/${adId}/archive`);
    },
    async unarchiveAd(adId: string): Promise<void> {
        await apiClient.post(`/ads/${adId}/unarchive`);
    },
    async toggleSaveAd(adId: string): Promise<void> {
        await apiClient.post(`/ads/${adId}/save`);
    },

    // --- Ad Scheduling ---
    async setSchedule(adId: string, data: AdScheduleRequest): Promise<void> {
        await apiClient.post(`/ads/${adId}/schedule`, data);
    },
    async removeSchedule(adId: string): Promise<void> {
        await apiClient.delete(`/ads/${adId}/schedule`);
    },

    // --- Ad Analytics & Stats ---
    async getStatsOverview(days: number = 30): Promise<AdStatsOverviewResponse> {
        const response = await apiClient.get<AdStatsOverviewResponse>('/ads/stats/overview', { params: { days } });
        return response.data;
    },
    async getPerformance(adId: string): Promise<AdPerformanceResponse> {
        const response = await apiClient.get<AdPerformanceResponse>(`/ads/${adId}/performance`);
        return response.data;
    },
    async getDailyStats(adId: string, days: number = 30): Promise<any> {
        const response = await apiClient.get(`/ads/${adId}/stats/daily`, { params: { days } });
        return response.data;
    },
    async getHourlyStats(adId: string): Promise<any> {
        const response = await apiClient.get(`/ads/${adId}/stats/hourly`);
        return response.data;
    },
    async getClicks(adId: string, params?: PaginatedRequest): Promise<PaginatedResponse<any>> {
        const response = await apiClient.get<PaginatedResponse<any>>(`/ads/${adId}/clicks`, { params });
        return response.data;
    },

    // --- Export & Testing ---
    async exportImpressions(adId: string): Promise<Blob> {
        const response = await apiClient.get(`/ads/${adId}/export`, { responseType: 'blob' });
        return response.data;
    },
    async sendTestAd(adId: string): Promise<void> {
        await apiClient.post(`/ads/${adId}/test`);
    }
};
