import StatusBadge from './StatusBadge'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const created = new Date(dateStr)
  const diffMs = now - created
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 30) return `${diffDays} days ago`
  const diffMonths = Math.floor(diffDays / 30)
  return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`
}

export default function TicketCard({ ticket, onResolveClick }) {
  const priorityCls = ticket.priority?.toUpperCase() || 'LOW'

  return (
    <div className="ticket-card">
      <div className="ticket-card-top">
        <h3 className="ticket-title">{ticket.title}</h3>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="ticket-meta">
        <span className="category-tag">{ticket.category}</span>
        <span className={`priority-text ${priorityCls}`}>
          {priorityCls.charAt(0) + priorityCls.slice(1).toLowerCase()} Priority
        </span>
      </div>

      <p className="ticket-desc">{ticket.description}</p>

      <div className="ticket-footer">
        <span className="ticket-date">{timeAgo(ticket.createdAt)}</span>

        <div className="ticket-actions">
          {ticket.status === 'IN_PROGRESS' && (
            <button className="btn-resolve" onClick={() => onResolveClick(ticket)}>
              Mark as Resolved
            </button>
          )}
        </div>
      </div>

      {ticket.status === 'RESOLVED' && ticket.resolutionNote && (
        <div className="resolution-box">
          <div className="resolution-label">Resolution</div>
          <p>{ticket.resolutionNote}</p>
        </div>
      )}
    </div>
  )
}
