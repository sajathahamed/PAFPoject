export default function ConflictWarning({ visible, message }) {
  if (!visible) return null

  return (
    <div className="alert alert-error" role="alert" aria-live="polite">
      {message || 'This time slot conflicts with an existing booking.'}
    </div>
  )
}
