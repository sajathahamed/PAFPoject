import { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

/**
 * Authentication context for Smart Campus Operations Hub.
 * 
 * Provides global authentication state and methods to all components.
 */
export const AuthContext = createContext(null);

/**
 * Authentication provider component.
 * 
 * Features:
 * - Auto-checks authentication on mount
 * - Provides login/logout methods
 * - Manages loading state during auth checks
 * - Role-based access helper
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Check authentication status by fetching current user.
   * Called on mount and after OAuth callback.
   */
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      // 401 means not authenticated - this is expected for unauthenticated users
      if (err.response?.status !== 401) {
        console.error('Auth check error:', err);
        setError(err.response?.data?.error || 'Authentication check failed');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initialize authentication state on mount.
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Redirect to Google OAuth2 login.
   */
  const login = useCallback(() => {
    // Redirect to backend OAuth2 endpoint
    window.location.href = authService.getGoogleLoginUrl();
  }, []);

  /**
   * Logout the current user.
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Even if logout fails, clear local state
      setUser(null);
    }
  }, []);

  /**
   * Refresh authentication tokens.
   * Returns true if refresh was successful.
   */
  const refreshAuth = useCallback(async () => {
    try {
      await authService.refreshTokens();
      await checkAuth(); // Reload user data after refresh
      return true;
    } catch (err) {
      console.error('Token refresh failed:', err);
      setUser(null);
      return false;
    }
  }, [checkAuth]);

  /**
   * Check if the current user has a specific role.
   * 
   * @param {string|string[]} roles - Role or array of roles to check
   * @returns {boolean} True if user has any of the specified roles
   */
  const hasRole = useCallback(
    (roles) => {
      if (!user) return false;
      
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.role);
    },
    [user]
  );

  /**
   * Check if the current user is an admin.
   */
  const isAdmin = useCallback(() => hasRole('ADMIN'), [hasRole]);

  /**
   * Check if the current user is a technician.
   */
  const isTechnician = useCallback(() => hasRole('TECHNICIAN'), [hasRole]);

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    refreshAuth,
    checkAuth,
    hasRole,
    isAdmin,
    isTechnician,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
