const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

// ========== 认证相关 ==========
export const adminApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE}/api/admin/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  verify: async () => {
    const response = await fetch(`${API_BASE}/api/admin/verify`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // ========== 统计相关 ==========
  getStatsOverview: async () => {
    const response = await fetch(`${API_BASE}/api/admin/stats/overview`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getUserGrowthStats: async (days: number = 30) => {
    const response = await fetch(`${API_BASE}/api/admin/stats/users?days=${days}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getUsageStats: async (days: number = 7) => {
    const response = await fetch(`${API_BASE}/api/admin/stats/usage?days=${days}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getRevenueStats: async () => {
    const response = await fetch(`${API_BASE}/api/admin/stats/revenue`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // ========== 用户管理 ==========
  getUsers: async (page: number = 1, limit: number = 20, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    const response = await fetch(`${API_BASE}/api/admin/users?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getUserDetail: async (userId: string) => {
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateUserPlan: async (userId: string, plan: 'Free' | 'Pro') => {
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}/plan`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ plan }),
    });
    return handleResponse(response);
  },

  getUserUsage: async (userId: string, days: number = 30) => {
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}/usage?days=${days}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // ========== 订阅管理 ==========
  getSubscriptions: async (page: number = 1, limit: number = 20, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    const response = await fetch(`${API_BASE}/api/admin/subscriptions?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  extendSubscription: async (subscriptionId: string, days: number) => {
    const response = await fetch(`${API_BASE}/api/admin/subscriptions/${subscriptionId}/extend`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ days }),
    });
    return handleResponse(response);
  },

  cancelSubscription: async (subscriptionId: string) => {
    const response = await fetch(`${API_BASE}/api/admin/subscriptions/${subscriptionId}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // ========== 支付管理 ==========
  getPayments: async (page: number = 1, limit: number = 20, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    const response = await fetch(`${API_BASE}/api/admin/payments?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // ========== 内容统计 ==========
  getContentStats: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await fetch(`${API_BASE}/api/admin/content/stats?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getThemeStats: async () => {
    const response = await fetch(`${API_BASE}/api/admin/content/themes`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // ========== Weekly Delivery ==========
  getDeliverySettings: async (page: number = 1, limit: number = 20) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const response = await fetch(`${API_BASE}/api/admin/delivery/settings?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  triggerDelivery: async (userId: string, settingsId: string) => {
    const response = await fetch(`${API_BASE}/api/admin/delivery/trigger`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, settingsId }),
    });
    return handleResponse(response);
  },

  getDeliveryHistory: async (page: number = 1, limit: number = 20) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const response = await fetch(`${API_BASE}/api/admin/delivery/history?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // ========== 系统配置 ==========
  getConfig: async () => {
    const response = await fetch(`${API_BASE}/api/admin/config`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateConfig: async (config: Record<string, any>) => {
    const response = await fetch(`${API_BASE}/api/admin/config`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(config),
    });
    return handleResponse(response);
  },

  getLogs: async (page: number = 1, limit: number = 50) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const response = await fetch(`${API_BASE}/api/admin/logs?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // ========== 数据导出 ==========
  exportUsers: () => `${API_BASE}/api/admin/export/users`,
  exportSubscriptions: () => `${API_BASE}/api/admin/export/subscriptions`,
  exportPayments: () => `${API_BASE}/api/admin/export/payments`,
  exportUsage: () => `${API_BASE}/api/admin/export/usage`,

  downloadExport: async (type: 'users' | 'subscriptions' | 'payments' | 'usage') => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE}/api/admin/export/${type}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

export default adminApi;
