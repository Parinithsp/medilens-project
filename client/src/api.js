import axios from 'axios';
import { signOutFirebase } from './firebase';

const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.trim() === '') {
    return '/api';
  }
  let url = envUrl.trim();
  // Auto-prepend https:// if bare host is supplied (e.g. from cloud platforms)
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    url = `https://${url}`;
  }
  // Ensure /api endpoint prefix
  if (!url.endsWith('/api') && !url.endsWith('/api/')) {
    url = url.replace(/\/+$/, '') + '/api';
  }
  return url;
};

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token to requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medilens_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.access_token) {
      localStorage.setItem('medilens_token', res.data.access_token);
      localStorage.setItem('medilens_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  googleLogin: async ({ idToken, email, fullName, photoUrl }) => {
    const res = await api.post('/auth/google', {
      id_token: idToken,
      email,
      full_name: fullName,
      photo_url: photoUrl
    });
    if (res.data?.access_token) {
      localStorage.setItem('medilens_token', res.data.access_token);
      localStorage.setItem('medilens_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  register: async (email, password, fullName) => {
    const res = await api.post('/auth/register', { email, password, full_name: fullName });
    if (res.data?.access_token) {
      localStorage.setItem('medilens_token', res.data.access_token);
      localStorage.setItem('medilens_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  demoLogin: async () => {
    const res = await api.post('/auth/demo');
    if (res.data?.access_token) {
      localStorage.setItem('medilens_token', res.data.access_token);
      localStorage.setItem('medilens_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    if (res.data) {
      localStorage.setItem('medilens_user', JSON.stringify(res.data));
    }
    return res.data;
  },
  updateProfile: async (fullName) => {
    const res = await api.put('/auth/profile', { full_name: fullName });
    if (res.data) {
      localStorage.setItem('medilens_user', JSON.stringify(res.data));
    }
    return res.data;
  },
  changePassword: async (currentPassword, newPassword) => {
    const res = await api.put('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
    return res.data;
  },
  deleteAccount: async () => {
    const res = await api.delete('/auth/account');
    localStorage.removeItem('medilens_token');
    localStorage.removeItem('medilens_user');
    return res.data;
  },
  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('medilens_token');
    localStorage.removeItem('medilens_user');
    signOutFirebase();
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('medilens_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
};

export const reportAPI = {
  uploadReport: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/reports/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    return res.data;
  },
  loadSample: async (sampleKey) => {
    const res = await api.post(`/reports/load-sample/${sampleKey}`);
    return res.data;
  },
  listReports: async () => {
    const res = await api.get('/reports');
    return res.data;
  },
  getReport: async (id) => {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  },
  deleteReport: async (id) => {
    const res = await api.delete(`/reports/${id}`);
    return res.data;
  },
  clearAllReports: async () => {
    const res = await api.post('/reports/clear-all');
    return res.data;
  },
  exportUserData: async () => {
    const res = await api.get('/reports/export-data', { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MediLens_Health_Data_Export_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },
  getDashboardStats: async () => {
    const res = await api.get('/reports/stats/dashboard');
    return res.data;
  },
  downloadPdf: async (id, patientName) => {
    const res = await api.get(`/reports/${id}/pdf`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MediLens_Summary_${patientName || 'Report'}_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export const chatAPI = {
  ask: async (reportId, message) => {
    const res = await api.post('/chat/ask', { report_id: reportId, message });
    return res.data;
  },
  getHistory: async (reportId) => {
    const res = await api.get(`/chat/${reportId}/history`);
    return res.data;
  }
};

export default api;
