import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import DashboardSidebar from '../components/DashboardSidebar'
import technicianService from '../services/technicianService'
import { 
  CheckCircle, XCircle, ArrowLeft, RefreshCw, 
  Calendar, Tag, MessageSquare
} from 'lucide-react'

/**
 * SolvedTickets Page - Shows all resolved and closed tickets
 * Accessible by technicians to review completed work
 */
const SolvedTickets = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, RESOLVED, CLOSED

  // Fetch all tickets and filter solved ones
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await technicianService.getAllTickets()
      // Filter only RESOLVED and CLOSED tickets
      const solvedTickets = data.filter(t => 
        t.status === 'RESOLVED' || t.status === 'CLOSED'
      )
      setTickets(solvedTickets)
    } catch (err) {
      setError('Failed to load solved tickets. Please try again.')
      console.error('Error fetching tickets:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // Filter tickets based on selected status
  const filteredTickets = statusFilter === 'ALL' 
    ? tickets 
    : tickets.filter(t => t.status === statusFilter)

  // Get counts for each status
  const counts = {
    ALL: tickets.length,
    RESOLVED: tickets.filter(t => t.status === 'RESOLVED').length,
    CLOSED: tickets.filter(t => t.status === 'CLOSED').length,
  }

  // Status badge styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'RESOLVED': return 'status-resolved'
      case 'CLOSED': return 'status-closed'
      default: return ''
    }
  }

  // Priority badge styling
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'priority-high'
      case 'MEDIUM': return 'priority-medium'
      case 'LOW': return 'priority-low'
      default: return ''
    }
  }

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar />
        <div className="dashboard-content">
          <div className="loading-spinner">Loading solved tickets...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <div className="header-left">
            <button 
              className="btn btn-back" 
              onClick={() => navigate('/technician/tickets')}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="page-title">Solved Tickets</h1>
            <p className="page-subtitle">
              View all resolved and closed tickets - {user?.name || 'Technician'}
            </p>
          </div>
          <button className="btn btn-secondary" onClick={fetchTickets}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Stats Summary */}
        <div className="stats-row">
          <div 
            className={`stat-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            <span className="stat-pill-count">{counts.ALL}</span>
            <span className="stat-pill-label">All Solved</span>
          </div>
          <div 
            className={`stat-pill resolved ${statusFilter === 'RESOLVED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('RESOLVED')}
          >
            <CheckCircle size={16} />
            <span className="stat-pill-count">{counts.RESOLVED}</span>
            <span className="stat-pill-label">Resolved</span>
          </div>
          <div 
            className={`stat-pill closed ${statusFilter === 'CLOSED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('CLOSED')}
          >
            <XCircle size={16} />
            <span className="stat-pill-count">{counts.CLOSED}</span>
            <span className="stat-pill-label">Closed</span>
          </div>
        </div>

        {/* Tickets List */}
        <div className="content-section">
          <div className="section-header">
            <h2>
              {statusFilter === 'ALL' ? 'All Solved Tickets' : 
               statusFilter === 'RESOLVED' ? 'Resolved Tickets' : 'Closed Tickets'}
              ({filteredTickets.length})
            </h2>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={48} />
              <h3>No Solved Tickets</h3>
              <p>No tickets have been resolved or closed yet.</p>
            </div>
          ) : (
            <div className="solved-tickets-list">
              {filteredTickets.map(ticket => (
                <div key={ticket.id} className="solved-ticket-card">
                  <div className="ticket-main">
                    <div className="ticket-content">
                      <h4 className="ticket-title">
                        {ticket.description?.substring(0, 80) || 'No description'}
                        {ticket.description?.length > 80 ? '...' : ''}
                      </h4>
                      <div className="ticket-meta-row">
                        <span className="meta-item">
                          <Tag size={14} />
                          {ticket.category}
                        </span>
                        <span className="meta-item">
                          <Calendar size={14} />
                          Created: {formatDate(ticket.createdAt)}
                        </span>
                        {ticket.updatedAt && (
                          <span className="meta-item">
                            <CheckCircle size={14} />
                            Completed: {formatDate(ticket.updatedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ticket-badges">
                      <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                        {ticket.status === 'RESOLVED' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {ticket.status}
                      </span>
                      <span className={`priority-badge ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>

                  {/* Images if any */}
                  {ticket.images && ticket.images.length > 0 && (
                    <div className="ticket-images">
                      {ticket.images.map((img, idx) => (
                        <div key={idx} className="image-thumbnail">
                          <img src={img} alt={`Ticket image ${idx + 1}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .header-left {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #f1f5f9;
          color: #64748b;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          width: fit-content;
        }

        .btn-back:hover {
          background: #e2e8f0;
          color: #1a2d4a;
        }

        .stats-row {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .stat-pill:hover {
          border-color: #1976d2;
          background: #f8fafc;
        }

        .stat-pill.active {
          border-color: #1976d2;
          background: #e3f2fd;
        }

        .stat-pill.resolved {
          color: #388e3c;
        }

        .stat-pill.closed {
          color: #616161;
        }

        .stat-pill-count {
          font-size: 20px;
          font-weight: 700;
          color: #1a2d4a;
        }

        .stat-pill-label {
          font-size: 14px;
          color: #64748b;
        }

        .content-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .section-header h2 {
          font-size: 18px;
          font-weight: 600;
          color: #1a2d4a;
          margin-bottom: 20px;
        }

        .solved-tickets-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .solved-ticket-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          background: #fafbfc;
          transition: box-shadow 0.2s;
        }

        .solved-ticket-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .ticket-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .ticket-content {
          flex: 1;
        }

        .ticket-title {
          font-size: 15px;
          font-weight: 600;
          color: #1a2d4a;
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .ticket-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748b;
        }

        .meta-item svg {
          color: #94a3b8;
        }

        .ticket-badges {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-resolved { 
          background: #e8f5e9; 
          color: #388e3c; 
        }

        .status-closed { 
          background: #f5f5f5; 
          color: #616161; 
        }

        .priority-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .priority-high { background: #ffebee; color: #c62828; }
        .priority-medium { background: #fff8e1; color: #f57f17; }
        .priority-low { background: #e8f5e9; color: #2e7d32; }

        .ticket-images {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .image-thumbnail {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
        }

        .image-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
        }

        .empty-state svg {
          margin-bottom: 16px;
          color: #94a3b8;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a2d4a;
          margin-bottom: 8px;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          font-size: 16px;
          color: #64748b;
        }

        @media (max-width: 768px) {
          .stats-row {
            flex-direction: column;
          }

          .stat-pill {
            justify-content: center;
          }

          .ticket-main {
            flex-direction: column;
          }

          .ticket-badges {
            order: -1;
          }

          .ticket-meta-row {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  )
}

export default SolvedTickets
