import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextInstance';

/**
 * Custom hook for accessing authentication context.
 * 
 * Provides convenient access to:
 * - user: Current user object or null
 * - loading: Boolean indicating auth check in progress
 * - error: Any authentication error
 * - isAuthenticated: Boolean shorthand for !!user
 * - login(): Redirect to OAuth2 login
 * - logout(): Clear authentication
 * - refreshAuth(): Refresh access token
 * - checkAuth(): Re-check authentication status
 * - hasRole(roles): Check if user has specified role(s)
 * - isAdmin(): Shorthand for hasRole('ADMIN')
 * - isTechnician(): Shorthand for hasRole('TECHNICIAN')
 * 
 * @example
 * const { user, isAuthenticated, login, logout, hasRole } = useAuth();
 * 
 * if (!isAuthenticated) {
 *   return <button onClick={login}>Sign In</button>;
 * }
 * 
 * if (hasRole('ADMIN')) {
 *   return <AdminDashboard />;
 * }
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;
