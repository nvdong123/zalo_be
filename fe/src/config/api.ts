// API Configuration for different environments
export const API_CONFIG = {
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || 'https://zalominiapp.vtlink.vn',
  uploadURL: (import.meta.env.VITE_API_BASE_URL as string)?.replace('/api', '') || 'https://zalominiapp.vtlink.vn',
}

// Helper functions
export const getApiUrl = (endpoint: string) => `${API_CONFIG.baseURL}${endpoint}`;
export const getUploadUrl = (endpoint: string) => `${API_CONFIG.uploadURL}${endpoint}`;

// Environment checks
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

console.log('🔧 API Config:', {
  baseURL: API_CONFIG.baseURL,
  uploadURL: API_CONFIG.uploadURL,
  isDevelopment,
  isProduction,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL
});
