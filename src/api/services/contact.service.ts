import { apiClient } from '../client';

export interface ContactMessage {
    id: string;
    userId?: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'resolved';
    createdAt: string;
    user?: { id: string; firstName: string; lastName?: string };
}

export interface ContactMessagesResponse {
    messages: ContactMessage[];
    total: number;
}

export const contactService = {
    async getMessages(params?: { status?: string; limit?: number; offset?: number }): Promise<ContactMessagesResponse> {
        const response = await apiClient.get('/contact/messages', { params });
        const data = response.data;
        // Handle both { messages, total } and paginated response formats
        if (data?.messages) return data;
        if (data?.data?.messages) return data.data;
        return { messages: data?.data || [], total: data?.total || 0 };
    },
    async updateStatus(id: string, status: 'new' | 'read' | 'resolved'): Promise<ContactMessage> {
        const response = await apiClient.patch(`/contact/messages/${id}/status`, { status });
        return response.data;
    },
};
