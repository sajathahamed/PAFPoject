import useAuth from '../hooks/useAuth';

/**
 * Dashboard page - main landing page after login.
 */
const Dashboard = () => {
  const { user, isAdmin, isTechnician } = useAuth();

  return (
    <div className="container dashboard">
      <div className="page-header">
        <h1 className="page-title">Welcome, {user?.name || 'User'}!</h1>
        <p className="page-subtitle">Smart Campus Operations Hub Dashboard</p>
      </div>

      <div className="dashboard-grid">
        {/* User Info Card */}
        <div className="card">
          <h3>Your Profile</h3>
          <div className="mt-2">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> <span className={`badge badge-${user?.role?.toLowerCase()}`}>{user?.role}</span></p>
            <p><strong>Provider:</strong> {user?.provider}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stat-card">
          <div className="stat-value">🏫</div>
          <div className="stat-label">Campus Operations Hub</div>
        </div>

        {/* Role-specific content */}
        {isAdmin() && (
          <div className="card">
            <h3>Admin Actions</h3>
            <p className="mt-1">You have administrative access.</p>
            <a href="/admin/users" className="btn btn-primary mt-2">
              Manage Users
            </a>
          </div>
        )}

        {isTechnician() && (
          <div className="card">
            <h3>Technician Dashboard</h3>
            <p className="mt-1">View and manage work orders.</p>
            <button className="btn btn-primary mt-2">
              View Work Orders
            </button>
          </div>
        )}

        {/* General info for all users */}
        <div className="card">
          <h3>Campus Services</h3>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li>Report facility issues</li>
            <li>Request maintenance</li>
            <li>View announcements</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
