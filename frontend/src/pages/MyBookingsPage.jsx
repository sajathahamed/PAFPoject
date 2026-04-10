import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';
import bookingService from '../services/bookingService';
import { BOOKING_STATUS_LABELS, formatBookingRange, getRejectionReasonText } from '../utils/bookingUtils';

function statusBadgeClass(status) {
  return `booking-status-badge ${(status || '').toLowerCase()}`;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getMy();
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header flex-between">
          <div>
            <h1 className="page-title">My bookings</h1>
            <p className="page-subtitle">Track requests and approved slots</p>
          </div>
          <div className="flex gap-1">
            <Link to="/bookings/new" className="btn btn-primary">
              New booking
            </Link>
            <button type="button" className="btn btn-secondary" onClick={load}>
              Refresh
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          {bookings.length === 0 ? (
            <p style={{ color: '#64748b' }}>No bookings yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>When</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.resourceName || 'Resource'}</strong>
                      {b.purpose && (
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{b.purpose}</div>
                      )}
                    </td>
                    <td>{formatBookingRange(b.startTime, b.endTime)}</td>
                    <td>
                      <span className={statusBadgeClass(b.status)}>{BOOKING_STATUS_LABELS[b.status] || b.status}</span>
                      {b.status === 'REJECTED' && getRejectionReasonText(b) && (
                        <div style={{ fontSize: 12, color: '#842029', marginTop: 6, maxWidth: 280 }}>
                          <strong>Reason:</strong> {getRejectionReasonText(b)}
                        </div>
                      )}
                    </td>
                    <td>
                      <Link to={`/bookings/${b.id}`} className="btn btn-sm btn-outline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
