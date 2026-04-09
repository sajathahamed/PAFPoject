import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import '../styles/DashboardSidebar.css'

export default function DashboardSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(true)

  const roleMenus = {
    STUDENT: [
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      { label: 'My Tickets', path: '/student/tickets', icon: '🎫' },
      { label: 'Profile', path: '/profile', icon: '👤' },
    ],
    LECTURER: [
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      { label: 'My Classes', path: '/lecturer/classes', icon: '📚' },
      { label: 'Profile', path: '/profile', icon: '👤' },
    ],
    TECHNICIAN: [
      { label: 'Dashboard', path: '/dashboard', icon: '🔧' },
      { label: 'Tickets', path: '/technician/tickets', icon: '🎫' },
      { label: 'Profile', path: '/profile', icon: '👤' },
    ],
    ADMIN: [
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      { label: 'User Management', path: '/admin/users', icon: '👤' },
      { label: 'Profile', path: '/profile', icon: '⚙️' },
    ],
  }

  const menuItems = roleMenus[user?.role] || []
  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={`dashboard-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </button>

      {isOpen && (
        <div className="sidebar-brand">
          <svg className="sidebar-logo" viewBox="0 0 256 256" fill="none">
            <defs>
              <linearGradient id="sidebarLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#21ada1" />
                <stop offset="50%" stopColor="#21ada1" />
                <stop offset="100%" stopColor="#21ada1" />
              </linearGradient>
            </defs>
            <rect x="20" y="20" width="216" height="216" rx="50" fill="url(#sidebarLogoGradient)" />
            <path d="M80 120L100 100L140 140L180 100V140L140 180L100 140L80 160V120Z" fill="white" />
          </svg>
          <span className="brand-name">Smart Campus</span>
        </div>
      )}

      {isOpen && (
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.picture ? (
              <img src={user.picture} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">{user?.name?.[0] || '?'}</div>
            )}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.name}</p>
            <p className="user-role">{user?.role}</p>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            {isOpen && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-spacer"></div>

      <button className="sidebar-logout" onClick={handleLogout} title="Logout">
        <span className="logout-icon">🚪</span>
        {isOpen && <span className="logout-label">Log out</span>}
      </button>
    </div>
  )
}
