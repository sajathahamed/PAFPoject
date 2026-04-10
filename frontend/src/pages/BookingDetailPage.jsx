import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';
import useAuth from '../hooks/useAuth';
import bookingService from '../services/bookingService';
import { BOOKING_STATUS_LABELS, formatBookingRange, getRejectionReasonText } from '../utils/bookingUtils';
import '../styles/AdminConsole.css';

function statusBadgeClass(status) {
  return `booking-status-badge ${(status || '').toLowerCase()}`;
}

export default function BookingDetailPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [adminCancelOpen, setAdminCancelOpen] = useState(false);
  const [adminCancelReason, setAdminCancelReason] = useState('');
  const [userCancelOpen, setUserCancelOpen] = useState(false);
  const [userCancelReason, setUserCancelReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const b = await bookingService.getOne(id);
      setBooking(b);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const isOwner = booking && user && booking.userId === user.id;
  const canUserCancel = isOwner && booking && (booking.status === 'PENDING' || booking.status === 'APPROVED');
  const canAdminAct = isAdmin() && booking && booking.status === 'PENDING';
  const canAdminCancel =
    isAdmin() && booking && (booking.status === 'PENDING' || booking.status === 'APPROVED');

  const handleApprove = async () => {
    try {
      setBusy(true);
      setActionError(null);
      await bookingService.approve(id);
      await load();
    } catch (err) {
      setActionError(err.response?.data?.error || err.response?.data?.message || 'Approve failed');
    } finally {
      setBusy(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    try {
      setBusy(true);
      setActionError(null);
      await bookingService.reject(id, rejectReason.trim());
      setRejectOpen(false);
      setRejectReason('');
      await load();
    } catch (err) {
      setActionError(err.response?.data?.error || err.response?.data?.message || 'Reject failed');
    } finally {
      setBusy(false);
    }
  };

  const handleAdminCancelSubmit = async (e) => {
    e.preventDefault();
    if (!adminCancelReason.trim()) return;
    try {
      setBusy(true);
      setActionError(null);
      await bookingService.cancel(id, adminCancelReason.trim());
      setAdminCancelOpen(false);
      setAdminCancelReason('');
      await load();
    } catch (err) {
      setActionError(err.response?.data?.error || err.response?.data?.message || 'Cancel failed');
    } finally {
      setBusy(false);
    }
  };

  const handleUserCancelSubmit = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      setActionError(null);
      await bookingService.cancel(id, userCancelReason.trim() || undefined);
      setUserCancelOpen(false);
      setUserCancelReason('');
      await load();
    } catch (err) {
      setActionError(err.response?.data?.error || err.response?.data?.message || 'Cancel failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar />
        <div className="dashboard-content">
          <div className="spinner" aria-label="Loading" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar />
        <div className="dashboard-content">
          <div className="alert alert-error">{error || 'Not found'}</div>
          <Link to="/bookings/my" className="btn btn-secondary">
            Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        {isAdmin() && (
          <div className="admin-console-detail-accent">
            <strong>Admin review</strong> — Approve or reject affects the requester immediately. Use the approval queue for bulk
            actions.
          </div>
        )}

        <div className="page-header flex-between">
          <div>
            <h1 className="page-title">{isAdmin() ? 'Review booking request' : 'Booking detail'}</h1>
            <p className="page-subtitle">{booking.resourceName || 'Resource'}</p>
          </div>
          <div className="flex gap-1">
            {isAdmin() ? (
              <Link to="/admin/bookings" className="btn btn-secondary">
                Back to approval queue
              </Link>
            ) : (
              <Link to="/bookings/my" className="btn btn-secondary">
                My bookings
              </Link>
            )}
            {(isOwner || isAdmin()) && !isAdmin() && (
              <Link to="/bookings/new" className="btn btn-primary">
                New booking
              </Link>
            )}
          </div>
        </div>

        {actionError && <div className="alert alert-error">{actionError}</div>}

        <div className="card">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <span className={statusBadgeClass(booking.status)}>{BOOKING_STATUS_LABELS[booking.status]}</span>
            {booking.recurringSeriesId && (
              <span style={{ fontSize: 12, color: '#64748b' }}>Part of recurring series</span>
            )}
          </div>

          <p style={{ fontSize: 15, marginBottom: 12 }}>
            <strong>When:</strong> {formatBookingRange(booking.startTime, booking.endTime)}
          </p>
          <p style={{ fontSize: 15, marginBottom: 12 }}>
            <strong>Requested by:</strong> {booking.userName || booking.userId}
          </p>
          {booking.purpose && (
            <p style={{ fontSize: 15, marginBottom: 12 }}>
              <strong>Purpose:</strong> {booking.purpose}
            </p>
          )}

          {booking.status === 'REJECTED' && (
            <div className="booking-meta-block">
              <h4>Rejection reason</h4>
              <p>{getRejectionReasonText(booking) || 'No reason was recorded for this rejection.'}</p>
            </div>
          )}

          {booking.status === 'CANCELLED' && booking.cancellationReason && (
            <div className="booking-meta-block">
              <h4>Cancellation reason</h4>
              <p>{booking.cancellationReason}</p>
            </div>
          )}

          {canAdminAct && (
            <div className="flex gap-1" style={{ marginTop: 24 }}>
              <button type="button" className="btn btn-primary" disabled={busy} onClick={handleApprove}>
                Approve
              </button>
              <button type="button" className="btn btn-danger" disabled={busy} onClick={() => setRejectOpen(true)}>
                Reject
              </button>
            </div>
          )}

          {canUserCancel && (
            <div style={{ marginTop: 16 }}>
              <button type="button" className="btn btn-outline" disabled={busy} onClick={() => setUserCancelOpen(true)}>
                Cancel booking
              </button>
            </div>
          )}

          {canAdminCancel && (
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                className="btn btn-danger"
                disabled={busy}
                onClick={() => setAdminCancelOpen(true)}
              >
                Cancel as admin (requires reason)
              </button>
            </div>
          )}
        </div>

        {rejectOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">Reject booking</h2>
              <form onSubmit={handleRejectSubmit}>
                <div className="form-group mb-2">
                  <label className="form-label">Reason (required)</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                    placeholder="Explain why this request cannot be approved"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => setRejectOpen(false)}>
                    Close
                  </button>
                  <button type="submit" className="btn btn-danger" disabled={busy}>
                    Reject
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {adminCancelOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">Cancel booking (admin)</h2>
              <form onSubmit={handleAdminCancelSubmit}>
                <div className="form-group mb-2">
                  <label className="form-label">Cancellation reason (required)</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={adminCancelReason}
                    onChange={(e) => setAdminCancelReason(e.target.value)}
                    required
                    placeholder="Reason shown to the requester"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={busy}
                    onClick={() => setAdminCancelOpen(false)}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-danger" disabled={busy}>
                    Cancel booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {userCancelOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">Cancel booking</h2>
              <form onSubmit={handleUserCancelSubmit}>
                <div className="form-group mb-2">
                  <label className="form-label">Reason (optional)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={userCancelReason}
                    onChange={(e) => setUserCancelReason(e.target.value)}
                    placeholder="Optional note for your records"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={busy}
                    onClick={() => setUserCancelOpen(false)}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-outline" disabled={busy}>
                    Confirm cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
