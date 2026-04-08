import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './../styles/DashboardSidebar.css'

export default function DashboardSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const role = user?.role || 'STUDENT'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function isActive(path) {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const menuItems = {
    STUDENT: [
      { label: 'Home', path: '/student/home', icon: '🏠' },
      { label: 'My Bookings', path: '/bookings', icon: '📅' },
      { label: 'Create Booking', path: '/bookings/create', icon: '➕' },
      { label: 'Profile', path: '/profile', icon: '👤' },
    ],
    LECTURER: [
      { label: 'Home', path: '/lecturer/home', icon: '🏠' },
      { label: 'My Bookings', path: '/bookings', icon: '📅' },
      { label: 'Create Booking', path: '/bookings/create', icon: '➕' },
      { label: 'Profile', path: '/profile', icon: '👤' },
    ],
    TECHNICIAN: [
      { label: 'Dashboard', path: '/technician/dashboard', icon: '🔧' },
      { label: 'My Bookings', path: '/bookings', icon: '📅' },
      { label: 'Profile', path: '/profile', icon: '👤' },
    ],
    ADMIN: [
      { label: 'Home', path: '/admin/home', icon: '🏠' },
      { label: 'All Bookings', path: '/bookings', icon: '📋' },
      { label: 'Profile', path: '/profile', icon: '👤' },
    ],
  }

  const roleLabels = {
    STUDENT: 'Student',
    LECTURER: 'Lecturer',
    TECHNICIAN: 'Technician',
    ADMIN: 'Administrator',
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          Smart<span>Campus</span>
        </div>
        <div className="sidebar-role">{roleLabels[role]}</div>
      </div>

      <nav className="sidebar-nav">
        {menuItems[role]?.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-email">{user?.email || ''}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}