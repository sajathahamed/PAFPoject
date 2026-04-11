import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import DashboardSidebar from '../components/DashboardSidebar'
import { Plus, Clock, AlertCircle, Boxes } from 'lucide-react'
import axiosInstance from '../api/axiosInstance'

const StudentHome = () => {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [form, setForm] = useState({
    category1: 'Equipment',
    priority: 'MEDIUM',
    description: ''
  })

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError('')
      const ticketPath = user?.role === 'LECTURER' ? '/lecturer/tickets' : '/student/tickets'
      const response = await axiosInstance.get(ticketPath)
      setTickets(response.data || [])
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to load tickets'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [user?.role])

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'status-open'
      case 'IN_PROGRESS': return 'status-progress'
      case 'RESOLVED': return 'status-resolved'
      default: return ''
    }
  }

  const handleSubmitTicket = async (e) => {
    e.preventDefault()
    if (!form.description.trim()) {
      setFormError('Description is required')
      return
    }

    try {
      setSubmitting(true)
      setFormError('')
      const ticketPath = user?.role === 'LECTURER' ? '/lecturer/tickets' : '/student/tickets'
      await axiosInstance.post(ticketPath, {
        category1: form.category1,
        priority: form.priority,
        description: form.description.trim()
      })
      setForm({ category1: 'Equipment', priority: 'MEDIUM', description: '' })
      setShowCreateForm(false)
      await fetchTickets()
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to create ticket'
      setFormError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (value) => {
    if (!value) return 'N/A'
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString()
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">Welcome, {user?.name?.split(' ')[0] || 'Student'}!</h1>
          <p className="page-subtitle">{user?.role === 'LECTURER' ? 'Lecturer Portal - Smart Campus' : 'Student Portal - Smart Campus'}</p>
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

          {error && <div className="alert alert-error">{error}</div>}

          {showCreateForm && (
            <form className="card create-ticket-form" onSubmit={handleSubmitTicket}>
              <h3>Create New Ticket</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-select"
                    value={form.category1}
                    onChange={(e) => setForm((prev) => ({ ...prev, category1: e.target.value }))}
                  >
                    <option value="Equipment">Equipment</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    className="form-select"
                    value={form.priority}
                    onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Detailed description..."
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  ></textarea>
                </div>
              </div>
              {formError && <p className="error-message">{formError}</p>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div className="tickets-list">
            {loading ? (
              <div className="empty-state">
                <p>Loading tickets...</p>
              </div>
            ) : tickets.length > 0 ? (
              tickets.map(ticket => (
                <div key={ticket.id} className="ticket-item">
                  <div className="ticket-info">
                    <h4>{ticket.description?.substring(0, 60) || 'No description'}{ticket.description?.length > 60 ? '...' : ''}</h4>
                    <div className="ticket-meta">
                      <span className="ticket-category">{ticket.category || 'N/A'}</span>
                      <span className="ticket-date">{formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>
                  <div className="ticket-status">
                    <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className={`priority-badge priority-${(ticket.priority || 'medium').toLowerCase()}`}>
                      {ticket.priority || 'MEDIUM'}
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
