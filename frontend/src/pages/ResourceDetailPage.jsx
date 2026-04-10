import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getResourceById } from '../api/resource'
import DashboardSidebar from '../components/DashboardSidebar'
import { MapPin, Users, Info, ArrowLeft, Calendar, ShieldCheck } from 'lucide-react'

export default function ResourceDetailPage() {
  const { id } = useParams()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const data = await getResourceById(id)
        setResource(data)
      } catch (err) {
        setError('Resource not found')
      } finally {
        setLoading(false)
      }
    }
    fetchResource()
  }, [id])

  if (loading) return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content flex items-center justify-center">
        <div className="spinner" />
      </div>
    </div>
  )

  if (error || !resource) return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="card text-center py-20">
          <p className="alert alert-error mb-4">{error || 'Resource not found'}</p>
          <Link to="/resources" className="btn btn-primary">Back to Catalogue</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div style={{marginBottom: '24px'}}>
          <Link to="/resources" className="nav-link" style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500'}}>
            <ArrowLeft size={16} /> Back to Facilities
          </Link>
        </div>

        <div className="form-grid" style={{gridTemplateColumns: '2fr 1fr', alignItems: 'start'}}>
          <div className="flex-col" style={{gap: '32px'}}>
            <div className="card" style={{padding: '0', overflow: 'hidden', border: 'none'}}>
               <div style={{height: '192px', background: 'linear-gradient(to right, var(--primary), var(--secondary))', position: 'relative'}}>
                  <div style={{position: 'absolute', bottom: '-24px', left: '32px', background: 'white', padding: '16px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)'}}>
                     <div style={{width: '48px', height: '48px', backgroundColor: 'rgba(33, 173, 161, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'}}>
                        <Info size={24} />
                     </div>
                  </div>
               </div>
               <div style={{padding: '32px', paddingTop: '48px'}}>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h1 className="brand-name" style={{fontSize: '2.25rem', color: 'var(--secondary)', marginBottom: '8px'}}>{resource.name}</h1>
                      <div className="flex items-center" style={{gap: '16px'}}>
                        <span className="flex items-center" style={{color: 'var(--text-muted)', fontSize: '14px'}}>
                          <MapPin size={14} style={{marginRight: '4px', color: 'var(--primary)'}} /> {resource.location}
                        </span>
                        <span className={`resource-status-badge ${
                          resource.status === 'ACTIVE' ? 'status-active' : 'status-out-of-service'
                        }`}>
                          {resource.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{color: 'var(--text-main)', fontSize: '1.125rem', lineHeight: '1.75', marginBottom: '40px'}}>
                    <p>
                      This {resource.type.toLowerCase()} is situated in the {resource.location}. It features a capacity of {resource.capacity} seats, 
                      making it ideal for academic gatherings, lectures, and specialized sessions. 
                      The facility is maintained by the Campus Operations Hub to ensure full technical functionality.
                    </p>
                  </div>

                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', paddingTop: '32px', borderTop: '1px solid #f1f5f9'}}>
                    <div className="flex-col" style={{gap: '4px'}}>
                      <span style={{fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '0.05em'}}>Facility Type</span>
                      <span style={{color: 'var(--secondary)', fontWeight: '600'}}>{resource.type}</span>
                    </div>
                    <div className="flex-col" style={{gap: '4px'}}>
                      <span style={{fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '0.05em'}}>Total Seating</span>
                      <span style={{color: 'var(--secondary)', fontWeight: '600'}}>{resource.capacity} Seats</span>
                    </div>
                    <div className="flex-col" style={{gap: '4px'}}>
                      <span style={{fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '0.05em'}}>Managed By</span>
                      <span style={{color: 'var(--secondary)', fontWeight: '600'}}>Smart Campus Admin</span>
                    </div>
                  </div>
               </div>
            </div>

            <div className="card" style={{backgroundColor: 'rgba(33, 173, 161, 0.05)', borderColor: 'rgba(33, 173, 161, 0.1)', boxShadow: 'none'}}>
               <h3 style={{fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                 <ShieldCheck size={20} /> Access Requirements
               </h3>
               <ul style={{listStyle: 'none', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  <li style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <div style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)'}}></div>
                    Available for students and staff with valid IDs.
                  </li>
                  <li style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <div style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)'}}></div>
                    Advance booking required via the Student Hub.
                  </li>
               </ul>
            </div>
          </div>

          <div className="flex-col" style={{gap: '24px', position: 'sticky', top: '24px'}}>
            <div className="card" style={{backgroundColor: 'var(--secondary)', color: 'white', border: 'none', textAlign: 'center'}}>
               <div style={{width: '64px', height: '64px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'}}>
                  <Calendar size={32} />
               </div>
               <h3 className="brand-name" style={{fontSize: '1.5rem', marginBottom: '12px'}}>Ready to Book?</h3>
               <p style={{color: 'rgba(255,255,255,0.7)', marginBottom: '32px', fontSize: '14px'}}>Check availability and secure this facility for your next session.</p>
               <button className="btn btn-primary" style={{width: '100%', fontWeight: '700', padding: '12px'}}>
                 Reserve Facility
               </button>
               <p style={{marginTop: '16px', fontSize: '10px', color: 'rgba(255,255,255,0.4)'}}>Subject to terms and campus regulations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
