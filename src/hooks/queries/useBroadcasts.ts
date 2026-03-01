import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../../api";
import type { PaginatedRequest } from "../../api/types";

export const usePendingBroadcasts = (params: PaginatedRequest = {}) => {
    return useQuery({
        queryKey: ["adminBroadcasts", "pending", JSON.stringify(params)],
        queryFn: async () => {
            return await adminService.getAllBroadcasts({ ...params, status: 'PENDING_REVIEW' });
        },
    });
};

export const useApproveBroadcast = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => adminService.approveBroadcast(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminBroadcasts"] });
        },
    });
};

export const useRejectBroadcast = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            adminService.rejectBroadcast(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminBroadcasts"] });
        },
    });
};

export const useRequestBroadcastEdit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, feedback }: { id: string; feedback: string }) =>
            adminService.requestBroadcastEdit(id, feedback),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminBroadcasts"] });
        },
    });
};
