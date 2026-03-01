import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactService } from "../../api/services/contact.service";

export const contactKeys = {
    all: ["contactMessages"] as const,
    list: (params: string) => [...contactKeys.all, { params }] as const,
};

export const useContactMessages = (params?: { status?: string; limit?: number; offset?: number }) => {
    return useQuery({
        queryKey: contactKeys.list(JSON.stringify(params)),
        queryFn: () => contactService.getMessages(params),
    });
};

export const useUpdateContactMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'new' | 'read' | 'resolved' }) => 
            contactService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contactKeys.all });
        },
    });
};
