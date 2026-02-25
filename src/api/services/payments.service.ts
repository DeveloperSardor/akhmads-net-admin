import { apiClient } from '../client';
import type { PaginatedRequest, PaginatedResponse } from '../types';
import type { WalletTransaction } from './wallet.service';

export interface DepositInitRequest {
    amount: number;
    gateway: 'PAYME' | 'CLICK' | 'CRYPTOPAY';
}

export interface DepositInitResponse {
    transactionId: string;
    checkoutUrl: string;
}

export interface WithdrawInfoResponse {
    minWithdrawal: number;
    maxWithdrawal: number;
    feePercentage: number;
    availableMethods: string[];
}

export interface WithdrawRequest {
    amount: number;
    method: 'CARD' | 'CRYPTO';
    destinationAddress: string;
}

export const paymentsService = {
    // --- Deposits ---
    async initiateDeposit(data: DepositInitRequest): Promise<DepositInitResponse> {
        const response = await apiClient.post<DepositInitResponse>('/payments/deposit/initiate', data);
        return response.data;
    },
    async getDepositHistory(params?: PaginatedRequest): Promise<PaginatedResponse<WalletTransaction>> {
        const response = await apiClient.get<PaginatedResponse<WalletTransaction>>('/payments/deposit/history', { params });
        return response.data;
    },
    async checkDepositStatus(transactionId: string): Promise<{ status: string }> {
        const response = await apiClient.get<{ status: string }>(`/payments/deposit/${transactionId}/status`);
        return response.data;
    },

    // --- Withdrawals ---
    async getWithdrawInfo(): Promise<WithdrawInfoResponse> {
        const response = await apiClient.get<WithdrawInfoResponse>('/payments/withdraw/info');
        return response.data;
    },
    async requestWithdrawal(data: WithdrawRequest): Promise<{ status: string; transactionId: string }> {
        const response = await apiClient.post<{ status: string; transactionId: string }>('/payments/withdraw/request', data);
        return response.data;
    },
    async getWithdrawalHistory(params?: PaginatedRequest): Promise<PaginatedResponse<WalletTransaction>> {
        const response = await apiClient.get<PaginatedResponse<WalletTransaction>>('/payments/withdraw/history', { params });
        return response.data;
    },

    // --- Global Transactions (Payments module perspective) ---
    async getAllTransactions(params?: PaginatedRequest): Promise<PaginatedResponse<WalletTransaction>> {
        const response = await apiClient.get<PaginatedResponse<WalletTransaction>>('/payments/transactions', { params });
        return response.data;
    }
};
