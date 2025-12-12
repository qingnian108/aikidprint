// API Configuration
// Uses environment variable in production, falls back to localhost in development

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to build API URLs
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

// Helper function to build asset URLs
export const getAssetUrl = (path: string): string => {
  if (path.startsWith('http')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
