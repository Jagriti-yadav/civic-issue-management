import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''; // Use relative paths in development, configured URL in production

export const notificationService = {
  async getUserNotifications(userId, options = {}) {
    const { unreadOnly } = options;
    const queryParams = new URLSearchParams({ unreadOnly: unreadOnly ? 'true' : 'false' }).toString();
    const url = `${API_BASE_URL}/api/notifications/user/${userId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch notifications');
    }

    return data;
  },

  async getUnreadCount(userId) {
    const response = await fetch(`${API_BASE_URL}/api/notifications/user/${userId}/unread-count`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch unread count');
    }

    return data;
  },

  async markAsRead(notificationId) {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to mark notification as read');
    }

    return data;
  },

  async markAllAsRead(userId) {
    const response = await fetch(`${API_BASE_URL}/api/notifications/user/${userId}/read-all`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to mark all notifications as read');
    }

    return data;
  },

  async deleteNotification(notificationId) {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete notification');
    }

    return data;
  }
};