import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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

export default function AdminTickets() {
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
          <h1>Tickets</h1>
        </div>
        <p className="page-subtext">Coming next: admin view of all tickets and filters.</p>

        <Link className="resource-link" to="/admin/resources">Back to resources</Link>
      </div>
    </>
  )
}

