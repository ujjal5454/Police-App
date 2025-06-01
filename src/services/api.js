import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth Services
export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  }
};

// Incident Services
export const incidentService = {
  createIncident: async (incidentData) => {
    try {
      const response = await api.post('/incidents', incidentData);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  getAllIncidents: async () => {
    try {
      const response = await api.get('/incidents');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getIncidentById: async (id) => {
    try {
      const response = await api.get(`/incidents/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateIncident: async (id, updateData) => {
    try {
      const response = await api.put(`/incidents/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteIncident: async (id) => {
    try {
      const response = await api.delete(`/incidents/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Add auth token to requests if user is logged in
api.interceptors.request.use(
  (config) => {
    const user = authService.getCurrentUser();
    if (user) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
); 