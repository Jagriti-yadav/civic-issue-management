import { authService } from './authService';

const API_BASE_URL = ''; // Use relative paths to leverage Vite proxy

export const userService = {
  async getDepartments() {
    const response = await fetch(`${API_BASE_URL}/api/users/departments/list`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch departments');
    }

    return data;
  },

  async getOfficersByDepartment(department) {
    const encodedDepartment = encodeURIComponent(department);
    const response = await fetch(`${API_BASE_URL}/api/users/officers/department/${encodedDepartment}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch officers');
    }

    return data;
  },

  async getUserById(userId) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user');
    }

    return data;
  },

  async updateUser(userId, userData) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user');
    }

    return data;
  },

  async changePassword(userId, passwordData) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify(passwordData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password');
    }

    return data;
  }
};