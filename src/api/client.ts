import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiErrorResponse } from "./types";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.akhmads.net/api/v1";

// Create the axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request Interceptor ---
// Backend will read from httpOnly cookies, so we don't need to inject Bearer manually
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error) => Promise.reject(error),
);

// We need a variable to hold the refresh promise to avoid multiple simultaneous refresh requests
let refreshPromise: Promise<string | null> | null = null;

// --- Response Interceptor ---
// Handles 401 errors globally and attempts to refresh the access token automatically
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 Unauthorized and we haven't already retried this original request
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Avoid looping if the failing request WAS the refresh token request
      if (originalRequest.url?.includes("/auth/refresh")) {
        // Option: trigger a global emit event to force user to login page
        window.dispatchEvent(new Event("auth:unauthorized"));
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Only start refresh if not already in progress
        if (!refreshPromise) {
          refreshPromise = axios
            .post<{
              data: { tokens: { accessToken: string; refreshToken: string } };
            }>(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
            .then((res) => {
              const { accessToken: newAccess } = res.data.data.tokens;
              return newAccess;
            })
            .catch((refreshError) => {
              window.dispatchEvent(new Event("auth:unauthorized"));
              throw refreshError;
            })
            .finally(() => {
              refreshPromise = null; // reset lock
            });
        }

        const newAccessToken = await refreshPromise;

        if (newAccessToken) {
          // Update the failed request with the new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);
