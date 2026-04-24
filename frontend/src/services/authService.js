import axiosInstance from '../api/axiosInstance';

/**
 * Authentication service for Smart Campus Operations Hub.
 * 
 * Handles all auth-related API calls:
 * - Get current user
 * - Refresh tokens
 * - Logout
 * - Get all users (admin)
 * - Update user role (admin)
 */
const authService = {
  /**
   * Get the currently authenticated user's profile.
   * 
   * @returns {Promise<Object>} User profile data
   */
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    if (response.status === 204 || response.data == null || response.data === '') {
      return null;
    }
    return response.data;
  },

  /**
   * Login user with email and password.
   */
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Register a new user with email and password.
   */
  register: async (email, password, name) => {
    const response = await axiosInstance.post('/auth/register', { email, password, name });
    return response.data;
  },

  /**
   * Refresh the access token using the refresh token cookie.
   * 
   * @returns {Promise<Object>} New token information
   */
  refreshTokens: async () => {
    const response = await axiosInstance.post('/auth/refresh');
    return response.data;
  },

  /**
   * Logout the current user.
   * Clears authentication cookies.
   * 
   * @returns {Promise<Object>} Logout confirmation message
   */
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  /**
   * Get all users in the system.
   * Admin only.
   * 
   * @returns {Promise<Array>} List of all users
   */
  getAllUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  /**
   * Update a user's role.
   * Admin only.
   * 
   * @param {number} userId - The user ID to update
   * @param {string} role - The new role (USER, ADMIN, TECHNICIAN)
   * @returns {Promise<Object>} Updated user data
   */
  updateUserRole: async (userId, role) => {
    const response = await axiosInstance.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  /**
   * Create a new user (Admin only).
   * 
   * @param {Object} userData - { name, email, password, role }
   * @returns {Promise<Object>} Created user data
   */
  adminCreateUser: async (userData) => {
    const response = await axiosInstance.post('/admin/users', userData);
    return response.data;
  },

  /**
   * Update a user (Admin only).
   * 
   * @param {number} userId - The user ID to update
   * @param {Object} userData - { name, email, role }
   * @returns {Promise<Object>} Updated user data
   */
  updateUser: async (userId, userData) => {
    const response = await axiosInstance.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  /**
   * Activate or deactivate a user account (Admin/SuperAdmin only).
   *
   * @param {number|string} userId - The user ID to update
   * @param {boolean} active - New active status
   * @returns {Promise<Object>} Updated user data
   */
  setUserActive: async (userId, active) => {
    const response = await axiosInstance.patch(`/admin/users/${userId}/status`, null, {
      params: { active },
    });
    return response.data;
  },

  deactivateUser: async (userId) => {
    return authService.setUserActive(userId, false);
  },

  activateUser: async (userId) => {
    return authService.setUserActive(userId, true);
  },

  /**
   * Get the Google OAuth2 login URL.
   * Redirects to this URL to initiate Google login.
   * 
   * @returns {string} OAuth2 authorization URL
   */
  getGoogleLoginUrl: () => {
    // In development, this goes through the Vite proxy
    // In production, adjust the base URL accordingly
    return '/oauth2/authorization/google';
  },
};

export default authService;
