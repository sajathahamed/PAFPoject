import { useEffect, useMemo, useState } from 'react'

const TYPES = ['ROOM', 'LAB', 'HALL']
const STATUSES = ['ACTIVE', 'OUT_OF_SERVICE']

export default function ResourceForm({ initialValue, onSubmit, onCancel, busy }) {
  const isEdit = !!initialValue?.id
  const [form, setForm] = useState({
    name: '',
    type: 'ROOM',
    capacity: 1,
    location: '',
    status: 'ACTIVE',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialValue) {
      setForm({
        name: initialValue.name || '',
        type: initialValue.type || 'ROOM',
        capacity: initialValue.capacity ?? 1,
        location: initialValue.location || '',
        status: initialValue.status || 'ACTIVE',
      })
    }
  }, [initialValue])

  const validation = useMemo(() => {
    if (!form.name.trim()) return 'Name is required.'
    if (!TYPES.includes(form.type)) return 'Invalid type.'
    if (!Number.isFinite(Number(form.capacity)) || Number(form.capacity) < 1) return 'Capacity must be > 0.'
    if (!form.location.trim()) return 'Location is required.'
    if (!STATUSES.includes(form.status)) return 'Invalid status.'
    return ''
  }, [form])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const v = validation
    if (v) { setError(v); return }

    const payload = {
      name: form.name.trim(),
      type: form.type,
      capacity: Number(form.capacity),
      location: form.location.trim(),
      status: form.status,
    }

    try {
      await onSubmit(payload)
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Save failed.')
    }
  }

  return (
    <form className="resource-form" onSubmit={handleSubmit}>
      <div className="resource-form-title">{isEdit ? 'Update Resource' : 'Create Resource'}</div>
      {error && <div className="form-error">{error}</div>}

      <div className="resource-form-grid">
        <div className="form-field">
          <label htmlFor="r-name">Name</label>
          <input
            id="r-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Main Auditorium"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="r-type">Type</label>
          <select
            id="r-type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="r-cap">Capacity</label>
          <input
            id="r-cap"
            type="number"
            min="1"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="r-loc">Location</label>
          <input
            id="r-loc"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g., Malabe - Block A"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="r-status">Status</label>
          <select
            id="r-status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="resource-form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="btn-confirm" disabled={busy}>
          {busy ? 'Saving…' : isEdit ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

