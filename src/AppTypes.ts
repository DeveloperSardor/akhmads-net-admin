// Extracting the global types that were in App.tsx
export type AdStatus = "SUBMITTED" | "APPROVED" | "REJECTED" | "RUNNING" | "PAUSED" | "COMPLETED" | "DRAFT";
export type BotStatus = "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "PAUSED";
export type WithdrawalStatus = "REQUESTED" | "PENDING_REVIEW" | "COMPLETED" | "REJECTED";
export type Role = "superadmin" | "admin" | "moderator";

export interface Ad {
    id: string;
    title: string;
    text: string;
    contentType: "TEXT" | "IMAGE" | "VIDEO";
    status: AdStatus;
    owner: string;
    ownerUsername: string;
    targetImpressions: number;
    impressions: number;
    cpmBid: number;
    category: string;
    createdAt: string;
    budget: number;
}

export interface Bot {
    id: string;
    name: string;
    username: string;
    owner: string;
    ownerUsername: string;
    status: BotStatus;
    subscriberCount: number;
    category: string;
    language: string;
    createdAt: string;
    adsReceived: number;
    earnings: number;
}

export interface Withdrawal {
    id: string;
    userId: string;
    username: string;
    amount: number;
    fee: number;
    amountToSend: number;
    walletAddress: string;
    status: WithdrawalStatus;
    requestedAt: string;
    network: "BEP-20";
}

export interface User {
    id: string;
    telegramId: string;
    username: string;
    firstName: string;
    lastName: string;
    role: Role | "user";
    balance: number;
    totalDeposited: number;
    totalEarned: number;
    botsCount: number;
    adsCount: number;
    joinedAt: string;
    isBanned: boolean;
}

export interface AdminUser {
    id: string;
    username: string;
    firstName: string;
    role: Role;
    addedAt: string;
    addedBy: string;
}
