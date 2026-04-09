import { Link } from 'react-router-dom'

export default function ResourceCard({ resource }) {
  return (
    <Link to={`/resources/${resource.id}`} className="resource-item">
      <div className="resource-item-top">
        <div className="resource-item-title">{resource.name}</div>
        <span className={`resource-status ${resource.status}`}>
          {resource.status === 'OUT_OF_SERVICE' ? 'Out of service' : 'Active'}
        </span>
      </div>

      <div className="resource-item-meta">
        <span className="resource-pill">{resource.type}</span>
        <span className="resource-pill">Capacity {resource.capacity}</span>
        <span className="resource-pill">{resource.location}</span>
      </div>
    </Link>
  )
}

