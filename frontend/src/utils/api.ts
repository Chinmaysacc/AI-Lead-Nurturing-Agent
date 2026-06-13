import axios from 'axios';
import type { ChatRequest, ChatResponse, DashboardStats, LeadProfile } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

export const chatAPI = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const { data } = await api.post<ChatResponse>('/chat', request);
    return data;
  },
};

export const leadsAPI = {
  getAll: async (params?: {
    category?: string;
    escalated?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; leads: LeadProfile[] }> => {
    const { data } = await api.get('/leads', { params });
    return data;
  },

  getById: async (id: string): Promise<LeadProfile> => {
    const { data } = await api.get(`/leads/${id}`);
    return data;
  },

  createDemo: async (scenario: number): Promise<LeadProfile> => {
    const { data } = await api.post(`/leads/demo?scenario=${scenario}`);
    return data;
  },
};

export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>('/dashboard/stats');
    return data;
  },
};

export const knowledgeAPI = {
  get: async () => {
    const { data } = await api.get('/knowledge-base');
    return data;
  },
};

export default api;
