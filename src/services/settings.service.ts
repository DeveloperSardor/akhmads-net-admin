import { apiClient } from '../api/client';

export interface PlatformSetting {
  key: string;
  value: string;
  valueType: string;
  category: string;
}

export const getSettings = async () => {
  const response = await apiClient.get('/admin/settings');
  return response.data;
};

export const updateSettings = async (settings: Record<string, any>) => {
  const response = await apiClient.put('/admin/settings', { settings });
  return response.data;
};
