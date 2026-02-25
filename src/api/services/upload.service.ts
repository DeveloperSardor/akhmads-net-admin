import { apiClient } from '../client';

export const uploadService = {
    /**
     * Uploads an image to the cloud storage
     */
    async uploadImage(file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<{ url: string }>('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    /**
     * Uploads a video to the cloud storage
     */
    async uploadVideo(file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<{ url: string }>('/upload/video', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }
};
