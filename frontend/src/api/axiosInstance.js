import axios from 'axios';

/**
 * Axios instance configured for Smart Campus API.
 * 
 * Features:
 * - Base URL: /api (proxied in development)
 * - withCredentials: true (sends HttpOnly cookies automatically)
 * - Response interceptor for 401 handling
 * - Request/response error handling
 */
const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true, // Send cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple redirects during retry
let isRefreshing = false;
let failedQueue = [];

/**
 * Process queued requests after token refresh.
 */
const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

/**
 * Response interceptor to handle authentication errors.
 * 
 * On 401 Unauthorized:
 * 1. Attempt to refresh the token
 * 2. If refresh succeeds, retry the original request
 * 3. If refresh fails, redirect to login page
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry refresh endpoint to avoid infinite loop
      if (originalRequest.url === '/auth/refresh') {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        await axiosInstance.post('/auth/refresh');
        
        // Token refreshed successfully, process queue and retry
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear queue and redirect to login
        processQueue(refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Request interceptor for logging (development only).
 */
axiosInstance.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
