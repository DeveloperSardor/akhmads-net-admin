import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../../api";
import type { PaginatedRequest } from "../../api/types";

// --- Query Keys ---
export const adminUserKeys = {
  all: ["adminUsers"] as const,
  lists: () => [...adminUserKeys.all, "list"] as const,
  list: (params: string) => [...adminUserKeys.lists(), { params }] as const,
  details: () => [...adminUserKeys.all, "detail"] as const,
  detail: (id: string) => [...adminUserKeys.details(), id] as const,
};

export const adminWithdrawalKeys = {
  all: ["adminWithdrawals"] as const,
  lists: () => [...adminWithdrawalKeys.all, "list"] as const,
  list: (params: string) =>
    [...adminWithdrawalKeys.lists(), { params }] as const,
};

export const adminStatsKeys = {
  all: ["adminStats"] as const,
};

export const adminAnalyticsKeys = {
  all: ["adminAnalytics"] as const,
  period: (p: string) => ["adminAnalytics", p] as const,
};

export const adminRevenueKeys = {
  period: (p: string) => ["adminRevenue", p] as const,
};

// --- Users ---
export const useAdminUsers = (params: PaginatedRequest = {}) => {
  return useQuery({
    queryKey: adminUserKeys.list(JSON.stringify(params)),
    queryFn: () => adminService.getAllUsers(params),
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminService.banUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.unbanUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      adminService.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
  });
};

export const useAdjustUserBalance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      amount,
      reason,
    }: {
      id: string;
      amount: number;
      reason: string;
    }) => adminService.adjustUserBalance(id, amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
  });
};

// --- Withdrawals ---
export const useAdminWithdrawals = (
  params: PaginatedRequest & { status?: string } = {},
) => {
  return useQuery({
    queryKey: adminWithdrawalKeys.list(JSON.stringify(params)),
    queryFn: () => adminService.getAllWithdrawals(params),
  });
};

export const useApproveWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.approveWithdrawal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminWithdrawalKeys.lists() });
    },
  });
};

export const useRejectWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminService.rejectWithdrawal(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminWithdrawalKeys.lists() });
    },
  });
};

// --- Stats & Analytics ---
export const useAdminStats = () => {
  return useQuery({
    queryKey: adminStatsKeys.all,
    queryFn: () => adminService.getAdminStats(),
  });
};

export const useAdminAnalytics = (period?: string) => {
  return useQuery({
    queryKey: period
      ? adminAnalyticsKeys.period(period)
      : adminAnalyticsKeys.all,
    queryFn: () => adminService.getAdminAnalytics(period),
  });
};

export const useAdminRevenueChart = (period: string = "14d") => {
  return useQuery({
    queryKey: adminRevenueKeys.period(period),
    queryFn: () => adminService.getRevenueChart(period),
  });
};
