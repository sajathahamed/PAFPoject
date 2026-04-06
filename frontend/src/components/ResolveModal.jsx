import { useState } from 'react'

export default function ResolveModal({ ticket, onConfirm, onClose, loading }) {
  const [note, setNote] = useState('')

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleSubmit(e) {
    e.preventDefault()
    onConfirm(ticket.id, note)
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <h2 className="modal-title">Mark as Resolved</h2>
        <p className="modal-ticket-name">{ticket.title}</p>

        <form onSubmit={handleSubmit}>
          <label className="modal-label" htmlFor="resolution-note">
            Resolution Note
          </label>
          <textarea
            id="resolution-note"
            className="modal-textarea"
            placeholder="Describe what was done to resolve this issue..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-confirm" disabled={loading}>
              {loading ? 'Saving...' : 'Confirm Resolution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
