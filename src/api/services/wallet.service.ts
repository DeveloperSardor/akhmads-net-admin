import { apiClient } from '../client';
import type { PaginatedRequest, PaginatedResponse } from '../types';

export interface WalletBalanceResponse {
    available: number;
    pending: number;
    locked: number;
    currency: string;
}

export interface WalletTransaction {
    id: string;
    type: 'DEPOSIT' | 'WITHDRAW' | 'SPEND' | 'EARN';
    amount: number;
    currency: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdAt: string;
    description?: string;
}

export interface LedgerEntry {
    id: string;
    amount: number;
    balanceAfter: number;
    type: string;
    referenceId: string;
    createdAt: string;
}

export const walletService = {
    /**
     * Retrieves the current comprehensive wallet object
     */
    async getWallet(): Promise<WalletBalanceResponse> {
        const response = await apiClient.get<WalletBalanceResponse>('/wallet');
        return response.data;
    },

    /**
     * Simple endpoint to check available balance
     */
    async getBalanceCheck(): Promise<{ availableRemaining: number }> {
        const response = await apiClient.get<{ availableRemaining: number }>('/wallet/balance-check');
        return response.data;
    },

    /**
     * Retrieves paginated transaction history directly related to the wallet state
     */
    async getTransactionHistory(params?: PaginatedRequest): Promise<PaginatedResponse<WalletTransaction>> {
        const response = await apiClient.get<PaginatedResponse<WalletTransaction>>('/wallet/transactions', { params });
        return response.data;
    },

    /**
     * Retrieves detailed ledger entries for auditing user balances
     */
    async getLedgerEntries(params?: PaginatedRequest): Promise<PaginatedResponse<LedgerEntry>> {
        const response = await apiClient.get<PaginatedResponse<LedgerEntry>>('/wallet/ledger', { params });
        return response.data;
    }
};
