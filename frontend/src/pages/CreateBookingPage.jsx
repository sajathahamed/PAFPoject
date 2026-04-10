import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';
import ConflictWarning from '../components/ConflictWarning';
import useAuth from '../hooks/useAuth';
import bookingService from '../services/bookingService';
import { toIsoLocalDateTime } from '../utils/bookingUtils';

const WEEKDAYS = [
  { v: 1, label: 'Mon' },
  { v: 2, label: 'Tue' },
  { v: 3, label: 'Wed' },
  { v: 4, label: 'Thu' },
  { v: 5, label: 'Fri' },
  { v: 6, label: 'Sat' },
  { v: 7, label: 'Sun' },
];

export default function CreateBookingPage() {
  const navigate = useNavigate();
  const { isLecturer } = useAuth();
  const [resources, setResources] = useState([]);
  const [resourceId, setResourceId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [mode, setMode] = useState('single');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [repeatOnDays, setRepeatOnDays] = useState([1, 2, 3, 4, 5]);

  const [conflicts, setConflicts] = useState([]);
  const [dayBookings, setDayBookings] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await bookingService.listResources();
        setResources(list);
        if (list.length) setResourceId((prev) => prev || list[0].id);
      } catch (err) {
        setLoadError(err.response?.data?.error || 'Could not load resources');
      }
    })();
  }, []);

  useEffect(() => {
    if (mode !== 'single' || !resourceId || !startTime || !endTime) {
      setConflicts([]);
      return;
    }
    const startIso = toIsoLocalDateTime(startTime);
    const endIso = toIsoLocalDateTime(endTime);
    const t = setTimeout(async () => {
      try {
        const r = await bookingService.checkConflict(resourceId, startIso, endIso);
        setConflicts(r.conflictingBookings || []);
      } catch {
        setConflicts([]);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [resourceId, startTime, endTime, mode]);

  useEffect(() => {
    if (mode !== 'single' || !resourceId || !startTime) {
      setDayBookings([]);
      return;
    }
    const datePart = startTime.slice(0, 10);
    if (!datePart || datePart.length !== 10) {
      setDayBookings([]);
      return;
    }
    const dayStart = `${datePart}T00:00:00`;
    const dayEnd = `${datePart}T23:59:59`;
    const t = setTimeout(async () => {
      try {
        const r = await bookingService.checkConflict(resourceId, dayStart, dayEnd);
        setDayBookings(r.conflictingBookings || []);
      } catch {
        setDayBookings([]);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [resourceId, startTime, mode]);

  const hasConflict = conflicts.length > 0;
  const canSubmitSingle = resourceId && startTime && endTime && !hasConflict;
  const toggleDay = (v) => {
    setRepeatOnDays((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v].sort((a, b) => a - b)));
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmitSingle) return;
    try {
      setSubmitting(true);
      setError(null);
      await bookingService.create({
        resourceId,
        startTime: toIsoLocalDateTime(startTime),
        endTime: toIsoLocalDateTime(endTime),
        purpose: purpose || undefined,
      });
      navigate('/bookings/my');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Could not create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecurringSubmit = async (e) => {
    e.preventDefault();
    if (!resourceId || !startTime || !endTime || !recurrenceEndDate || repeatOnDays.length === 0) {
      setError('Fill all recurring fields and pick at least one weekday.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await bookingService.createRecurring({
        resourceId,
        firstStart: toIsoLocalDateTime(startTime),
        firstEnd: toIsoLocalDateTime(endTime),
        recurrenceEndDate,
        repeatOnDays,
        purpose: purpose || undefined,
      });
      navigate('/bookings/my');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Could not create recurring bookings');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header flex-between">
          <div>
            <h1 className="page-title">Request a booking</h1>
            <p className="page-subtitle">Choose a resource and time. Conflicts are checked before you submit.</p>
          </div>
          <Link to="/bookings/my" className="btn btn-secondary">
            Back to my bookings
          </Link>
        </div>

        {loadError && <div className="alert alert-error">{loadError}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          {isLecturer() && (
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Booking type</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  className={`btn ${mode === 'single' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setMode('single')}
                >
                  Single request
                </button>
                <button
                  type="button"
                  className={`btn ${mode === 'recurring' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setMode('recurring')}
                >
                  Recurring (lecturer)
                </button>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                Single requests start as <strong>pending</strong> until an admin approves. Recurring series are{' '}
                <strong>auto-approved</strong> when there is no conflict.
              </p>
            </div>
          )}

          <form onSubmit={mode === 'recurring' && isLecturer() ? handleRecurringSubmit : handleSingleSubmit}>
            <div className="form-group">
              <label className="form-label">Resource</label>
              <select
                className="form-select"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                required
              >
                <option value="">Select resource</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.location ? `— ${r.location}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Start</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {mode === 'single' && (
              <>
                <ConflictWarning conflicts={conflicts} />
                <ConflictWarning
                  conflicts={dayBookings}
                  title="Already booked on this date"
                  intro="Existing bookings for this resource on the selected date are shown below. Pick a free time window."
                />
              </>
            )}

            <div className="form-group">
              <label className="form-label">Purpose (optional)</label>
              <textarea
                className="form-input"
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Lab session, exam, workshop…"
              />
            </div>

            {mode === 'recurring' && isLecturer() && (
              <>
                <div className="form-group">
                  <label className="form-label">Repeat until (date)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">On weekdays</label>
                  <div className="booking-day-toggles">
                    {WEEKDAYS.map((d) => (
                      <label key={d.v} className="booking-day-toggle">
                        <input
                          type="checkbox"
                          checked={repeatOnDays.includes(d.v)}
                          onChange={() => toggleDay(d.v)}
                        />
                        {d.label}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="form-actions-modern" style={{ marginTop: 24 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || (mode === 'single' && !canSubmitSingle)}
              >
                {submitting ? 'Submitting…' : mode === 'recurring' && isLecturer() ? 'Create series' : 'Submit request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
