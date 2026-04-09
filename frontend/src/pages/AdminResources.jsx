import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function Avatar({ user }) {
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?'

  if (user?.picture) {
    return (
      <div className="avatar">
        <img src={user.picture} alt={user.name} />
      </div>
    )
  }

  return <div className="avatar">{initial}</div>
}

export default function AdminResources() {
  const { user, logout } = useAuth()

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">Smart<span>Campus</span></div>
        <div className="navbar-user">
          <Avatar user={user} />
          <span className="navbar-username">{user?.name}</span>
          <button className="btn-logout" onClick={logout}>Log out</button>
        </div>
      </nav>

      <div className="dashboard-body">
        <div className="page-heading">
          <h1>Admin Resources</h1>
        </div>
        <p className="page-subtext">Quick access to admin modules</p>

        <div className="resource-grid">
          <div className="resource-card">
            <div className="resource-title">Users</div>
            <div className="resource-desc">Manage student/lecturer/technician/admin accounts.</div>
            <div className="resource-actions">
              <Link className="resource-link" to="/admin/resources/users">Open</Link>
            </div>
          </div>

          <div className="resource-card">
            <div className="resource-title">Tickets</div>
            <div className="resource-desc">Review tickets and track overall status.</div>
            <div className="resource-actions">
              <Link className="resource-link" to="/admin/resources/tickets">Open</Link>
            </div>
          </div>

          <div className="resource-card">
            <div className="resource-title">Settings</div>
            <div className="resource-desc">Configure categories, priorities, and access rules.</div>
            <div className="resource-actions">
              <Link className="resource-link" to="/admin/resources/settings">Open</Link>
            </div>
          </div>

          <div className="resource-card resource-card-muted">
            <div className="resource-title">Old Admin Home</div>
            <div className="resource-desc">Your previous placeholder page.</div>
            <div className="resource-actions">
              <Link className="resource-link" to="/admin/home">Go</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

