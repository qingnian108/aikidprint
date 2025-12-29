// API Configuration
// Uses environment variable in production, falls back to localhost in development

// 后端当前监听端口：3000（Gemini: gemini-3-pro-image-preview / Nano Banana Pro）
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to build API URLs
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

// Helper function to build asset URLs (for images, previews, etc.)
export const getAssetUrl = (path: string): string => {
  if (path.startsWith('http')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

// Helper function to get preview image URL (从前端 public 文件夹加载)
export const getPreviewImageUrl = (previewPath: string): string => {
  if (previewPath.startsWith('http')) {
    return previewPath;
  }
  // 预览图片在前端 public/previews 文件夹，直接返回路径
  return previewPath;
};
