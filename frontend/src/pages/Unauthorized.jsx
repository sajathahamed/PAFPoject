import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Unauthorized page - shown when user lacks required role.
 */
const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚫</div>
        <h1>Access Denied</h1>
        <p className="mt-2" style={{ color: '#666' }}>
          You don&apos;t have permission to access this page.
        </p>
        {user && (
          <p className="mt-1" style={{ color: '#888', fontSize: '14px' }}>
            Your current role: <span className={`badge badge-${user.role?.toLowerCase()}`}>{user.role}</span>
          </p>
        )}
        <div className="mt-3">
          <Link to="/dashboard" className="btn btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
