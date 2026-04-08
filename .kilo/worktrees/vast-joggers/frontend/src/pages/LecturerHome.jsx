import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import DashboardSidebar from '../components/DashboardSidebar'
import './../styles/DashboardPages.css'

export default function LecturerHome() {
  const { user } = useAuth()
  const [stats] = useState({
    totalBookings: 8,
    pending: 1,
    completed: 7
  })

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-main">
        <div className="dashboard-header">
          <div className="dashboard-welcome">
            <h1>Welcome, {user?.name?.split(' ')[0]}!</h1>
            <p>Manage your room bookings</p>
          </div>
          <div className="dashboard-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
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
              <span className="stat-value">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <a href="/bookings/create" className="action-card">
              <span className="action-icon">➕</span>
              <span className="action-text">Create New Booking</span>
            </a>
            <a href="/bookings" className="action-card">
              <span className="action-icon">📋</span>
              <span className="action-text">View All Bookings</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}