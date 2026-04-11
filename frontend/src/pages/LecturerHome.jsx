import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import DashboardSidebar from '../components/DashboardSidebar'
import { GraduationCap, BookOpen, FileText, Boxes } from 'lucide-react'

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

          <div className="card">
            <h3><Boxes size={18} /> Facilities</h3>
            <p className="mt-1">Browse halls and lecture-friendly resources</p>
            <Link to="/resources" className="btn btn-primary mt-2">
              View Resource Catalogue
            </Link>
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
                  <span className="priority-badge priority-low">
                    <FileText size={14} /> Active
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
