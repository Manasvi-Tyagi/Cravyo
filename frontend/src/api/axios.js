import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:1234',
  withCredentials: true,
});

// These 401s are expected (user not logged in) — don't try to refresh for them
const SILENT_401_URLS = [
  '/auth/merchant/me',
  '/auth/user/me',
  '/auth/food-partner/me',
];

let isRefreshing = false;
let pendingQueue = []; // requests waiting while refresh is in flight

function resolvePending(error) {
  pendingQueue.forEach((cb) => cb(error));
  pendingQueue = [];
}

function redirectToLogin() {
  const path = window.location.pathname;
  const isMerchantPage =
    path.startsWith('/food-partner') ||
    path.startsWith('/merchant') ||
    path.startsWith('/create-food');
  window.location.href = isMerchantPage ? '/food-partner/login' : '/user/login';
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    if (status !== 401) return Promise.reject(error);

    // Silent endpoints — just reject, never redirect or refresh
    const isSilent = SILENT_401_URLS.some((u) => url.includes(u));
    if (isSilent) return Promise.reject(error);

    // Don't retry if the refresh call itself 401'd — session is dead
    if (url.includes('/auth/refresh')) {
      redirectToLogin();
      return Promise.reject(error);
    }

    // Don't retry the same request twice
    if (originalRequest._retry) {
      redirectToLogin();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the refresh resolves
      return new Promise((resolve, reject) => {
        pendingQueue.push((err) => {
          if (err) return reject(err);
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post('/api/auth/refresh');
      resolvePending(null);
      return api(originalRequest);
    } catch (refreshError) {
      resolvePending(refreshError);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
