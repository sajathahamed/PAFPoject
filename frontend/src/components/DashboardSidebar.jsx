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
  ClipboardList,
  GraduationCap,
  Building2,
  Boxes,
  Bell
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
      case 'Facilities': return <Building2 size={20} />
      case 'Resources': return <Boxes size={20} />
      case 'Notifications': return <Bell size={20} />
      case 'My Bookings': return <Calendar size={20} />
      case 'All Bookings': return <ClipboardList size={20} />
      default: return <User size={20} />
    }
  }

  const roleMenus = {
    STUDENT: [
      { label: 'Dashboard', path: '/student/home', icon: 'Dashboard' },
      { label: 'Facilities', path: '/resources', icon: 'Facilities' },
      { label: 'My Tickets', path: '/student/tickets', icon: 'My Tickets' },
      { label: 'My Bookings', path: '/bookings/my', icon: 'My Bookings' },
      { label: 'Notifications', path: '/notifications', icon: 'Notifications' },
    ],
    LECTURER: [
      { label: 'Dashboard', path: '/lecturer/home', icon: 'Dashboard' },
      { label: 'Facilities', path: '/resources', icon: 'Facilities' },
      { label: 'My Bookings', path: '/bookings/my', icon: 'My Bookings' },
      { label: 'Notifications', path: '/notifications', icon: 'Notifications' },
    ],
    TECHNICIAN: [
      { label: 'Dashboard', path: '/technician/dashboard', icon: 'Dashboard' },
      { label: 'Tickets', path: '/technician/tickets', icon: 'Tickets' },
      { label: 'Solved Tickets', path: '/technician/solved', icon: 'Solved Tickets' },
      { label: 'Notifications', path: '/notifications', icon: 'Notifications' },
    ],
    ADMIN: [
      { label: 'Dashboard', path: '/admin/home', icon: 'Dashboard' },
      { label: 'Resource Management', path: '/admin/resources', icon: 'Resources' },
      { label: 'User Management', path: '/admin/users', icon: 'User Management' },
      { label: 'All Bookings', path: '/admin/bookings', icon: 'All Bookings' },
      { label: 'Notifications', path: '/notifications', icon: 'Notifications' },
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
      <div className="sidebar-top-bar">
        <button type="button" className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

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
            key={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
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