import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:1234',
  withCredentials: true,
});

// Redirect to login on 401 — but only for action endpoints, not optional auth checks
const SILENT_401_URLS = [
  '/auth/merchant/me',
  '/auth/user/me',
  '/auth/food-partner/me',
  '/product/liked',
  '/product/saved',
];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isSilent = SILENT_401_URLS.some((u) => url.includes(u));
      if (!isSilent) {
        const path = window.location.pathname;
        const isAuthPage = path.includes('/login') || path.includes('/register');
        const isMerchantPage = path.startsWith('/food-partner/home') || path.startsWith('/merchant') || path.startsWith('/create-food');
        if (!isAuthPage) {
          window.location.href = isMerchantPage ? '/food-partner/login' : '/user/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
