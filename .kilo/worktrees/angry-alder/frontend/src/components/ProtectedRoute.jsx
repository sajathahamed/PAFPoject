import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Protected Route component for role-based access control.
 * 
 * Features:
 * - Redirects unauthenticated users to login
 * - Checks role-based access if roles provided
 * - Shows loading spinner during auth check
 * - Preserves intended destination for redirect after login
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if authorized
 * @param {string|string[]} [props.roles] - Required role(s) to access this route
 * @param {string} [props.redirectTo='/login'] - Where to redirect if not authenticated
 * @param {string} [props.unauthorizedTo='/unauthorized'] - Where to redirect if not authorized
 * 
 * @example
 * // Protected route - any authenticated user
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Admin-only route
 * <ProtectedRoute roles="ADMIN">
 *   <AdminPanel />
 * </ProtectedRoute>
 * 
 * @example
 * // Multiple roles allowed
 * <ProtectedRoute roles={['ADMIN', 'TECHNICIAN']}>
 *   <WorkOrders />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({
  children,
  roles,
  redirectTo = '/login',
  unauthorizedTo = '/unauthorized',
}) => {
  const { isAuthenticated, loading, hasRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="spinner" aria-label="Loading">
        <span className="sr-only">Checking authentication...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the intended destination for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (roles && !hasRole(roles)) {
    return <Navigate to={unauthorizedTo} replace />;
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
