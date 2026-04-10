import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  User, 
  LogOut, 
  Menu,
  X,
  Settings,
  Calendar,
  ClipboardList
} from 'lucide-react'
import '../styles/DashboardSidebar.css'

export default function DashboardSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(true)

  const getIcon = (label) => {
    switch (label) {
      case 'Dashboard': return <LayoutDashboard size={20} />
      case 'My Tickets': return <Ticket size={20} />
      case 'Tickets': return <Ticket size={20} />
      case 'User Management': return <Users size={20} />
      case 'My Bookings': return <Calendar size={20} />
      case 'All Bookings': return <ClipboardList size={20} />
      default: return <User size={20} />
    }
  }

  const roleMenus = {
    STUDENT: [
      { label: 'Dashboard', path: '/dashboard', icon: 'Dashboard' },
      { label: 'My Tickets', path: '/student/tickets', icon: 'My Tickets' },
      { label: 'My Bookings', path: '/bookings/my', icon: 'My Bookings' },
    ],
    LECTURER: [
      { label: 'Dashboard', path: '/dashboard', icon: 'Dashboard' },
      { label: 'My Bookings', path: '/bookings/my', icon: 'My Bookings' },
    ],
    TECHNICIAN: [
      { label: 'Dashboard', path: '/dashboard', icon: 'Dashboard' },
      { label: 'Tickets', path: '/technician/tickets', icon: 'Tickets' },
    ],
    ADMIN: [
      { label: 'Dashboard', path: '/dashboard', icon: 'Dashboard' },
      { label: 'All Bookings', path: '/admin/bookings', icon: 'All Bookings' },
      { label: 'User Management', path: '/admin/users', icon: 'User Management' },
    ],
  }

  const menuItems = roleMenus[user?.role] || []

  const isItemActive = (item) => {
    if (item.path === '/bookings/my') {
      return location.pathname === '/bookings/my' || /^\/bookings\/[^/]+$/.test(location.pathname)
    }
    return location.pathname === item.path
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={`dashboard-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div className="sidebar-brand">
          <div className="brand-logo">
            <Settings size={28} />
          </div>
          <span className="brand-name">Smart Campus</span>
        </div>
      )}

      {isOpen && (
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" />
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
            key={`${item.path}-${item.label}`}
            className={`nav-item ${isItemActive(item) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            <span className="nav-icon">{getIcon(item.icon)}</span>
            {isOpen && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-spacer"></div>

      <button className="sidebar-logout" onClick={handleLogout} title="Logout">
        <span className="logout-icon"><LogOut size={20} /></span>
        {isOpen && <span className="logout-label">Log out</span>}
      </button>
    </div>
  )
}