<<<<<<< HEAD
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function LecturerHome() {
  const { user, logout } = useAuth()

  return (
    <div className="placeholder-page">
      <h2>Welcome, {user?.name}.</h2>
      <p>Your lecturer dashboard is coming soon.</p>
      
      <div style={{ marginTop: 24, padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
        <h3>Explore Facilities</h3>
        <Link to="/resources" style={{ color: 'blue', textDecoration: 'underline' }}>
          View Resource Catalogue
        </Link>
      </div>

      <button className="btn-logout" onClick={logout} style={{ marginTop: 24 }}>
        Log out
      </button>
    </div>
  )
}
=======
import { useState } from 'react'
import useAuth from '../hooks/useAuth'
import DashboardSidebar from '../components/DashboardSidebar'
import { GraduationCap, Clock, BookOpen, FileText } from 'lucide-react'

const LecturerHome = () => {
  const { user } = useAuth()
  const [classes] = useState([
    { id: 1, name: 'CS101 - Introduction to Programming', students: 45, schedule: 'Mon/Wed 9:00 AM' },
    { id: 2, name: 'CS201 - Data Structures', students: 32, schedule: 'Tue/Thu 11:00 AM' },
  ])

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">Welcome, {user?.name?.split(' ')[0] || 'Lecturer'}!</h1>
          <p className="page-subtitle">Lecturer Dashboard - Smart Campus</p>
        </div>

        <div className="dashboard-grid">
          <div className="stat-mini-card">
            <div className="stat-mini-icon"><GraduationCap size={20} /></div>
            <div className="stat-mini-content">
              <span className="stat-mini-value">{classes.length}</span>
              <span className="stat-mini-label">My Classes</span>
            </div>
          </div>

          <div className="stat-mini-card">
            <div className="stat-mini-icon"><BookOpen size={20} /></div>
            <div className="stat-mini-content">
              <span className="stat-mini-value">{classes.reduce((sum, c) => sum + c.students, 0)}</span>
              <span className="stat-mini-label">Total Students</span>
            </div>
          </div>

          <div className="stat-mini-card">
            <div className="stat-mini-icon"><FileText size={20} /></div>
            <div className="stat-mini-content">
              <span className="stat-mini-value">5</span>
              <span className="stat-mini-label">Pending Requests</span>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>My Classes</h2>
          </div>

          <div className="tickets-list">
            {classes.map(cls => (
              <div key={cls.id} className="ticket-item">
                <div className="ticket-info">
                  <h4>{cls.name}</h4>
                  <div className="ticket-meta">
                    <span className="ticket-category">{cls.schedule}</span>
                  </div>
                </div>
                <div className="ticket-status">
                  <span className="status-badge status-resolved">
                    {cls.students} Students
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

export default LecturerHome
>>>>>>> bd701d76c6f9bee465cf19d54b5d81dd77e597aa
