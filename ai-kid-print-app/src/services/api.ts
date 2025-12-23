import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PackData, GeneratedPage, ApiResponse } from '../types';

// API 基础 URL - 可以通过环境变量配置
const API_BASE_URL = 'https://your-server.com';

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 秒超时（生成可能需要较长时间）
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证 token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // 服务器返回错误
      const status = error.response.status;
      let message = '请求失败';
      
      switch (status) {
        case 401:
          message = '请重新登录';
          break;
        case 403:
          message = '没有权限访问';
          break;
        case 404:
          message = '资源不存在';
          break;
        case 500:
          message = '服务器错误，请稍后重试';
          break;
        default:
          message = (error.response.data as any)?.message || '请求失败';
      }
      
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // 网络错误
      return Promise.reject(new Error('网络连接失败，请检查网络'));
    }
    return Promise.reject(error);
  }
);

// Weekly Pack 请求参数
interface GenerateWeeklyPackParams {
  childName: string;
  age: string;
  theme: string;
}

// Custom Pack 请求参数
interface GenerateCustomPackParams {
  theme: string;
  selections: Record<string, number>;
}

// Weekly Pack 响应
interface WeeklyPackResponse {
  packId: string;
  pages: GeneratedPage[];
  weekNumber: number;
}

// Custom Pack 响应
interface CustomPackResponse {
  packId: string;
  pages: GeneratedPage[];
}

export const api = {
  // ==================== Health Check ====================
  
  /**
   * 健康检查
   */
  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  },

  // ==================== Weekly Pack ====================
  
  /**
   * 生成 Weekly Pack
   */
  generateWeeklyPack: async (params: GenerateWeeklyPackParams): Promise<WeeklyPackResponse> => {
    const response = await apiClient.post<ApiResponse<WeeklyPackResponse>>(
      '/api/weekly-pack/generate-pages',
      params
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || '生成失败');
    }
    
    return response.data.data;
  },

  /**
   * 保存 Weekly Pack
   */
  saveWeeklyPack: async (packData: PackData): Promise<void> => {
    const response = await apiClient.post<ApiResponse<void>>(
      '/api/weekly-pack/save',
      packData
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || '保存失败');
    }
  },

  /**
   * 获取 Weekly Pack
   */
  getWeeklyPack: async (packId: string): Promise<PackData> => {
    const response = await apiClient.get<ApiResponse<PackData>>(
      `/api/weekly-pack/pack/${packId}`
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || '获取失败');
    }
    
    return response.data.data;
  },

  // ==================== Custom Pack ====================
  
  /**
   * 生成 Custom Pack
   */
  generateCustomPack: async (params: GenerateCustomPackParams): Promise<CustomPackResponse> => {
    const response = await apiClient.post<ApiResponse<CustomPackResponse>>(
      '/api/custom-pack/generate',
      params
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || '生成失败');
    }
    
    return response.data.data;
  },

  /**
   * 获取 Custom Pack
   */
  getCustomPack: async (packId: string): Promise<PackData> => {
    const response = await apiClient.get<ApiResponse<PackData>>(
      `/api/custom-pack/${packId}`
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || '获取失败');
    }
    
    return response.data.data;
  },

  // ==================== User ====================
  
  /**
   * 获取用户下载历史
   */
  getDownloadHistory: async (userId: string): Promise<PackData[]> => {
    const response = await apiClient.get<ApiResponse<PackData[]>>(
      `/api/user/${userId}/history`
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || '获取历史失败');
    }
    
    return response.data.data;
  },

  /**
   * 获取用户统计
   */
  getUserStats: async (userId: string): Promise<{ totalDownloads: number; weeklyDownloads: number }> => {
    const response = await apiClient.get<ApiResponse<{ totalDownloads: number; weeklyDownloads: number }>>(
      `/api/user/${userId}/stats`
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || '获取统计失败');
    }
    
    return response.data.data;
  },
};

// 设置 API 基础 URL（用于动态配置）
export const setApiBaseUrl = (url: string): void => {
  apiClient.defaults.baseURL = url;
};

// 获取当前 API 基础 URL
export const getApiBaseUrl = (): string => {
  return apiClient.defaults.baseURL || API_BASE_URL;
};

export default api;
