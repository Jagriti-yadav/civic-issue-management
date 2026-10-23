import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''; // Use relative paths in development, configured URL in production

export const departmentService = {
  async createDepartment(departmentData) {
    const response = await fetch(`${API_BASE_URL}/api/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify(departmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create department');
    }

    return data;
  },

  async getDepartments(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/departments?${queryParams}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch departments');
    }

    return data;
  },

  async getDepartmentById(departmentId) {
    const response = await fetch(`${API_BASE_URL}/api/departments/${departmentId}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch department');
    }

    return data;
  },

  async updateDepartment(departmentId, departmentData) {
    const response = await fetch(`${API_BASE_URL}/api/departments/${departmentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify(departmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update department');
    }

    return data;
  },

  async getDepartmentOfficers(departmentId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/departments/${departmentId}/officers?${queryParams}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch department officers');
    }

    return data;
  },

  async getDepartmentComplaints(departmentId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/departments/${departmentId}/complaints?${queryParams}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch department complaints');
    }

    return data;
  }
};
