import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardSidebar from '../components/DashboardSidebar'
import useAuth from '../hooks/useAuth'
import { approveBooking, cancelBooking, getBooking, rejectBooking } from '../api/bookings'

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

export default function BookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [busy, setBusy] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const isAdmin = user?.role === 'ADMIN'
  const canCancelRole = user?.role === 'STUDENT' || user?.role === 'LECTURER'
  const isOwner = useMemo(() => item?.userId && user?.id && item.userId === user.id, [item, user])

  const load = async () => {
    setLoading(true)
    setAlert({ type: '', message: '' })
    try {
      const data = await getBooking(id)
      setItem(data)
    } catch (e) {
      setAlert({ type: 'error', message: e?.response?.data?.message || 'Failed to load booking' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const doApprove = async () => {
    setBusy(true)
    setAlert({ type: '', message: '' })
    try {
      const updated = await approveBooking(id)
      setItem(updated)
      setAlert({ type: 'success', message: 'Booking approved.' })
    } catch (e) {
      setAlert({ type: 'error', message: e?.response?.data?.message || 'Approve failed' })
    } finally {
      setBusy(false)
    }
  }

  const doReject = async () => {
    if (!rejectReason.trim()) {
      setAlert({ type: 'error', message: 'Please enter a rejection reason.' })
      return
    }
    setBusy(true)
    setAlert({ type: '', message: '' })
    try {
      const updated = await rejectBooking(id, rejectReason.trim())
      setItem(updated)
      setAlert({ type: 'success', message: 'Booking rejected.' })
      setRejectReason('')
    } catch (e) {
      setAlert({ type: 'error', message: e?.response?.data?.message || 'Reject failed' })
    } finally {
      setBusy(false)
    }
  }

  const doCancel = async () => {
    setBusy(true)
    setAlert({ type: '', message: '' })
    try {
      const updated = await cancelBooking(id)
      setItem(updated)
      setAlert({ type: 'success', message: 'Booking cancelled.' })
    } catch (e) {
      setAlert({ type: 'error', message: e?.response?.data?.message || 'Cancel failed' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Booking Detail</h1>
            <p className="page-subtitle">Review booking information and actions.</p>
          </div>
        </div>

        {alert.message && (
          <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {alert.message}
          </div>
        )}

        {loading ? (
          <div className="spinner" aria-label="Loading" />
        ) : (
          <div className="card booking-detail-card">
            {!item ? (
              <div className="booking-empty">Booking not found.</div>
            ) : (
              <>
                <div className="booking-detail-header">
                  <div className="booking-detail-header-main">
                    <h2 className="booking-resource-title">{item.resourceName || item.resourceId || 'Resource booking'}</h2>
                    <div className="booking-id-text">Booking ID: {item.id}</div>
                  </div>
                  <div className="booking-status-wrap">
                    <span className={statusBadgeClass(item.status)}>{item.status}</span>
                  </div>
                </div>

                <div className="booking-meta-grid">
                  <div className="booking-meta-card">
                    <div className="booking-meta-label">Start</div>
                    <div className="booking-meta-value">{formatDateTime(item.startTime)}</div>
                  </div>
                  <div className="booking-meta-card">
                    <div className="booking-meta-label">End</div>
                    <div className="booking-meta-value">{formatDateTime(item.endTime)}</div>
                  </div>
                  <div className="booking-meta-card">
                    <div className="booking-meta-label">User</div>
                    <div className="booking-meta-value">{item.userName || item.userId}</div>
                  </div>
                </div>

                <div className="booking-info-section">
                  <div className="booking-meta-label">Purpose</div>
                  <div className="booking-body-text">{item.purpose || '-'}</div>
                </div>

                {item.status === 'REJECTED' && (
                  <div className="booking-info-section">
                    <div className="booking-meta-label">Rejection reason</div>
                    <div className="booking-body-text">{item.rejectionReason || '-'}</div>
                  </div>
                )}

                <div className="booking-actions-bar">
                  {isAdmin && item.status === 'PENDING' ? (
                    <div className="booking-admin-actions">
                      <div className="booking-admin-action-row">
                        <button className="btn btn-secondary booking-action-btn" type="button" onClick={() => navigate(-1)}>
                          Back
                        </button>
                        <button className="btn btn-primary booking-action-btn" onClick={doApprove} disabled={busy}>
                          Approve
                        </button>
                        <button className="btn btn-danger booking-action-btn" onClick={doReject} disabled={busy}>
                          Reject
                        </button>
                      </div>
                      <input
                        className="form-input booking-reject-input"
                        placeholder="Rejection reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="booking-actions-group">
                      <button className="btn btn-secondary booking-action-back" type="button" onClick={() => navigate(-1)}>
                        Back
                      </button>
                      {canCancelRole && isOwner && item.status === 'APPROVED' && (
                        <button className="btn btn-danger booking-action-btn" onClick={doCancel} disabled={busy}>
                          Cancel booking
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

