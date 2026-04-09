import { useState } from 'react'
import useAuth from '../hooks/useAuth'
import DashboardSidebar from '../components/DashboardSidebar'
import { Wrench, Clock, CheckCircle, AlertCircle, ListChecks } from 'lucide-react'

const TechnicianDashboard = () => {
  const { user } = useAuth()
  const [tickets] = useState([
    { id: 1, title: 'Projector not working - Room 101', location: 'Building A', status: 'OPEN', priority: 'HIGH' },
    { id: 2, title: 'AC maintenance request', location: 'Building B', status: 'IN_PROGRESS', priority: 'MEDIUM' },
    { id: 3, title: 'WiFi connectivity issue', location: 'Library', status: 'OPEN', priority: 'LOW' },
  ])

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
          <h1 className="page-title">Welcome, {user?.name?.split(' ')[0] || 'Technician'}!</h1>
          <p className="page-subtitle">Technician Dashboard - Smart Campus</p>
        </div>

        <div className="dashboard-grid">
          <div className="stat-mini-card">
            <div className="stat-mini-icon open"><AlertCircle size={20} /></div>
            <div className="stat-mini-content">
              <span className="stat-mini-value">{tickets.filter(t => t.status === 'OPEN').length}</span>
              <span className="stat-mini-label">Pending</span>
            </div>
          </div>

          <div className="stat-mini-card">
            <div className="stat-mini-icon progress"><Clock size={20} /></div>
            <div className="stat-mini-content">
              <span className="stat-mini-value">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</span>
              <span className="stat-mini-label">In Progress</span>
            </div>
          </div>

          <div className="stat-mini-card">
            <div className="stat-mini-icon"><CheckCircle size={20} /></div>
            <div className="stat-mini-content">
              <span className="stat-mini-value">15</span>
              <span className="stat-mini-label">Resolved</span>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>Assigned Tickets</h2>
          </div>

          <div className="tickets-list">
            {tickets.map(ticket => (
              <div key={ticket.id} className="ticket-item">
                <div className="ticket-info">
                  <h4>{ticket.title}</h4>
                  <div className="ticket-meta">
                    <span className="ticket-category">{ticket.location}</span>
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
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechnicianDashboard