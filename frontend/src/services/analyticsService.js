import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''; // Use relative paths in development, configured URL in production

const analyticsService = {
  /**
   * Get comprehensive analytics overview
   */
  getOverview: async (range = '7', startDate = null, endDate = null) => {
    const params = { range };
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    const response = await axios.get(`${API_BASE_URL}/api/analytics/overview`, {
      params,
      headers: authService.getAuthHeaders()
    });
    return response.data;
  },

  /**
   * Get complaints grouped by category
   */
  getByCategory: async (range = '7', startDate = null, endDate = null) => {
    const params = { range };
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    const response = await axios.get(`${API_BASE_URL}/api/analytics/by-category`, {
      params,
      headers: authService.getAuthHeaders()
    });
    return response.data;
  },

  /**
   * Get complaints grouped by status
   */
  getByStatus: async (range = '7', startDate = null, endDate = null) => {
    const params = { range };
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    const response = await axios.get(`${API_BASE_URL}/api/analytics/by-status`, {
      params,
      headers: authService.getAuthHeaders()
    });
    return response.data;
  },

  /**
   * Get complaints grouped by department
   */
  getByDepartment: async (range = '7', startDate = null, endDate = null) => {
    const params = { range };
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    const response = await axios.get(`${API_BASE_URL}/api/analytics/by-department`, {
      params,
      headers: authService.getAuthHeaders()
    });
    return response.data;
  },

  /**
   * Get complaint submission trends
   */
  getTrends: async (range = '7', startDate = null, endDate = null) => {
    const params = { range };
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    const response = await axios.get(`${API_BASE_URL}/api/analytics/trends`, {
      params,
      headers: authService.getAuthHeaders()
    });
    return response.data;
  },

  /**
   * Get officer performance metrics
   */
  getOfficerPerformance: async (range = '7', startDate = null, endDate = null) => {
    const params = { range };
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    const response = await axios.get(`${API_BASE_URL}/api/analytics/officer-performance`, {
      params,
      headers: authService.getAuthHeaders()
    });
    return response.data;
  },

  /**
   * Get all analytics data in a single call
   */
  getAllAnalytics: async (range = '7', startDate = null, endDate = null) => {
    const params = { range };
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    const response = await axios.get(`${API_BASE_URL}/api/analytics/all`, {
      params,
      headers: authService.getAuthHeaders()
    });
    return response.data;
  }
};

export default analyticsService;
