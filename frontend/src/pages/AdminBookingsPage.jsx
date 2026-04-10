import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';
import bookingService from '../services/bookingService';
import { BOOKING_STATUS_LABELS, formatBookingRange, getRejectionReasonText } from '../utils/bookingUtils';
import '../styles/AdminConsole.css';

function statusBadgeClass(status) {
  return `booking-status-badge ${(status || '').toLowerCase()}`;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [resourceFilter, setResourceFilter] = useState('');
  const [requesterNameFilter, setRequesterNameFilter] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (resourceFilter) params.resourceId = resourceFilter;
      if (requesterNameFilter.trim()) params.requesterName = requesterNameFilter.trim();
      const data = await bookingService.adminList(params);
      setBookings(data);
      setSelected(new Set());
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, resourceFilter, requesterNameFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    (async () => {
      try {
        const r = await bookingService.listResources();
        setResources(r);
      } catch {
        /* optional */
      }
    })();
  }, []);

  const toggleRow = (id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const pendingSelectable = bookings.filter((b) => b.status === 'PENDING');
  const allPendingSelected =
    pendingSelectable.length > 0 && pendingSelectable.every((b) => selected.has(b.id));

  const toggleSelectAllPending = () => {
    if (allPendingSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pendingSelectable.map((b) => b.id)));
    }
  };

  const handleBulkApprove = async () => {
    const ids = [...selected].filter((id) => bookings.find((b) => b.id === id && b.status === 'PENDING'));
    if (ids.length === 0) return;
    try {
      setBusy(true);
      await bookingService.bulkApprove(ids);
      await fetchBookings();
    } catch (err) {
      setError(err.response?.data?.error || 'Bulk approve failed');
    } finally {
      setBusy(false);
    }
  };

  const handleBulkRejectSubmit = async (e) => {
    e.preventDefault();
    const ids = [...selected].filter((id) => bookings.find((b) => b.id === id && b.status === 'PENDING'));
    if (ids.length === 0 || !bulkRejectReason.trim()) return;
    try {
      setBusy(true);
      await bookingService.bulkReject(ids, bulkRejectReason.trim());
      setBulkRejectOpen(false);
      setBulkRejectReason('');
      await fetchBookings();
    } catch (err) {
      setError(err.response?.data?.error || 'Bulk reject failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="admin-console">
          <header className="admin-console-hero">
            <div>
              <span className="admin-console-badge">Administration</span>
              <h1>Booking approval queue</h1>
              <p>
                Review facility requests, filter by status or resource, and approve or reject pending items in bulk.
                Student and lecturer views use a simpler &quot;My bookings&quot; workflow; this console is for oversight only.
              </p>
            </div>
            <button type="button" className="btn btn-secondary" onClick={fetchBookings}>
              Refresh data
            </button>
          </header>

          <div className="admin-console-body">
            {error && (
              <div className="admin-console-section" style={{ paddingTop: 16, paddingBottom: 0 }}>
                <div className="alert alert-error">{error}</div>
              </div>
            )}

            <section className="admin-console-section">
              <h2 className="admin-console-section-title">Filter results</h2>
              <div className="admin-console-filters">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Resource</label>
                  <select
                    className="form-select"
                    value={resourceFilter}
                    onChange={(e) => setResourceFilter(e.target.value)}
                  >
                    <option value="">All resources</option>
                    {resources.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Requester</label>
                  <input
                    className="form-input"
                    value={requesterNameFilter}
                    onChange={(e) => setRequesterNameFilter(e.target.value)}
                    placeholder="Name or email — partial match, not case-sensitive"
                    autoComplete="name"
                  />
                </div>
              </div>
            </section>

            <section className="admin-console-section">
              <h2 className="admin-console-section-title">Bulk actions (pending only)</h2>
              <div className="admin-console-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy || selected.size === 0}
                  onClick={handleBulkApprove}
                >
                  Approve selected
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={busy || selected.size === 0}
                  onClick={() => setBulkRejectOpen(true)}
                >
                  Reject selected
                </button>
                <p className="admin-console-hint">
                  Select rows with the checkboxes in the table below. Only <strong>pending</strong> requests can be
                  approved or rejected; other statuses are skipped.
                </p>
              </div>
            </section>

            <section className="admin-console-section" style={{ paddingTop: 8 }} aria-busy={loading}>
              <h2 className="admin-console-section-title">Results</h2>
              {loading ? (
                <div className="admin-console-table-wrap" style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                  <div className="spinner" aria-label="Loading bookings" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="admin-console-empty">No bookings match the filters above.</div>
              ) : (
                <div className="admin-console-table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th style={{ width: 44 }} scope="col">
                          <input
                            type="checkbox"
                            title="Select all pending in this list"
                            checked={allPendingSelected}
                            onChange={toggleSelectAllPending}
                            aria-label="Select all pending bookings"
                          />
                        </th>
                        <th scope="col">Resource</th>
                        <th scope="col">Requester</th>
                        <th scope="col">Schedule</th>
                        <th scope="col">Decision</th>
                        <th scope="col" style={{ width: 100 }}>
                          Detail
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id}>
                          <td>
                            {b.status === 'PENDING' ? (
                              <input
                                type="checkbox"
                                checked={selected.has(b.id)}
                                onChange={() => toggleRow(b.id)}
                                aria-label={`Select booking ${b.id}`}
                              />
                            ) : (
                              <span style={{ color: '#cbd5e1' }} aria-hidden>
                                —
                              </span>
                            )}
                          </td>
                          <td>
                            <strong>{b.resourceName || '—'}</strong>
                            {b.purpose && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{b.purpose}</div>}
                          </td>
                          <td>{b.userName || b.userId}</td>
                          <td>{formatBookingRange(b.startTime, b.endTime)}</td>
                          <td>
                            <span className={statusBadgeClass(b.status)}>{BOOKING_STATUS_LABELS[b.status]}</span>
                            {b.status === 'REJECTED' && getRejectionReasonText(b) && (
                              <div style={{ fontSize: 12, color: '#842029', marginTop: 6, maxWidth: 280 }}>
                                {getRejectionReasonText(b)}
                              </div>
                            )}
                          </td>
                          <td>
                            <Link to={`/bookings/${b.id}`} className="btn btn-sm btn-outline">
                              Review
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>

        {bulkRejectOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">Reject selected bookings</h2>
              <form onSubmit={handleBulkRejectSubmit}>
                <div className="form-group mb-2">
                  <label className="form-label">Reason (required)</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={bulkRejectReason}
                    onChange={(e) => setBulkRejectReason(e.target.value)}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={busy}
                    onClick={() => setBulkRejectOpen(false)}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-danger" disabled={busy}>
                    Reject selected
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
