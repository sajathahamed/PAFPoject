import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import DashboardSidebar from '../components/DashboardSidebar'

const AdminHome = () => {
  const { user } = useAuth()

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">Welcome, {user?.name || 'Admin'}!</h1>
          <p className="page-subtitle">Admin Dashboard - Smart Campus</p>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <h3>Your Profile</h3>
            <div className="mt-2">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> <span className="badge badge-admin">{user?.role}</span></p>
            </div>
          </div>

          <div className="card">
            <h3>Admin Actions</h3>
            <p className="mt-1">Manage system users and settings.</p>
            <div className="mt-2">
              <a href="/admin/users" className="btn btn-primary">Manage Users</a>
            </div>
          </div>

          <div className="card">
            <h3>System Overview</h3>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li>Total Users</li>
              <li>Active Tickets</li>
              <li>System Status</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminHome
