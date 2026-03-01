import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adsService, adminService } from "../../api";
import type { PaginatedRequest } from "../../api/types";

// Keys for query invalidation
export const adsKeys = {
    all: ["ads"] as const,
    lists: () => [...adsKeys.all, "list"] as const,
    list: (filters: string) => [...adsKeys.lists(), { filters }] as const,
    details: () => [...adsKeys.all, "detail"] as const,
    detail: (id: string) => [...adsKeys.details(), id] as const,
};

export const useAds = (params: PaginatedRequest & { status?: string } = {}) => {
    return useQuery({
        queryKey: adsKeys.list(JSON.stringify(params)),
        queryFn: async () => {
            return await adminService.getAllModerationAds(params);
        },
    });
};

export const useAdDetails = (id: string) => {
    return useQuery({
        queryKey: adsKeys.detail(id),
        queryFn: async () => {
            const response = await adsService.getAdById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const usePendingAds = (params: PaginatedRequest = {}) => {
    return useQuery({
        queryKey: ["adminAds", "pending", JSON.stringify(params)],
        queryFn: async () => {
            return await adminService.getPendingAds(params);
        },
    });
};

export const useApproveAd = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => adminService.approveAd(id),
        onSuccess: () => {
            // Invalidate both lists of ads to trigger refetch
            queryClient.invalidateQueries({ queryKey: ["adminAds"] });
            queryClient.invalidateQueries({ queryKey: adsKeys.lists() });
        },
    });
};

export const useRejectAd = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            adminService.rejectAd(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminAds"] });
            queryClient.invalidateQueries({ queryKey: adsKeys.lists() });
        },
    });
};

export const useRequestAdEdit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, feedback }: { id: string; feedback: string }) =>
            adminService.requestAdEdit(id, feedback),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminAds"] });
            queryClient.invalidateQueries({ queryKey: adsKeys.lists() });
        },
    });
};
