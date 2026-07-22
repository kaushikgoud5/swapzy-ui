import { apiClient } from './apiClient';

export interface Notification {
  id: number;
  title: string;
  message: string;
  eventType: string;
  isRead: boolean;
  createdOn: string;
}

interface NotificationsResponse {
  notifications: Notification[];
}

export const notificationService = {
  async getNotifications(unreadOnly = false): Promise<Notification[]> {
    const query = unreadOnly ? '?unreadOnly=true' : '';
    const res = await apiClient.get<NotificationsResponse>(`/notifications${query}`);
    return res.notifications || [];
  },

  async markAsRead(id: number): Promise<void> {
    await apiClient.patch<any>(`/notifications/${id}/read`, {});
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch<any>(`/notifications/read-all`, {});
  },
};
