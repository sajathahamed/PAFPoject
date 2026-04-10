import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Navigation bar with role-based menu items.
 * 
 * Shows different navigation options based on user role:
 * - All users: Dashboard, Profile
 * - Admin: User Management
 * - Technician: Work Orders
 */
const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isTechnician, isStudent, isLecturer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null; // Don't show navbar if not authenticated
  }

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
          🏫 Smart Campus
        </Link>

        {/* Navigation Items */}
        <ul className="navbar-nav">
          {/* Common links */}
          <li>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/profile" className="nav-link">
              Profile
            </Link>
          </li>

          {/* Admin only */}
          {isAdmin() && (
            <li>
              <Link to="/admin/users" className="nav-link">
                Manage Users
              </Link>
            </li>
          )}

          {/* Student/Lecturer - Booking options */}
          {(isStudent() || isLecturer()) && (
            <li>
              <Link to="/bookings" className="nav-link">
                My Bookings
              </Link>
            </li>
          )}

          {/* Technician only */}
          {isTechnician() && (
            <li>
              <Link to="/work-orders" className="nav-link">
                Work Orders
              </Link>
            </li>
          )}

          {/* User profile and logout */}
          <li className="nav-user">
            <Link to="/profile">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="nav-avatar"
                />
              ) : (
                <div
                  className="nav-avatar"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fff',
                    color: '#1976d2',
                    fontWeight: '600',
                    fontSize: '14px',
                  }}
                >
                  {user?.name?.[0] || '?'}
                </div>
              )}
            </Link>
            <span className="nav-link" style={{ cursor: 'default' }}>
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              Logout
            </button>
          </li>
        </ul>
    </nav>
  );
};

export default Navbar;
