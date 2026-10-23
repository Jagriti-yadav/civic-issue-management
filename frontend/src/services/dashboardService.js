import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''; // Use relative paths in development, configured URL in production

export const dashboardService = {
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch dashboard statistics');
    }

    return data;
  },

  async getDashboardTrends(period = '7') {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/trends?period=${period}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch dashboard trends');
    }

    return data;
  },

  async getRecentComplaints(limit = 5) {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/recent-complaints?limit=${limit}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch recent complaints');
    }

    return data;
  },

  async getRecentUsers(limit = 5) {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/recent-users?limit=${limit}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch recent users');
    }

    return data;
  }
};
