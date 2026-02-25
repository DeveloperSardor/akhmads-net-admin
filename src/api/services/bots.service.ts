import { apiClient } from '../client';
import type { PaginatedRequest, PaginatedResponse } from '../types';

export interface CreateBotRequest {
    token: string;
    category: string;
    description?: string;
}

export interface BotResponse {
    id: string;
    name: string;
    username: string;
    status: 'ACTIVE' | 'PAUSED' | 'PENDING_REVIEW' | 'REJECTED';
    category: string;
    apiKey: string;
    createdAt: string;
}

export interface UpdateBotRequest {
    category?: string;
    description?: string;
}

export interface BotStatsResponse {
    totalSubscribers: number;
    activeUsers: number;
    totalEarnings: number;
    postsSent: number;
}

export const botsService = {
    /**
     * Register a new Bot using its Telegram Bot Token
     */
    async registerBot(data: CreateBotRequest): Promise<BotResponse> {
        const response = await apiClient.post<BotResponse>('/bots', data);
        return response.data;
    },

    /**
     * Get all bots owned by the current user
     */
    async getMyBots(params?: PaginatedRequest): Promise<PaginatedResponse<BotResponse>> {
        const response = await apiClient.get<PaginatedResponse<BotResponse>>('/bots', { params });
        return response.data;
    },

    /**
     * Get specific bot details
     */
    async getBotById(botId: string): Promise<BotResponse> {
        const response = await apiClient.get<BotResponse>(`/bots/${botId}`);
        return response.data;
    },

    /**
     * Update bot's category or description
     */
    async updateBot(botId: string, data: UpdateBotRequest): Promise<BotResponse> {
        const response = await apiClient.put<BotResponse>(`/bots/${botId}`, data);
        return response.data;
    },

    /**
     * Toggles pause/resume state for the bot in the network
     */
    async togglePauseBot(botId: string): Promise<void> {
        await apiClient.post(`/bots/${botId}/pause`);
    },

    /**
     * Regenerates the internal API key used for the bot integration
     */
    async regenerateApiKey(botId: string): Promise<{ apiKey: string }> {
        const response = await apiClient.post<{ apiKey: string }>(`/bots/${botId}/regenerate-api-key`);
        return response.data;
    },

    /**
     * Updates the actual Telegram bot token if it was revoked
     */
    async updateBotToken(botId: string, token: string): Promise<void> {
        await apiClient.put(`/bots/${botId}/token`, { token });
    },

    /**
     * Deletes the bot from the network
     */
    async deleteBot(botId: string): Promise<void> {
        await apiClient.delete(`/bots/${botId}`);
    },

    /**
     * Retrieves bot performance statistics
     */
    async getBotStats(botId: string, period: string = '7d'): Promise<BotStatsResponse> {
        const response = await apiClient.get<BotStatsResponse>(`/bots/${botId}/stats`, { params: { period } });
        return response.data;
    },

    /**
     * Retrieves code snippets to integrate the bot (Python/Nodejs)
     */
    async getIntegrationCode(botId: string, language: 'python' | 'node' = 'python'): Promise<{ code: string }> {
        const response = await apiClient.get<{ code: string }>(`/bots/${botId}/integration`, { params: { language } });
        return response.data;
    }
};
