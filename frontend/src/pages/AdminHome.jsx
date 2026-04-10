import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import DashboardSidebar from '../components/DashboardSidebar'
import { Users, Settings, BarChart3, CheckCircle, AlertCircle } from 'lucide-react'

const AdminHome = () => {
  const { user } = useAuth()

  const stats = [
    { label: 'Total Users', value: '156', icon: <Users size={20} /> },
    { label: 'Active Tickets', value: '23', icon: <AlertCircle size={20} /> },
    { label: 'Resolved', value: '89', icon: <CheckCircle size={20} /> },
  ]

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">Welcome, {user?.name?.split(' ')[0] || 'Admin'}!</h1>
          <p className="page-subtitle">Admin Dashboard - Smart Campus</p>
        </div>

        <div className="dashboard-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-mini-card">
              <div className="stat-mini-icon">{stat.icon}</div>
              <div className="stat-mini-content">
                <span className="stat-mini-value">{stat.value}</span>
                <span className="stat-mini-label">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid" style={{ marginTop: '24px' }}>
          <div className="card">
            <h3><Users size={18} /> User Management</h3>
            <p className="mt-1">Manage system users and their roles</p>
            <Link to="/admin/users" className="btn btn-primary mt-2">
              Manage Users
            </Link>
          </div>

          <div className="card">
            <h3><Settings size={18} /> System Settings</h3>
            <p className="mt-1">Configure system parameters</p>
            <button className="btn btn-secondary mt-2">
              Settings
            </button>
          </div>

          <div className="card">
            <h3><BarChart3 size={18} /> Reports</h3>
            <p className="mt-1">View system analytics</p>
            <button className="btn btn-secondary mt-2">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminHome