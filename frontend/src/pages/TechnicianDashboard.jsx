import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import DashboardSidebar from '../components/DashboardSidebar'

const TechnicianDashboard = () => {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">Welcome, {user?.name || 'Technician'}!</h1>
          <p className="page-subtitle">Technician Dashboard - Smart Campus</p>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <h3>Your Profile</h3>
            <div className="mt-2">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> <span className="badge badge-technician">{user?.role}</span></p>
            </div>
          </div>

          <div className="card">
            <h3>Pending Tickets</h3>
            <p className="mt-1">No pending tickets at the moment.</p>
          </div>

          <div className="card">
            <h3>Quick Actions</h3>
            <div className="mt-2">
              <button className="btn btn-primary">View All Tickets</button>
              <button className="btn btn-secondary" style={{ marginLeft: '10px' }}>Reports</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechnicianDashboard
