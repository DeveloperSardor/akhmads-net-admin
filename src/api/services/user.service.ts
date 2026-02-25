import { apiClient } from '../client';
import type { UserProfile } from './auth.service';

export interface UpdateProfileRequest {
    firstName: string;
    lastName?: string;
    email?: string;
    username?: string;
    locale?: string;
}

export interface UserStatsResponse {
    totalAdsCreated: number;
    totalViews: number;
    totalClicks: number;
    totalSpent: number;
    activeBots: number;
}

export const userService = {
    /**
     * Retrieves the current user's profile which optionally includes wallet and advanced stats.
     * This is slightly more comprehensive than /auth/me depending on the backend.
     */
    async getProfile(): Promise<UserProfile> {
        const response = await apiClient.get<UserProfile>('/user/profile');
        return response.data;
    },

    /**
     * Updates basic user profile information
     */
    async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
        const response = await apiClient.put<UserProfile>('/user/profile', data);
        return response.data;
    },

    /**
     * Retrieves user-wide stats across all ads and bots
     */
    async getStats(): Promise<UserStatsResponse> {
        const response = await apiClient.get<UserStatsResponse>('/user/stats');
        return response.data;
    },
};
