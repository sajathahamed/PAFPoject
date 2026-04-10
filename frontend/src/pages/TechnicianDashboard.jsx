import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import DashboardSidebar from '../components/DashboardSidebar'
import technicianService from '../services/technicianService'
import { 
  Clock, CheckCircle, AlertCircle, XCircle, 
  Image, Trash2, Plus, MessageSquare, ChevronDown,
  RefreshCw, Eye, X
} from 'lucide-react'

const TechnicianDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [newImages, setNewImages] = useState([])
  const [updating, setUpdating] = useState(false)

  // Fetch all tickets
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await technicianService.getAllTickets()
      setTickets(data || [])
    } catch (err) {
      const errorData = err.response?.data
      const errorMessage = errorData?.message || errorData?.error || JSON.stringify(errorData) || err.message
      console.error('Error fetching tickets:', err.response?.status, errorMessage)
      
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.')
      } else if (err.response?.status === 403) {
        setError('Access denied. You must be logged in as a TECHNICIAN to view tickets.')
      } else if (err.response?.status === 400) {
        setError(`Bad Request: ${errorMessage}`)
      } else {
        setError(`Failed to load tickets: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // Filter tickets by status
  const filteredTickets = statusFilter === 'ALL' 
    ? tickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED')
    : tickets.filter(t => t.status === statusFilter)

  // Get counts
  const counts = {
    OPEN: tickets.filter(t => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    RESOLVED: tickets.filter(t => t.status === 'RESOLVED').length,
    CLOSED: tickets.filter(t => t.status === 'CLOSED').length,
  }

  // Status badge styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'status-open'
      case 'IN_PROGRESS': return 'status-progress'
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

  // Update ticket status
  const handleStatusUpdate = async (newStatus) => {
    if (!selectedTicket) return
    try {
      setUpdating(true)
      const updated = await technicianService.updateTicketStatus(selectedTicket.id, newStatus)
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t))
      setShowStatusModal(false)
      setSelectedTicket(null)
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update status. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  // Add comment
  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return
    try {
      setUpdating(true)
      await technicianService.addComment(selectedTicket.id, newComment.trim())
      setNewComment('')
      setShowCommentModal(false)
      setSelectedTicket(null)
      alert('Comment added successfully!')
    } catch (err) {
      console.error('Error adding comment:', err)
      alert('Failed to add comment. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  // Add images
  const handleAddImages = async () => {
    if (!selectedTicket || newImages.length === 0) return
    try {
      setUpdating(true)
      const updated = await technicianService.addImages(selectedTicket.id, newImages)
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t))
      setNewImages([])
      setShowImageModal(false)
      setSelectedTicket(null)
    } catch (err) {
      console.error('Error adding images:', err)
      alert('Failed to add images. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  // Delete image
  const handleDeleteImage = async (ticketId, imageIndex) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    try {
      setUpdating(true)
      const updated = await technicianService.deleteImage(ticketId, imageIndex)
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t))
    } catch (err) {
      console.error('Error deleting image:', err)
      alert('Failed to delete image. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  // Handle image file selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    setNewImages(files)
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar />
        <div className="dashboard-content">
          <div className="loading-spinner">Loading tickets...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Welcome, {user?.name?.split(' ')[0] || 'Technician'}!</h1>
            <p className="page-subtitle">Technician Dashboard - Smart Campus</p>
          </div>
          <button className="btn btn-secondary" onClick={fetchTickets}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Stats Cards */}
        <div className="dashboard-grid">
          <div className="stat-mini-card" onClick={() => setStatusFilter('OPEN')} style={{cursor: 'pointer'}}>
            <div className="stat-mini-icon open"><AlertCircle size={20} /></div>
            <div className="stat-mini-content">
              <span className="stat-mini-value">{counts.OPEN}</span>
              <span className="stat-mini-label">Open</span>
            </div>
          </div>

          <div className="stat-mini-card" onClick={() => setStatusFilter('IN_PROGRESS')} style={{cursor: 'pointer'}}>
            <div className="stat-mini-icon progress"><Clock size={20} /></div>
            <div className="stat-mini-content">
              <span className="stat-mini-value">{counts.IN_PROGRESS}</span>
              <span className="stat-mini-label">In Progress</span>
            </div>
          </div>

          <div className="stat-mini-card" onClick={() => navigate('/technician/solved')} style={{cursor: 'pointer'}}>
            <div className="stat-mini-icon resolved"><CheckCircle size={20} /></div>
            <div className="stat-mini-content">
              <span className="stat-mini-value">{counts.RESOLVED}</span>
              <span className="stat-mini-label">Resolved</span>
            </div>
          </div>

          <div className="stat-mini-card" onClick={() => navigate('/technician/solved')} style={{cursor: 'pointer'}}>
            <div className="stat-mini-icon closed"><XCircle size={20} /></div>
            <div className="stat-mini-content">
              <span className="stat-mini-value">{counts.CLOSED}</span>
              <span className="stat-mini-label">Closed</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-group">
            <label>Filter by Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="ALL">Active (Open & In Progress)</option>
              <option value="OPEN">Open Only</option>
              <option value="IN_PROGRESS">In Progress Only</option>
            </select>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/technician/solved')}
          >
            <Eye size={16} /> View Solved Tickets
          </button>
        </div>

        {/* Tickets List */}
        <div className="content-section">
          <div className="section-header">
            <h2>Active Tickets ({filteredTickets.length})</h2>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={48} />
              <p>No tickets found for the selected filter.</p>
            </div>
          ) : (
            <div className="tickets-list">
              {filteredTickets.map(ticket => (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-header">
                    <div className="ticket-info">
                      <h4>{ticket.description?.substring(0, 60) || 'No description'}{ticket.description?.length > 60 ? '...' : ''}</h4>
                      <div className="ticket-meta">
                        <span className="ticket-category">{ticket.category}</span>
                        <span className="ticket-date">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="ticket-badges">
                      <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                        {ticket.status?.replace('_', ' ')}
                      </span>
                      <span className={`priority-badge ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>

                  {/* Images Preview */}
                  {ticket.images && ticket.images.length > 0 && (
                    <div className="ticket-images">
                      {ticket.images.map((img, idx) => (
                        <div key={idx} className="image-thumbnail">
                          <img src={img} alt={`Ticket image ${idx + 1}`} />
                          <button 
                            className="image-delete-btn"
                            onClick={() => handleDeleteImage(ticket.id, idx)}
                            title="Delete image"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="ticket-actions">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => { setSelectedTicket(ticket); setShowStatusModal(true); }}
                    >
                      <ChevronDown size={14} /> Change Status
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => { setSelectedTicket(ticket); setShowCommentModal(true); }}
                    >
                      <MessageSquare size={14} /> Add Comment
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => { setSelectedTicket(ticket); setShowImageModal(true); }}
                    >
                      <Plus size={14} /> Add Image
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Update Modal */}
        {showStatusModal && selectedTicket && (
          <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Update Ticket Status</h3>
                <button className="modal-close" onClick={() => setShowStatusModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <p className="modal-subtitle">
                Current Status: <strong>{selectedTicket.status?.replace('_', ' ')}</strong>
              </p>
              <div className="status-options">
                {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
                  <button
                    key={status}
                    className={`status-option ${selectedTicket.status === status ? 'active' : ''}`}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updating || selectedTicket.status === status}
                  >
                    {status === 'OPEN' && <AlertCircle size={16} />}
                    {status === 'IN_PROGRESS' && <Clock size={16} />}
                    {status === 'RESOLVED' && <CheckCircle size={16} />}
                    {status === 'CLOSED' && <XCircle size={16} />}
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comment Modal */}
        {showCommentModal && selectedTicket && (
          <div className="modal-overlay" onClick={() => setShowCommentModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add Comment</h3>
                <button className="modal-close" onClick={() => setShowCommentModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Enter your comment..."
                />
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowCommentModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleAddComment}
                  disabled={updating || !newComment.trim()}
                >
                  {updating ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Upload Modal */}
        {showImageModal && selectedTicket && (
          <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add Images</h3>
                <button className="modal-close" onClick={() => setShowImageModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="form-group">
                <label className="form-label">Select Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="form-input"
                />
                {newImages.length > 0 && (
                  <p className="file-info">{newImages.length} file(s) selected</p>
                )}
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowImageModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleAddImages}
                  disabled={updating || newImages.length === 0}
                >
                  {updating ? 'Uploading...' : 'Upload Images'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-mini-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-mini-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }

        .stat-mini-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e3f2fd;
          color: #1976d2;
        }

        .stat-mini-icon.open { background: #fff3e0; color: #f57c00; }
        .stat-mini-icon.progress { background: #e3f2fd; color: #1976d2; }
        .stat-mini-icon.resolved { background: #e8f5e9; color: #388e3c; }
        .stat-mini-icon.closed { background: #fce4ec; color: #c2185b; }

        .stat-mini-content {
          display: flex;
          flex-direction: column;
        }

        .stat-mini-value {
          font-size: 28px;
          font-weight: 700;
          color: #1a2d4a;
        }

        .stat-mini-label {
          font-size: 13px;
          color: #64748b;
        }

        .filter-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding: 16px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-group label {
          font-weight: 500;
          color: #64748b;
        }

        .filter-group .form-select {
          min-width: 200px;
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
          margin-bottom: 16px;
        }

        .tickets-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ticket-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          background: #fafbfc;
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .ticket-info h4 {
          font-size: 15px;
          font-weight: 600;
          color: #1a2d4a;
          margin-bottom: 6px;
        }

        .ticket-meta {
          display: flex;
          gap: 12px;
          font-size: 13px;
          color: #64748b;
        }

        .ticket-category {
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .ticket-badges {
          display: flex;
          gap: 8px;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-open { background: #fff3e0; color: #f57c00; }
        .status-progress { background: #e3f2fd; color: #1976d2; }
        .status-resolved { background: #e8f5e9; color: #388e3c; }
        .status-closed { background: #f5f5f5; color: #616161; }

        .priority-badge {
          padding: 4px 10px;
          border-radius: 16px;
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
          margin-bottom: 12px;
        }

        .image-thumbnail {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
        }

        .image-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-delete-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(220, 53, 69, 0.9);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .image-thumbnail:hover .image-delete-btn {
          opacity: 1;
        }

        .ticket-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 13px;
        }

        .btn-sm svg {
          margin-right: 4px;
        }

        .empty-state {
          text-align: center;
          padding: 48px;
          color: #64748b;
        }

        .empty-state svg {
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .modal-header h3 {
          font-size: 18px;
          font-weight: 600;
        }

        .modal-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          padding: 4px;
        }

        .modal-subtitle {
          color: #64748b;
          margin-bottom: 16px;
        }

        .status-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .status-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .status-option:hover:not(:disabled) {
          border-color: #1976d2;
          background: #e3f2fd;
        }

        .status-option.active {
          border-color: #1976d2;
          background: #e3f2fd;
        }

        .status-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          resize: vertical;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #1976d2;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
        }

        .file-info {
          margin-top: 8px;
          font-size: 13px;
          color: #388e3c;
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
          .dashboard-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .ticket-header {
            flex-direction: column;
            gap: 12px;
          }

          .ticket-badges {
            order: -1;
          }

          .status-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default TechnicianDashboard