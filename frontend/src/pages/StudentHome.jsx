import { useAuth } from '../context/AuthContext'

export default function StudentHome() {
  const { user, logout } = useAuth()

  return (
    <div className="placeholder-page">
      <h2>Welcome, {user?.name}.</h2>
      <p>Your student dashboard is coming soon.</p>
      <button className="btn-logout" onClick={logout} style={{ marginTop: 12 }}>
        Log out
      </button>
    </div>
  )
}
