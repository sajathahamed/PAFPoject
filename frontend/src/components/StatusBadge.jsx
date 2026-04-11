export default function StatusBadge({ status }) {
  const map = {
    IN_PROGRESS: { label: 'In Progress', cls: 'badge-in-progress' },
    RESOLVED:    { label: 'Resolved',    cls: 'badge-resolved'    },
    OPEN:        { label: 'Open',        cls: 'badge-open'        },
    CLOSED:      { label: 'Closed',      cls: 'badge-closed'      },
  }

  const { label, cls } = map[status] || { label: status, cls: 'badge-open' }

  return <span className={`status-badge ${cls}`}>{label}</span>
}
