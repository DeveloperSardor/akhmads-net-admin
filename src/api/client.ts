import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from './types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.akhmads.net/api/v1';

// Create the axios instance
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// A simple utility to get tokens (this can be swapped with a recoil atom or zustand store if preferred later)
const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
};
const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

// --- Request Interceptor ---
// Injects the Bearer token into outgoing requests
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// We need a variable to hold the refresh promise to avoid multiple simultaneous refresh requests
let refreshPromise: Promise<string | null> | null = null;

// --- Response Interceptor ---
// Handles 401 errors globally and attempts to refresh the access token automatically
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is 401 Unauthorized and we haven't already retried this original request
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            // Avoid looping if the failing request WAS the refresh token request
            if (originalRequest.url?.includes('/auth/refresh')) {
                clearTokens();
                // Option: trigger a global emit event to force user to login page
                window.dispatchEvent(new Event('auth:unauthorized'));
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Only start refresh if not already in progress
                if (!refreshPromise) {
                    refreshPromise = axios
                        .post<{ data: { tokens: { accessToken: string; refreshToken: string } } }>(`${API_BASE_URL}/auth/refresh`, {
                            refreshToken,
                        })
                        .then((res) => {
                            const { accessToken: newAccess, refreshToken: newRefresh } = res.data.data.tokens;
                            setTokens(newAccess, newRefresh);
                            return newAccess;
                        })
                        .catch((refreshError) => {
                            clearTokens();
                            window.dispatchEvent(new Event('auth:unauthorized'));
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
    }
);
