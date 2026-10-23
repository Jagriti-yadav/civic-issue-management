import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''; // Use relative paths in development, configured URL in production

export const userService = {
  async createOfficer(officerData) {
    const response = await fetch(`${API_BASE_URL}/api/users/officers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify(officerData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create officer');
    }

    return data;
  },

  async getOfficers(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/users/officers?${queryParams}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch officers');
    }

    return data;
  },

  async updateOfficer(officerId, officerData) {
    const response = await fetch(`${API_BASE_URL}/api/users/officers/${officerId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify(officerData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update officer');
    }

    return data;
  },

  async getOfficerComplaints(officerId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/users/officers/${officerId}/complaints?${queryParams}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch officer complaints');
    }

    return data;
  },

  async getAllUsers(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/users/all?${queryParams}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch users');
    }

    return data;
  },

  async updateUserStatus(userId, isActive) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify({ isActive }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user status');
    }

    return data;
  },

  async getUserComplaints(userId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/complaints?${queryParams}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user complaints');
    }

    return data;
  },

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