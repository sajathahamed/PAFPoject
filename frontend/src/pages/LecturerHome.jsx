import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import DashboardSidebar from '../components/DashboardSidebar'

const LecturerHome = () => {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">Welcome, {user?.name || 'Lecturer'}!</h1>
          <p className="page-subtitle">Lecturer Dashboard - Smart Campus</p>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <h3>Your Profile</h3>
            <div className="mt-2">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> <span className="badge badge-lecturer">{user?.role}</span></p>
            </div>
          </div>

          <div className="card">
            <h3>Your Classes</h3>
            <p className="mt-1">No classes assigned yet.</p>
          </div>

          <div className="card">
            <h3>Quick Actions</h3>
            <div className="mt-2">
              <button className="btn btn-primary">Submit Request</button>
              <button className="btn btn-secondary" style={{ marginLeft: '10px' }}>View Announcements</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LecturerHome
