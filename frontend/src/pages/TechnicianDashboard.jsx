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
