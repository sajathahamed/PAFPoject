<<<<<<< HEAD
<<<<<<< HEAD
import { useState, useEffect, useCallback } from 'react';
=======
import { createContext, useState, useEffect, useCallback, useRef } from 'react';
>>>>>>> 982656fa2029fe76d8872e217eaf98b7a86ce193
=======
import { createContext, useState, useEffect, useCallback, useRef } from 'react';
>>>>>>> 982656fa2029fe76d8872e217eaf98b7a86ce193
import authService from '../services/authService';
import { AuthContext } from './AuthContextInstance';

/**
 * Authentication context for Smart Campus Operations Hub.
 * 
 * Provides global authentication state and methods to all components.
 */
/**
 * Authentication provider component.
 * 
 * Features:
 * - Auto-checks authentication on mount
 * - Provides login/logout methods
 * - Manages loading state during auth checks
 * - Role-based access helper
 */
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  /** Full-screen loader only for the first session check — not during login/register */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialAuthCheckDone = useRef(false);

  /**
   * Check authentication status by fetching current user.
   * Called on mount and after OAuth callback.
   */
  const checkAuth = useCallback(async () => {
    const showGlobalLoader = !initialAuthCheckDone.current;
    try {
      if (showGlobalLoader) setLoading(true);
      setError(null);
      const userData = await authService.getCurrentUser();
      setUser(userData ?? null);
    } catch (err) {
      // 401 or 404 means not authenticated - this is expected for unauthenticated users
      if (err.response?.status !== 401 && err.response?.status !== 404) {
        console.error('Auth check error:', err);
        setError(err.response?.data?.error || 'Authentication check failed');
      }
      setUser(null);
    } finally {
      if (showGlobalLoader) {
        initialAuthCheckDone.current = true;
        setLoading(false);
      }
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
  const loginWithGoogle = useCallback(() => {
    // Redirect to backend OAuth2 endpoint
    window.location.href = authService.getGoogleLoginUrl();
  }, []);

  /**
   * Login with email and password.
   */
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      await authService.login(email, password);
      await new Promise((resolve) => setTimeout(resolve, 150));
      const userData = await authService.getCurrentUser();
      if (!userData) {
        throw new Error('Signed in but profile could not be loaded. Try again.');
      }
      setUser(userData);
      return userData;
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Login failed';
      setError(msg);
      throw err;
    }
  }, []);

  /**
   * Register with email, password, and name.
   */
  const register = useCallback(async (email, password, name) => {
    try {
      setError(null);
      await authService.register(email, password, name);
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    }
  }, [login]);

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

  /**
   * Check if the current user is a student.
   */
  const isStudent = useCallback(() => hasRole('STUDENT'), [hasRole]);

  /**
   * Check if the current user is a lecturer.
   */
  const isLecturer = useCallback(() => hasRole('LECTURER'), [hasRole]);

  // Context value
  const value = {
    user,
    setUser,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    logout,
    register,
    refreshAuth,
    checkAuth,
    hasRole,
    isAdmin,
    isTechnician,
    isStudent,
    isLecturer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
