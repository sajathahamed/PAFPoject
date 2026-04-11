import { Link } from 'react-router-dom'
import { MapPin, Users, Info, Trash2, ToggleLeft, ToggleRight, Pencil } from 'lucide-react'

export default function ResourceCard({ resource, isAdmin, onDelete, onStatusChange, onEdit }) {
  const isActive = resource.status === 'ACTIVE'

  return (
    <div className="resource-card">
      {/* Card body */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
          <h3 className="brand-name" style={{ fontSize: '1.2rem', color: 'var(--secondary)', flex: 1, minWidth: 0 }}>
            {resource.name}
          </h3>
          <span
            className={`resource-status-badge ${isActive ? 'status-active' : 'status-out-of-service'}`}
            style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            {isActive ? 'ACTIVE' : 'OUT OF SERVICE'}
          </span>
        </div>

        <div className="resource-info-list" style={{ marginBottom: '20px' }}>
          <div className="resource-info-item">
            <Info size={16} />
            <span><strong>Type:</strong> {resource.type}</span>
          </div>
          <div className="resource-info-item">
            <Users size={16} />
            <span><strong>Capacity:</strong> {resource.capacity} Seats</span>
          </div>
          <div className="resource-info-item">
            <MapPin size={16} />
            <span><strong>Location:</strong> {resource.location}</span>
          </div>
        </div>
      </div>

      {/* Card footer: view details + admin action buttons */}
      <div className="resource-card-footer">
        <Link
          to={`/resources/${resource.id}`}
          className="nav-link"
          style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '14px' }}
        >
          View details <span style={{ marginLeft: '4px' }}>→</span>
        </Link>

        {isAdmin && (
          <div className="resource-actions">
            {/* Edit button */}
            <button
              onClick={() => onEdit && onEdit(resource)}
              className="action-btn"
              title="Edit Resource"
            >
              <Pencil size={14} />
            </button>

            {/* Toggle Status button */}
            <button
              onClick={() => onStatusChange(resource.id, isActive ? 'OUT_OF_SERVICE' : 'ACTIVE')}
              className={`action-btn ${isActive ? '' : 'btn-activate'}`}
              title={isActive ? 'Deactivate' : 'Activate'}
              style={{ color: isActive ? '#d97706' : '#059669' }}
            >
              {isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            </button>

            {/* Delete button */}
            <button
              onClick={() => onDelete(resource.id)}
              className="action-btn btn-delete"
              title="Delete Resource"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
