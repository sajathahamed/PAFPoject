import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardSidebar from '../components/DashboardSidebar'
import useAuth from '../hooks/useAuth'
import { cancelBooking, listMyBookings } from '../api/bookings'

function formatDateTime(v) {
  if (!v) return '-'
  try {
    const d = new Date(v)
    return d.toLocaleString()
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

export default function MyBookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [busyId, setBusyId] = useState(null)

  const canCreate = useMemo(() => user?.role === 'STUDENT' || user?.role === 'LECTURER', [user])
  const canCancelRole = useMemo(() => user?.role === 'STUDENT' || user?.role === 'LECTURER', [user])

  const load = async () => {
    setLoading(true)
    setAlert({ type: '', message: '' })
    try {
      const data = await listMyBookings()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setAlert({ type: 'error', message: e?.response?.data?.message || 'Failed to load bookings' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCancel = async (id) => {
    setAlert({ type: '', message: '' })
    setBusyId(id)
    try {
      await cancelBooking(id)
      setAlert({ type: 'success', message: 'Booking cancelled.' })
      await load()
    } catch (e) {
      setAlert({ type: 'error', message: e?.response?.data?.message || e?.response?.data?.error || 'Cancel failed' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Track your booking requests and approvals.</p>
        </div>

        {alert.message && (
          <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {alert.message}
          </div>
        )}

        <div className="content-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <h2>Bookings</h2>
            {canCreate && (
              <button className="btn btn-primary" onClick={() => navigate('/bookings/new')}>
                New booking
              </button>
            )}
          </div>

          {loading ? (
            <div className="spinner" aria-label="Loading" />
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th>Purpose</th>
                    <th style={{ width: 220 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 16, color: '#666' }}>
                        No bookings yet.
                      </td>
                    </tr>
                  ) : (
                    items
                      .slice()
                      .sort((a, b) => String(b?.startTime || '').localeCompare(String(a?.startTime || '')))
                      .map((b) => (
                        <tr key={b.id}>
                          <td>{b.resourceName || b.resourceId}</td>
                          <td>{formatDateTime(b.startTime)}</td>
                          <td>{formatDateTime(b.endTime)}</td>
                          <td>
                            <span className={statusBadgeClass(b.status)}>{b.status}</span>
                          </td>
                          <td>{b.purpose || '-'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <Link className="btn btn-secondary" to={`/bookings/${b.id}`}>View</Link>
                              {canCancelRole && b.status === 'APPROVED' && (
                                <button
                                  className="btn btn-danger"
                                  onClick={() => onCancel(b.id)}
                                  disabled={busyId === b.id}
                                >
                                  {busyId === b.id ? 'Cancelling…' : 'Cancel'}
                                </button>
                              )}
                            </div>
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

