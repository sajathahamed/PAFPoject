import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchResourceById } from '../api/resources'

function Avatar({ user }) {
  const [imgFailed, setImgFailed] = useState(false)
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?'
  if (user?.picture && !imgFailed) {
    return (
      <div className="avatar">
        <img src={user.picture} alt={user.name} onError={() => setImgFailed(true)} />
      </div>
    )
  }
  return <div className="avatar">{initial}</div>
}

export default function ResourceDetailPage() {
  const { id } = useParams()
  const { user, logout } = useAuth()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    fetchResourceById(id)
      .then((data) => { if (alive) setResource(data) })
      .catch((e) => { if (alive) setError(e?.response?.data?.message || 'Failed to load resource.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [id])

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
        <Link className="resource-link" to="/resources">Back</Link>

        {loading ? (
          <div className="loading-wrap">Loading…</div>
        ) : error ? (
          <div className="form-error">{error}</div>
        ) : !resource ? (
          <div className="empty-state">Not found.</div>
        ) : (
          <div className="resource-detail">
            <div className="resource-detail-title">{resource.name}</div>
            <div className="resource-detail-grid">
              <div className="resource-detail-row">
                <div className="resource-detail-label">Type</div>
                <div className="resource-detail-value">{resource.type}</div>
              </div>
              <div className="resource-detail-row">
                <div className="resource-detail-label">Capacity</div>
                <div className="resource-detail-value">{resource.capacity}</div>
              </div>
              <div className="resource-detail-row">
                <div className="resource-detail-label">Location</div>
                <div className="resource-detail-value">{resource.location}</div>
              </div>
              <div className="resource-detail-row">
                <div className="resource-detail-label">Status</div>
                <div className="resource-detail-value">
                  {resource.status === 'OUT_OF_SERVICE' ? 'Out of service' : 'Active'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

