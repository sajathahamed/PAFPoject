<<<<<<< HEAD
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchTickets, updateTicketStatus } from '../api/technician'
import TicketCard from '../components/TicketCard'
import ResolveModal from '../components/ResolveModal'

const FILTERS = ['ALL', 'IN_PROGRESS', 'RESOLVED']

function Avatar({ user }) {
  const [imgFailed, setImgFailed] = useState(false)
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?'

  if (user?.picture && !imgFailed) {
    return (
      <div className="avatar">
        <img
          src={user.picture}
          alt={user.name}
          onError={() => setImgFailed(true)}
        />
      </div>
    )
  }

  return <div className="avatar">{initial}</div>
}

export default function TechnicianDashboard() {
  const { user, logout } = useAuth()

  const [tickets, setTickets] = useState([])
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [resolveTarget, setResolveTarget] = useState(null) // ticket being resolved
  const [resolveBusy, setResolveBusy] = useState(false)

  const loadTickets = useCallback(async (status) => {
    setLoading(true)
    try {
      const data = await fetchTickets(status)
      setTickets(data)
    } catch (e) {
      console.error('Failed to load tickets', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTickets(activeFilter)
  }, [activeFilter, loadTickets])

  async function handleConfirmResolve(ticketId, note) {
    setResolveBusy(true)
    try {
      const updated = await updateTicketStatus(ticketId, 'RESOLVED', note)
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      )
      setResolveTarget(null)
    } catch (e) {
      console.error('Failed to update ticket', e)
    } finally {
      setResolveBusy(false)
    }
  }

  // If filter is ALL, show all tickets; otherwise tickets are already filtered from API
  const displayed = tickets

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">Smart<span>Campus</span></div>
        <div className="navbar-user">
          <Avatar user={user} />
          <span className="navbar-username">{user?.name}</span>
          <button className="btn-logout" onClick={logout}>Log out</button>
        </div>
      </nav>

      {/* Dashboard content */}
      <div className="dashboard-body">
        <div className="page-heading">
          <h1>My Assigned Tickets</h1>
          <span className="count-badge">{tickets.length}</span>
        </div>
        <p className="page-subtext">Showing tickets assigned to you</p>

        {/* Filter tabs */}
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-tab${activeFilter === f ? ' active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f === 'IN_PROGRESS' ? 'In Progress' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Ticket list */}
        {loading ? (
          <div className="loading-wrap">Loading tickets…</div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">No tickets found.</div>
        ) : (
          <div className="ticket-list">
            {displayed.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onResolveClick={setResolveTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resolve modal */}
      {resolveTarget && (
        <ResolveModal
          ticket={resolveTarget}
          onConfirm={handleConfirmResolve}
          onClose={() => setResolveTarget(null)}
          loading={resolveBusy}
        />
      )}
    </>
  )
}
=======
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
>>>>>>> bd701d76c6f9bee465cf19d54b5d81dd77e597aa
