import { useState } from 'react'
import useAuth from '../hooks/useAuth'
import DashboardSidebar from '../components/DashboardSidebar'
import { User, Mail, Shield, LogIn } from 'lucide-react'

const Dashboard = () => {
  const { user, isAdmin } = useAuth()
  const [viewMode, setViewMode] = useState('view')
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleEdit = () => {
    setEditForm({ name: user?.name || '', email: user?.email || '' })
    setViewMode('edit')
    setAlert({ type: '', message: '' })
  }

  const handleCancel = () => {
    setViewMode('view')
    setAlert({ type: '', message: '' })
  }

  const handleSave = async () => {
    setLoading(true)
    setAlert({ type: '', message: '' })
    
    setTimeout(() => {
      setUser({ ...user, name: editForm.name, email: editForm.email })
      setViewMode('view')
      setAlert({ type: 'success', message: 'Profile updated successfully!' })
      setLoading(false)
    }, 500)
  }

  const { setUser } = useAuth()

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'badge-admin'
      case 'TECHNICIAN': return 'badge-technician'
      case 'LECTURER': return 'badge-lecturer'
      default: return 'badge-student'
    }
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
          <p className="page-subtitle">Smart Campus Operations Hub</p>
        </div>

        {alert.message && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="dashboard-grid">
          {/* Profile Card */}
          <div className="card profile-card">
            <div className="card-header">
              <h3><User size={18} /> My Profile</h3>
              {viewMode === 'view' && (
                <button className="btn btn-sm btn-outline" onClick={handleEdit}>
                  Edit
                </button>
              )}
            </div>

            {viewMode === 'view' ? (
              <div className="profile-view">
                <div className="profile-avatar-large">
                  {user?.picture ? (
                    <img src={user.picture} alt="Profile" />
                  ) : (
                    <div className="avatar-placeholder-lg">{user?.name?.[0] || '?'}</div>
                  )}
                </div>
                <div className="profile-info-grid">
                  <div className="info-item">
                    <User size={16} />
                    <div>
                      <label>Full Name</label>
                      <span>{user?.name}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <Mail size={16} />
                    <div>
                      <label>Email</label>
                      <span>{user?.email}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <Shield size={16} />
                    <div>
                      <label>Role</label>
                      <span className={`role-badge ${getRoleBadgeClass(user?.role)}`}>
                        {user?.role}
                      </span>
                    </div>
                  </div>
                  <div className="info-item">
                    <LogIn size={16} />
                    <div>
                      <label>Login Provider</label>
                      <span>{user?.provider}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="profile-edit">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Email {!isAdmin() && <span className="text-muted">(read-only)</span>}</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="form-input"
                    disabled={!isAdmin()}
                  />
                </div>
                <div className="form-actions">
                  <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="card stat-card">
            <div className="stat-icon">🏫</div>
            <div className="stat-content">
              <h3>Campus Hub</h3>
              <p>Smart Campus Operations Center</p>
            </div>
          </div>

          {/* Role-specific content */}
          {isAdmin() && (
            <div className="card action-card">
              <h3>Admin Controls</h3>
              <p>Manage system users and settings</p>
              <a href="/admin/users" className="btn btn-primary mt-2">
                Manage Users
              </a>
            </div>
          )}

          {/* Campus Services */}
          <div className="card services-card">
            <h3>Campus Services</h3>
            <ul className="services-list">
              <li>📋 Report facility issues</li>
              <li>🔧 Request maintenance</li>
              <li>📢 View announcements</li>
              <li>📊 Track requests</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard