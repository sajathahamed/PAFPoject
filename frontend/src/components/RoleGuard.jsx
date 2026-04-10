import useAuth from '../hooks/useAuth';

/**
 * Component that only renders children if user has required role(s).
 * 
 * @param {Object} props
 * @param {string|string[]} props.roles - Required role(s)
 * @param {React.ReactNode} props.children - Content to render if authorized
 * @param {React.ReactNode} [props.fallback] - Optional fallback if not authorized
 * 
 * @example
 * <RoleGuard roles="ADMIN">
 *   <AdminPanel />
 * </RoleGuard>
 * 
 * @example
 * <RoleGuard roles={['ADMIN', 'TECHNICIAN']} fallback={<p>Access denied</p>}>
 *   <SpecialContent />
 * </RoleGuard>
 */
const RoleGuard = ({ roles, children, fallback = null }) => {
  const { hasRole, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!hasRole(roles)) {
    return fallback;
  }

  return children;
};

export default RoleGuard;
