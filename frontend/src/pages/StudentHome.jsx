import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import DashboardSidebar from '../components/DashboardSidebar'

const StudentHome = () => {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">Welcome, {user?.name || 'Student'}!</h1>
          <p className="page-subtitle">Student Dashboard - Smart Campus</p>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <h3>Your Profile</h3>
            <div className="mt-2">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> <span className="badge badge-student">{user?.role}</span></p>
            </div>
          </div>

          <div className="card">
            <h3>Quick Actions</h3>
            <div className="mt-2">
              <button className="btn btn-primary">Create New Ticket</button>
              <button className="btn btn-secondary" style={{ marginLeft: '10px' }}>View History</button>
            </div>
          </div>

          <div className="card">
            <h3>Recent Tickets</h3>
            <p className="mt-1">No tickets yet. Create your first ticket to get started.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentHome
