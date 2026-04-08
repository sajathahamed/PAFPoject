import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Unauthorized() {
  const { user, logout } = useAuth()

  return (
    <div className="unauth-page">
      <h2>Access Denied</h2>
      <p>
        You don't have permission to view this page.
        {user && ` Your account role is ${user.role}.`}
      </p>
      {user ? (
        <button className="btn-logout" onClick={logout} style={{ marginTop: 16 }}>
          Log out
        </button>
      ) : (
        <Link to="/login" style={{ marginTop: 16, display: 'inline-block' }}>
          Back to login
        </Link>
      )}
    </div>
  )
}
