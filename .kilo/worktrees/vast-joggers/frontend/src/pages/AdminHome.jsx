import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import DashboardSidebar from '../components/DashboardSidebar'
import './../styles/DashboardPages.css'

export default function AdminHome() {
  const { user } = useAuth()
  const [stats] = useState({
    totalBookings: 45,
    pending: 8,
    approved: 32,
    rejected: 5
  })

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-main">
        <div className="dashboard-header">
          <div className="dashboard-welcome">
            <h1>Admin Dashboard</h1>
            <p>Overview of all campus bookings</p>
          </div>
          <div className="dashboard-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalBookings}</span>
              <span className="stat-label">Total Bookings</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-info">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed">✓</div>
            <div className="stat-info">
              <span className="stat-value">{stats.approved}</span>
              <span className="stat-label">Approved</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rejected">✕</div>
            <div className="stat-info">
              <span className="stat-value">{stats.rejected}</span>
              <span className="stat-label">Rejected</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <a href="/bookings" className="action-card">
              <span className="action-icon">📋</span>
              <span className="action-text">View All Bookings</span>
            </a>
            <a href="/bookings/create" className="action-card">
              <span className="action-icon">➕</span>
              <span className="action-text">Create Booking</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}