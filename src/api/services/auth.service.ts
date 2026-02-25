import { apiClient } from '../client';

export interface TelegramLoginInitResponse {
    loginToken: string;
    deepLink: string;
    code: string;
    codes: string[];
    expiresAt: string;
    expiresIn: number;
}

export interface LoginStatusResponse {
    authorized: boolean;
    tokens?: {
        accessToken: string;
        refreshToken: string;
    };
    user?: UserProfile;
}

export interface UserProfile {
    id: string;
    telegramId: string;
    role: 'ADVERTISER' | 'BOT_OWNER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN' | string;
    roles?: string[];
    firstName: string;
    lastName?: string;
    username?: string;
    createdAt: string;
    updatedAt: string;
}

export const authService = {
    /**
     * Initiates the login flow, receiving a Telegram login URL
     */
    async initiateLogin(): Promise<TelegramLoginInitResponse> {
        const response = await apiClient.post<{ data: TelegramLoginInitResponse }>('/auth/login/initiate');
        return response.data.data;
    },

    /**
     * Checks if the pending login token has been authorized by Telegram
     */
    async checkLoginStatus(token: string): Promise<LoginStatusResponse> {
        const response = await apiClient.get<{ data: LoginStatusResponse }>(`/auth/login/status/${token}`);
        return response.data.data;
    },

    /**
     * Fetches the current authenticated user's profile
     */
    async getMe(): Promise<UserProfile> {
        const response = await apiClient.get<{ data: { user: UserProfile } }>('/auth/me');
        return response.data.data.user;
    },

    /**
     * Logs out the user from the current session
     */
    async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout');
        } finally {
            // Always cleanup local tokens even if the server request fails
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    },

    // Note: /auth/refresh is handled internally by our axios response interceptor
};
