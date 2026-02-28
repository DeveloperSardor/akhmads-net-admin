import { useQuery } from "@tanstack/react-query";
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
