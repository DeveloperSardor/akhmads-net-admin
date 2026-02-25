import { apiClient } from '../client';

export interface AIPromptRequest {
    text: string;
    context?: string;
    tone?: string;
}

export interface GeneratedVariationsResponse {
    variations: string[];
}

export interface CheckSafetyResponse {
    isSafe: boolean;
    spamScore: number;
    flags: string[];
}

export const aiService = {
    async optimizeAdText(text: string): Promise<{ optimizedText: string }> {
        const response = await apiClient.post<{ optimizedText: string }>('/ai/optimize-text', { text });
        return response.data;
    },

    async generateTextVariations(data: AIPromptRequest): Promise<GeneratedVariationsResponse> {
        const response = await apiClient.post<GeneratedVariationsResponse>('/ai/generate-variations', data);
        return response.data;
    },

    async suggestEmojis(text: string): Promise<{ emojis: string[] }> {
        const response = await apiClient.post<{ emojis: string[] }>('/ai/suggest-emojis', { text });
        return response.data;
    },

    async optimizeButtonText(text: string): Promise<{ buttonOptions: string[] }> {
        const response = await apiClient.post<{ buttonOptions: string[] }>('/ai/optimize-button', { text });
        return response.data;
    },

    async checkContentSafety(text: string): Promise<CheckSafetyResponse> {
        const response = await apiClient.post<CheckSafetyResponse>('/ai/check-safety', { text });
        return response.data;
    },

    async checkSpam(text: string): Promise<{ isSpam: boolean, confidence: number }> {
        const response = await apiClient.post<{ isSpam: boolean, confidence: number }>('/ai/check-spam', { text });
        return response.data;
    },

    async comprehensiveSafetyCheck(data: { title?: string, text?: string, mediaUrl?: string }): Promise<CheckSafetyResponse> {
        const response = await apiClient.post<CheckSafetyResponse>('/ai/comprehensive-check', data);
        return response.data;
    },

    async analyzeAd(adId: string): Promise<{ score: number, suggestions: string[] }> {
        const response = await apiClient.post<{ score: number, suggestions: string[] }>('/ai/analyze-ad', { adId });
        return response.data;
    }
};
