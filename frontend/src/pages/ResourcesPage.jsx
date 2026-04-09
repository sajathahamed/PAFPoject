import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchResources } from '../api/resources'
import ResourceCard from '../components/ResourceCard'

const TYPES = ['', 'ROOM', 'LAB', 'HALL']
const STATUSES = ['', 'ACTIVE', 'OUT_OF_SERVICE']

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

export default function ResourcesPage() {
  const { user, logout } = useAuth()
  const [filters, setFilters] = useState({ q: '', type: '', capacity: '', location: '', status: '' })
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const params = useMemo(() => {
    const p = {}
    if (filters.q.trim()) p.q = filters.q.trim()
    if (filters.type) p.type = filters.type
    if (filters.status) p.status = filters.status
    if (filters.location.trim()) p.location = filters.location.trim()
    if (filters.capacity) p.capacity = Number(filters.capacity)
    return p
  }, [filters])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    fetchResources(params)
      .then((data) => { if (alive) setResources(data) })
      .catch((e) => { if (alive) setError(e?.response?.data?.message || 'Failed to load resources.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [params])

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
          <h1>Resources</h1>
          <span className="count-badge">{resources.length}</span>
        </div>
        <p className="page-subtext">Search and filter rooms, labs and halls</p>

        <div className="resource-filters">
          <input
            className="resource-input"
            placeholder="Search by name…"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />

          <select
            className="resource-input"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            {TYPES.map((t) => <option key={t || 'ALL'} value={t}>{t || 'All types'}</option>)}
          </select>

          <input
            className="resource-input"
            type="number"
            min="1"
            placeholder="Min capacity"
            value={filters.capacity}
            onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
          />

          <input
            className="resource-input"
            placeholder="Location…"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />

          <select
            className="resource-input"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            {STATUSES.map((s) => <option key={s || 'ALL'} value={s}>{s || 'All statuses'}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="loading-wrap">Loading resources…</div>
        ) : error ? (
          <div className="form-error">{error}</div>
        ) : resources.length === 0 ? (
          <div className="empty-state">No resources found.</div>
        ) : (
          <div className="resource-list">
            {resources.map((r) => <ResourceCard key={r.id} resource={r} />)}
          </div>
        )}
      </div>
    </>
  )
}

