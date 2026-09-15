import axios from 'axios';
import type { DashboardSummary } from '@/types/dashboard';
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

function shouldRedirectOn401(url: string | undefined) {
    if (!url) return true;
    const path = url.replace(API_BASE_URL, '');
    if (path.includes('/auth/login')) return false;
    if (path.includes('/patients/access')) return false;
    return true;
}

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const reqUrl = error.config?.url as string | undefined;
            if (!shouldRedirectOn401(reqUrl)) {
                return Promise.reject(error);
            }
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    login: (credentials: { username: string; password: string }) =>
        api.post<unknown>('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    me: () => api.get<unknown>('/auth/me'),
    updateProfile: (data: { name: string; email: string }) => api.patch('/auth/profile', data),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
        api.post('/auth/password', data),
};

// Patients
export const patientsAPI = {
    getAll: () => api.get<unknown>('/patients'),
    getById: (id: string) => api.get(`/patients/${id}`),
    create: (data: Record<string, unknown>) => api.post('/patients', data),
    update: (id: string, data: Record<string, unknown>) => api.put(`/patients/${id}`, data),
    delete: (id: string) => api.delete(`/patients/${id}`),
    accessByCode: (code: string) => api.post<unknown>('/patients/access', { code }),
};

// Documents
export const documentsAPI = {
    getAll: (patientId?: string) =>
        api.get<unknown>('/documents', { params: patientId ? { patientId } : {} }),
    upload: (formData: FormData) =>
        api.post('/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    download: (id: string) =>
        api.get(`/documents/${id}/download`, { responseType: 'blob' }),
    preview: (id: string) =>
        api.get(`/documents/${id}/preview`, { responseType: 'blob' }),
    delete: (id: string) => api.delete(`/documents/${id}`),
};

// Audit
export const auditAPI = {
    getLogs: (params?: { page?: number; size?: number; user?: string; action?: string; from?: string; to?: string }) =>
        api.get<unknown>('/audit', { params }),
};

// Users (Admin)
export const usersAPI = {
    getAll: () => api.get<unknown>('/users'),
    getById: (id: string) => api.get(`/users/${id}`),
    create: (data: Record<string, unknown>) => api.post('/users', data),
    update: (id: string, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
    delete: (id: string) => api.delete(`/users/${id}`),
};

// System
export const systemAPI = {
    getStatus: () => api.get<unknown>('/system/status'),
    getAlerts: () => api.get<unknown>('/system/alerts'),
};

export const dashboardAPI = {
    summary: () => api.get<DashboardSummary>('/dashboard/summary'),
};

export const securityAPI = {
    events: () => api.get<unknown>('/security/events'),
};

export default api;
