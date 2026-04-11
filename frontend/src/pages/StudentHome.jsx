import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import DashboardSidebar from '../components/DashboardSidebar'
import { Plus, Clock, AlertCircle, Boxes } from 'lucide-react'

const StudentHome = () => {
  const { user } = useAuth()
  const [tickets] = useState([
    { id: 1, title: 'Projector not working', category: 'Equipment', status: 'OPEN', priority: 'HIGH', date: '2024-01-15' },
    { id: 2, title: 'AC maintenance request', category: 'Maintenance', status: 'IN_PROGRESS', priority: 'MEDIUM', date: '2024-01-10' },
  ])
  const [showCreateForm, setShowCreateForm] = useState(false)

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'status-open'
      case 'IN_PROGRESS': return 'status-progress'
      case 'RESOLVED': return 'status-resolved'
      default: return ''
    }
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">Welcome, {user?.name?.split(' ')[0] || 'Student'}!</h1>
          <p className="page-subtitle">Student Portal - Smart Campus</p>
        </div>

        <div className="dashboard-grid">
          <div className="stat-mini-card">
            <div className="stat-mini-icon"><Clock size={20} /></div>
            <div className="stat-mini-content">
              <span className="stat-mini-value">{tickets.length}</span>
              <span className="stat-mini-label">Total Tickets</span>
            </div>
          </div>

          <div className="stat-mini-card">
            <div className="stat-mini-icon open"><AlertCircle size={20} /></div>
            <div className="stat-mini-content">
              <span className="stat-mini-value">{tickets.filter(t => t.status === 'OPEN').length}</span>
              <span className="stat-mini-label">Open</span>
            </div>
          </div>

          <div className="card">
            <h3><Boxes size={18} /> Facilities</h3>
            <p className="mt-1">Browse halls, labs, and other campus resources</p>
            <Link to="/resources" className="btn btn-primary mt-2">
              View Resource Catalogue
            </Link>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>My Tickets</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus size={16} /> New Ticket
            </button>
          </div>

          {showCreateForm && (
            <div className="card create-ticket-form">
              <h3>Create New Ticket</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" className="form-input" placeholder="Brief description of the issue" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-select">
                    <option>Equipment</option>
                    <option>Maintenance</option>
                    <option>Infrastructure</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-select">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea className="form-input" rows="3" placeholder="Detailed description..."></textarea>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn btn-primary">Submit Ticket</button>
                <button className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="tickets-list">
            {tickets.length > 0 ? (
              tickets.map(ticket => (
                <div key={ticket.id} className="ticket-item">
                  <div className="ticket-info">
                    <h4>{ticket.title}</h4>
                    <div className="ticket-meta">
                      <span className="ticket-category">{ticket.category}</span>
                      <span className="ticket-date">{ticket.date}</span>
                    </div>
                  </div>
                  <div className="ticket-status">
                    <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No tickets found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentHome
