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
    const response = await axiosInstance.delete('/auth/logout');
    return response.data;
  },

  /**
   * Get all users in the system.
   * Admin only.
   * 
   * @returns {Promise<Array>} List of all users
   */
  getAllUsers: async () => {
    const response = await axiosInstance.get('/users');
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
    const response = await axiosInstance.put(`/users/${userId}/role`, { role });
    return response.data;
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
