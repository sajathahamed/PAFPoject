import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function LecturerHome() {
  const { user, logout } = useAuth()

  return (
    <div className="placeholder-page">
      <h2>Welcome, {user?.name}.</h2>
      <p>Your lecturer dashboard is coming soon.</p>
      
      <div style={{ marginTop: 24, padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
        <h3>Explore Facilities</h3>
        <Link to="/resources" style={{ color: 'blue', textDecoration: 'underline' }}>
          View Resource Catalogue
        </Link>
      </div>

      <button className="btn-logout" onClick={logout} style={{ marginTop: 24 }}>
        Log out
      </button>
    </div>
  )
}
