import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardSidebar from '../components/DashboardSidebar'
import useAuth from '../hooks/useAuth'
import ConflictWarning from '../components/ConflictWarning'
import { checkBookingConflict, createBooking, createRecurringBooking, listBookingResources } from '../api/bookings'

const WEEK_DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
]

function toLocalDateTimeString(date, time) {
  if (!date || !time) return ''
  // LocalDateTime on backend expects ISO, seconds optional but safest include.
  const t = time.length === 5 ? `${time}:00` : time
  return `${date}T${t}`
}

export default function CreateBookingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const isLecturer = user?.role === 'LECTURER'
  const [form, setForm] = useState({
    resourceId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    recurring: false,
    recurringStartDate: '',
    recurringEndDate: '',
    recurringDays: [1],
    recurringStartTime: '',
    recurringEndTime: '',
  })

  const [checking, setChecking] = useState(false)
  const [conflict, setConflict] = useState(false)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [resources, setResources] = useState([])
  const [resourcesLoading, setResourcesLoading] = useState(false)

  useEffect(() => {
    let alive = true
    const run = async () => {
      setResourcesLoading(true)
      try {
        const data = await listBookingResources()
        if (!alive) return
        setResources(Array.isArray(data) ? data : [])
      } catch {
        if (!alive) return
        setResources([])
      } finally {
        if (alive) setResourcesLoading(false)
      }
    }
    run()
    return () => { alive = false }
  }, [])

  const start = useMemo(
    () => toLocalDateTimeString(form.date, form.startTime),
    [form.date, form.startTime]
  )
  const end = useMemo(
    () => toLocalDateTimeString(form.date, form.endTime),
    [form.date, form.endTime]
  )

  const canCheck = useMemo(() => {
    return Boolean(form.resourceId && start && end)
  }, [form.resourceId, start, end])

  useEffect(() => {
    let alive = true
    const run = async () => {
      if (!canCheck) {
        setConflict(false)
        return
      }
      setChecking(true)
      try {
        const res = await checkBookingConflict(form.resourceId, start, end)
        if (!alive) return
        setConflict(Boolean(res?.conflict))
      } catch {
        if (!alive) return
        // If conflict check fails, do not block form automatically — show on submit.
        setConflict(false)
      } finally {
        if (!alive) return
        setChecking(false)
      }
    }

    // Debounce-ish: small delay to avoid spamming while typing.
    const t = setTimeout(run, 350)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [canCheck, form.resourceId, start, end])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    setAlert({ type: '', message: '' })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setAlert({ type: '', message: '' })

    if (conflict) {
      setAlert({ type: 'error', message: 'This time slot conflicts with an existing booking.' })
      return
    }

    setSubmitting(true)
    try {
      if (isLecturer && form.recurring) {
        if (!form.recurringStartDate || !form.recurringEndDate || !form.recurringStartTime || !form.recurringEndTime) {
          setAlert({ type: 'error', message: 'Please select recurring start/end dates and times.' })
          return
        }
        if ((form.recurringDays || []).length === 0) {
          setAlert({ type: 'error', message: 'Please select at least one day for recurring bookings.' })
          return
        }
        const payload = {
          resourceId: form.resourceId,
          startDate: form.recurringStartDate,
          endDate: form.recurringEndDate,
          slotStartTime: form.recurringStartTime,
          slotEndTime: form.recurringEndTime,
          daysOfWeek: form.recurringDays,
          purpose: form.purpose,
        }
        await createRecurringBooking(payload)
        setAlert({ type: 'success', message: 'Recurring bookings created and auto-approved.' })
      } else {
        const payload = {
          resourceId: form.resourceId,
          startTime: start,
          endTime: end,
          purpose: form.purpose,
        }
        await createBooking(payload)
        setAlert({ type: 'success', message: 'Booking request submitted (PENDING).' })
      }
      setTimeout(() => navigate('/bookings/my'), 600)
    } catch (err) {
      setAlert({
        type: 'error',
        message: err?.response?.data?.message || err?.response?.data?.error || 'Failed to create booking',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">New Booking</h1>
          <p className="page-subtitle">Request a time slot. Conflicts are blocked automatically.</p>
        </div>

        {alert.message && (
          <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {alert.message}
          </div>
        )}

        <div className="card">
          <form onSubmit={onSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Resource ID</label>
                <select
                  className="form-select"
                  name="resourceId"
                  value={form.resourceId}
                  onChange={onChange}
                  required
                >
                  <option value="">{resourcesLoading ? 'Loading resources...' : 'Select resource'}</option>
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name || r.id}{r.location ? ` - ${r.location}` : ''}{r.type ? ` (${r.type})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" name="date" value={form.date} onChange={onChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Start time</label>
                <input className="form-input" type="time" name="startTime" value={form.startTime} onChange={onChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">End time</label>
                <input className="form-input" type="time" name="endTime" value={form.endTime} onChange={onChange} required />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Purpose (optional)</label>
                <input className="form-input" name="purpose" value={form.purpose} onChange={onChange} placeholder="What is this booking for?" />
              </div>
            </div>

            <ConflictWarning
              visible={conflict}
              message="Conflict detected: another booking overlaps this time for the same resource."
            />

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                {checking ? 'Checking availability…' : canCheck ? (conflict ? 'Not available' : 'Available') : 'Enter details to check availability'}
              </span>
            </div>

            {isLecturer && (
              <div className="card" style={{ padding: 16, background: '#fafafa' }}>
                <div className="form-group" style={{ marginBottom: 10 }}>
                  <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input type="checkbox" name="recurring" checked={form.recurring} onChange={onChange} />
                    Create recurring (auto-approved if no conflict)
                  </label>
                </div>

                {form.recurring && (
                  <div style={{ display: 'grid', gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Repeat on days</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', overflowX: 'auto' }}>
                        {WEEK_DAYS.map((d) => {
                          const selected = form.recurringDays.includes(d.value)
                          return (
                            <button
                              key={d.value}
                              type="button"
                              style={{
                                border: 'none',
                                borderRadius: 6,
                                width: 54,
                                minWidth: 54,
                                maxWidth: 54,
                                height: 34,
                                cursor: 'pointer',
                                fontWeight: 600,
                                background: selected ? '#21ada1' : '#6c757d',
                                color: '#fff',
                              }}
                              onClick={() => {
                                setForm((f) => {
                                  const has = f.recurringDays.includes(d.value)
                                  return {
                                    ...f,
                                    recurringDays: has
                                      ? f.recurringDays.filter((x) => x !== d.value)
                                      : [...f.recurringDays, d.value].sort((a, b) => a - b),
                                  }
                                })
                              }}
                            >
                              {d.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Start date</label>
                        <input className="form-input" type="date" name="recurringStartDate" value={form.recurringStartDate} onChange={onChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">End date</label>
                        <input className="form-input" type="date" name="recurringEndDate" value={form.recurringEndDate} onChange={onChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Recurring start time</label>
                        <input className="form-input" type="time" name="recurringStartTime" value={form.recurringStartTime} onChange={onChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Recurring end time</label>
                        <input className="form-input" type="time" name="recurringEndTime" value={form.recurringEndTime} onChange={onChange} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/bookings/my')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting || conflict}>
                {submitting ? 'Submitting…' : isLecturer && form.recurring ? 'Create recurring' : 'Submit request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

