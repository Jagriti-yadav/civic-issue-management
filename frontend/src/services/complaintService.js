import { authService } from './authService';

const API_BASE_URL = ''; // Use relative paths to leverage Vite proxy

export const complaintService = {
  async createComplaint(complaintData) {
    const response = await fetch(`${API_BASE_URL}/api/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify(complaintData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to create complaint');
    }

    return data;
  },

  async getAllComplaints(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}/api/complaints${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch complaints');
    }

    return data;
  },

  async getUserComplaints(userId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}/api/complaints/user/${userId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user complaints');
    }

    return data;
  },

  async getComplaintById(id) {
    const response = await fetch(`${API_BASE_URL}/api/complaints/${id}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch complaint');
    }

    return data;
  },

  async getComplaintByComplaintId(complaintId) {
    const response = await fetch(`${API_BASE_URL}/api/complaints/track/${complaintId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch complaint');
    }

    return data;
  },

  async updateComplaintStatus(id, status, note) {
    const response = await fetch(`${API_BASE_URL}/api/complaints/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify({ status, note }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update complaint status');
    }

    return data;
  },

  async updateComplaintPriority(id, priority, note) {
    const response = await fetch(`${API_BASE_URL}/api/complaints/${id}/priority`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify({ priority, note }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update complaint priority');
    }

    return data;
  },

  async assignComplaint(id, officerId) {
    const response = await fetch(`${API_BASE_URL}/api/complaints/${id}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify({ officerId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to assign complaint');
    }

    return data;
  },

  async addRemark(id, text) {
    const response = await fetch(`${API_BASE_URL}/api/complaints/${id}/remarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add remark');
    }

    return data;
  },

  async getComplaintStats() {
    const response = await fetch(`${API_BASE_URL}/api/complaints/stats`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch statistics');
    }

    return data;
  }
};