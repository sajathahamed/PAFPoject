import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  createResource,
  deleteResource,
  fetchResources,
  patchResourceStatus,
  updateResource,
} from '../api/resources'
import ResourceForm from '../components/ResourceForm'

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

export default function AdminResourcesPage() {
  const { user, logout } = useAuth()
  const [q, setQ] = useState('')
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null | resource | {id?}
  const [busy, setBusy] = useState(false)

  const params = useMemo(() => (q.trim() ? { q: q.trim() } : {}), [q])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchResources(params)
      setResources(data)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load resources.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  async function handleCreate(payload) {
    setBusy(true)
    try {
      await createResource({
        name: payload.name,
        type: payload.type,
        capacity: payload.capacity,
        location: payload.location,
      })
      setEditing(null)
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function handleUpdate(payload) {
    setBusy(true)
    try {
      await updateResource(editing.id, payload)
      setEditing(null)
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm('Delete this resource? This cannot be undone.')
    if (!ok) return
    setBusy(true)
    try {
      await deleteResource(id)
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Delete failed.')
    } finally {
      setBusy(false)
    }
  }

  async function toggleStatus(r) {
    setBusy(true)
    setError('')
    try {
      const next = r.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE'
      await patchResourceStatus(r.id, next)
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Status update failed.')
    } finally {
      setBusy(false)
    }
  }

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
          <h1>Manage Resources</h1>
          <span className="count-badge">{resources.length}</span>
        </div>
        <p className="page-subtext">Create, update, delete, and change status</p>

        <div className="admin-tools">
          <input
            className="resource-input"
            placeholder="Search by name…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="resource-link" type="button" onClick={() => setEditing({})}>
            + New resource
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        {loading ? (
          <div className="loading-wrap">Loading…</div>
        ) : resources.length === 0 ? (
          <div className="empty-state">No resources yet.</div>
        ) : (
          <div className="admin-table">
            <div className="admin-row admin-head">
              <div>Name</div>
              <div>Type</div>
              <div>Capacity</div>
              <div>Location</div>
              <div>Status</div>
              <div className="admin-actions-col">Actions</div>
            </div>
            {resources.map((r) => (
              <div key={r.id} className="admin-row">
                <div className="admin-name">{r.name}</div>
                <div>{r.type}</div>
                <div>{r.capacity}</div>
                <div>{r.location}</div>
                <div>
                  <span className={`resource-status ${r.status}`}>
                    {r.status === 'OUT_OF_SERVICE' ? 'Out of service' : 'Active'}
                  </span>
                </div>
                <div className="admin-actions-col">
                  <button className="admin-btn" onClick={() => setEditing(r)} disabled={busy}>Edit</button>
                  <button className="admin-btn" onClick={() => toggleStatus(r)} disabled={busy}>
                    {r.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                  </button>
                  <button className="admin-btn danger" onClick={() => handleDelete(r.id)} disabled={busy}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing !== null && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box">
            <button className="modal-close" onClick={() => setEditing(null)} aria-label="Close">×</button>
            <ResourceForm
              initialValue={editing?.id ? editing : null}
              busy={busy}
              onCancel={() => setEditing(null)}
              onSubmit={editing?.id ? handleUpdate : handleCreate}
            />
          </div>
        </div>
      )}
    </>
  )
}

