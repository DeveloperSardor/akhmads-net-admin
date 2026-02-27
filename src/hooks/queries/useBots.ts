import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../../api";
import type { PaginatedRequest } from "../../api/types";

// Admin bot moderation keys
export const adminBotKeys = {
    all: ["adminBots"] as const,
    pending: (params: string) => [...adminBotKeys.all, "pending", { params }] as const,
};

export const usePendingBots = (params: PaginatedRequest = {}) => {
    return useQuery({
        queryKey: adminBotKeys.pending(JSON.stringify(params)),
        queryFn: async () => {
            return await adminService.getPendingBots(params);
        },
    });
};

export const useAllBots = (params: PaginatedRequest & { status?: string } = {}) => {
    return useQuery({
        queryKey: [...adminBotKeys.all, "all", JSON.stringify(params)],
        queryFn: async () => {
            return await adminService.getAllModerationBots(params);
        },
    });
};

export const useApproveBot = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => adminService.approveBot(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminBotKeys.all });
        },
    });
};

export const useRejectBot = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            adminService.rejectBot(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminBotKeys.all });
        },
    });
};
