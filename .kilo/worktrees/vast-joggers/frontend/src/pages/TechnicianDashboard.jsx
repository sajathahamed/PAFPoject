import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import DashboardSidebar from '../components/DashboardSidebar'
import './../styles/DashboardPages.css'

export default function TechnicianDashboard() {
  const { user } = useAuth()
  const [stats] = useState({
    totalTickets: 15,
    inProgress: 5,
    resolved: 10
  })

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-main">
        <div className="dashboard-header">
          <div className="dashboard-welcome">
            <h1>Technician Dashboard</h1>
            <p>Manage and resolve support tickets</p>
          </div>
          <div className="dashboard-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">🎫</div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalTickets}</span>
              <span className="stat-label">Total Tickets</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">🔧</div>
            <div className="stat-info">
              <span className="stat-value">{stats.inProgress}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed">✓</div>
            <div className="stat-info">
              <span className="stat-value">{stats.resolved}</span>
              <span className="stat-label">Resolved</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <a href="/technician/dashboard" className="action-card">
              <span className="action-icon">📋</span>
              <span className="action-text">View Tickets</span>
            </a>
            <a href="/bookings" className="action-card">
              <span className="action-icon">📅</span>
              <span className="action-text">Bookings</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}