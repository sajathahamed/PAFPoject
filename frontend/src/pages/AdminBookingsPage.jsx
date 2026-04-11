import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardSidebar from '../components/DashboardSidebar'
import { adminListBookings, approveBooking, rejectBooking, listBookingResources } from '../api/bookings'
import authService from '../services/authService'

function formatDateTime(v) {
  if (!v) return '-'
  try {
    return new Date(v).toLocaleString()
  } catch {
    return String(v)
  }
}

function statusBadgeClass(status) {
  switch (status) {
    case 'APPROVED': return 'status-badge status-approved'
    case 'REJECTED': return 'status-badge status-rejected'
    case 'CANCELLED': return 'status-badge status-cancelled'
    default: return 'status-badge status-pending'
  }
}

function isLikelyObjectId(value) {
  return typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value.trim())
}

function cleanDisplayValue(value) {
  if (!value) return ''
  const text = String(value).trim()
  if (!text) return ''
  if (isLikelyObjectId(text)) return ''
  return text
}

export default function AdminBookingsPage() {
  const [status, setStatus] = useState('ALL')
  const [userQuery, setUserQuery] = useState('')
  const [resourceQuery, setResourceQuery] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [busyId, setBusyId] = useState(null)
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [userMap, setUserMap] = useState({})
  const [resourceMap, setResourceMap] = useState({})

  const load = async (s = status, uq = userQuery, rq = resourceQuery) => {
    setLoading(true)
    setAlert({ type: '', message: '' })
    try {
      const data = await adminListBookings({
        status: s === 'ALL' ? undefined : (s || undefined),
        userQuery: uq || undefined,
        resourceQuery: rq || undefined,
      })
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setAlert({ type: 'error', message: e?.response?.data?.message || 'Failed to load bookings' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(status, userQuery, resourceQuery) }, [status])
  useEffect(() => {
    const t = setTimeout(() => {
      load(status, userQuery, resourceQuery)
    }, 300)
    return () => clearTimeout(t)
  }, [userQuery, resourceQuery])
  useEffect(() => {
    let alive = true
    const loadLookups = async () => {
      try {
        const [users, resources] = await Promise.all([
          authService.getAllUsers(),
          listBookingResources(),
        ])
        if (!alive) return
        const uMap = {}
        ;(Array.isArray(users) ? users : []).forEach((u) => {
          if (u?.id) uMap[u.id] = u.name || u.email || u.id
        })
        const rMap = {}
        ;(Array.isArray(resources) ? resources : []).forEach((r) => {
          if (r?.id) rMap[r.id] = r.name || r.id
        })
        setUserMap(uMap)
        setResourceMap(rMap)
      } catch {
        if (!alive) return
        setUserMap({})
        setResourceMap({})
      }
    }
    loadLookups()
    return () => { alive = false }
  }, [])

  const resolveUser = (booking) => {
    return cleanDisplayValue(booking?.userName)
      || cleanDisplayValue(userMap[booking?.userId])
      || 'Unknown user'
  }

  const resolveResource = (booking) => {
    return cleanDisplayValue(booking?.resourceName)
      || cleanDisplayValue(resourceMap[booking?.resourceId])
      || 'Unknown resource'
  }

  const onApprove = async (id) => {
    setBusyId(id)
    setAlert({ type: '', message: '' })
    try {
      await approveBooking(id)
      setAlert({ type: 'success', message: 'Booking approved.' })
      await load()
    } catch (e) {
      setAlert({ type: 'error', message: e?.response?.data?.message || 'Approve failed' })
    } finally {
      setBusyId(null)
    }
  }

  const onReject = async (id) => {
    if (!rejectReason.trim()) {
      setAlert({ type: 'error', message: 'Please enter a rejection reason.' })
      return
    }
    setBusyId(id)
    setAlert({ type: '', message: '' })
    try {
      await rejectBooking(id, rejectReason.trim())
      setAlert({ type: 'success', message: 'Booking rejected.' })
      setRejectingId(null)
      setRejectReason('')
      await load()
    } catch (e) {
      setAlert({ type: 'error', message: e?.response?.data?.message || 'Reject failed' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">All Bookings</h1>
          <p className="page-subtitle">Review and manage booking requests.</p>
        </div>

        {alert.message && (
          <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {alert.message}
          </div>
        )}

        <div className="content-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'nowrap' }}>
            <h2>Bookings</h2>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'nowrap', justifyContent: 'flex-end', overflowX: 'auto' }}>
              <input
                className="form-input"
                placeholder="Filter by user"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                style={{ width: 220, minWidth: 220, flex: '0 0 220px' }}
              />
              <input
                className="form-input"
                placeholder="Filter by resource"
                value={resourceQuery}
                onChange={(e) => setResourceQuery(e.target.value)}
                style={{ width: 220, minWidth: 220, flex: '0 0 220px' }}
              />
              <label style={{ fontSize: 12, color: '#64748b' }}>Filter</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 180, minWidth: 180, flex: '0 0 180px' }}>
                <option value="ALL">ALL</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="spinner" aria-label="Loading" />
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Resource</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th style={{ width: 320 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 16, color: '#666' }}>
                        No bookings in this filter.
                      </td>
                    </tr>
                  ) : (
                    items
                      .slice()
                      .sort((a, b) => String(b?.createdAt || '').localeCompare(String(a?.createdAt || '')))
                      .map((b) => (
                        <tr key={b.id}>
                          <td>{resolveUser(b)}</td>
                          <td>{resolveResource(b)}</td>
                          <td>{formatDateTime(b.startTime)}</td>
                          <td>{formatDateTime(b.endTime)}</td>
                          <td><span className={statusBadgeClass(b.status)}>{b.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', alignItems: 'center' }}>
                              <Link
                                className="btn btn-secondary"
                                to={`/bookings/${b.id}`}
                                style={{ width: 110, minWidth: 110, height: 36 }}
                              >
                                View
                              </Link>

                              {b.status === 'PENDING' && (
                                <>
                                  <button
                                    className="btn btn-primary"
                                    onClick={() => onApprove(b.id)}
                                    disabled={busyId === b.id}
                                    style={{ width: 110, minWidth: 110, height: 36 }}
                                  >
                                    {busyId === b.id ? 'Working…' : 'Approve'}
                                  </button>
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => {
                                      setRejectingId(b.id)
                                      setRejectReason('')
                                    }}
                                    disabled={busyId === b.id}
                                    style={{ width: 110, minWidth: 110, height: 36 }}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>

                            {rejectingId === b.id && (
                              <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                <input
                                  className="form-input"
                                  placeholder="Rejection reason"
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  style={{ minWidth: 220 }}
                                />
                                <button className="btn btn-danger" onClick={() => onReject(b.id)} disabled={busyId === b.id}>
                                  {busyId === b.id ? 'Rejecting…' : 'Confirm reject'}
                                </button>
                                <button className="btn btn-secondary" type="button" onClick={() => setRejectingId(null)}>
                                  Close
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

