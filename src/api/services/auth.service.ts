import { apiClient } from "../client";

export interface TelegramLoginInitResponse {
  loginToken: string;
  deepLink: string;
  code: string;
  codes: string[];
  expiresAt: string;
  expiresIn: number;
}

export interface LoginStatusResponse {
  authorized?: boolean;
  requires2fa?: boolean;
  twoFaToken?: string;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  user?: UserProfile;
}

export interface UserProfile {
  id: string;
  telegramId: string;
  role:
    | "ADVERTISER"
    | "BOT_OWNER"
    | "MODERATOR"
    | "ADMIN"
    | "SUPER_ADMIN"
    | string;
  roles?: string[];
  firstName: string;
  lastName?: string;
  username?: string;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const authService = {
  /**
   * Initiates the login flow, receiving a Telegram login URL
   */
  async initiateLogin(): Promise<TelegramLoginInitResponse> {
    const response = await apiClient.post<{ data: TelegramLoginInitResponse }>(
      "/auth/login/initiate",
    );
    return response.data.data;
  },

  /**
   * Checks if the pending login token has been authorized by Telegram
   */
  async checkLoginStatus(token: string): Promise<LoginStatusResponse> {
    const response = await apiClient.get<{ data: LoginStatusResponse }>(
      `/auth/login/status/${token}`,
    );
    return response.data.data;
  },

  /**
   * Verify 2FA code
   */
  async verify2FA(
    twoFaToken: string,
    code: string,
  ): Promise<LoginStatusResponse> {
    const response = await apiClient.post<{ data: LoginStatusResponse }>(
      "/auth/2fa/verify",
      { twoFaToken, code },
    );
    return response.data.data;
  },

  /**
   * Fetches the current authenticated user's profile
   */
  async getMe(): Promise<UserProfile> {
    const response = await apiClient.get<{ data: { user: UserProfile } }>(
      "/auth/me",
    );
    return response.data.data.user;
  },

  /**
   * Logs out the user from the current session
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      // Always cleanup local tokens even if the server request fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },

  /**
   * Initiate 2FA setup — returns secret and QR code data URL
   */
  async setup2FA(): Promise<{ secret: string; qrCodeUrl: string }> {
    const response = await apiClient.post<{ data: { secret: string; qrCodeUrl: string } }>("/auth/2fa/setup");
    return response.data.data;
  },

  /**
   * Confirm 2FA setup by verifying a TOTP code
   */
  async confirm2FA(secret: string, code: string): Promise<void> {
    await apiClient.post("/auth/2fa/confirm", { secret, code });
  },

  /**
   * Disable 2FA for the current user
   */
  async disable2FA(): Promise<void> {
    await apiClient.delete("/auth/2fa");
  },

  // Note: /auth/refresh is handled internally by our axios response interceptor
};
