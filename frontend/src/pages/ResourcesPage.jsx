import { useState, useEffect } from 'react'
import { getResources } from '../api/resource'
import ResourceCard from '../components/ResourceCard'
import DashboardSidebar from '../components/DashboardSidebar'
import { Search, Filter, Layers } from 'lucide-react'

export default function ResourcesPage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState({
    type: '',
    minCapacity: '',
    location: ''
  })

  const fetchResources = async () => {
    try {
      setLoading(true)
      const data = await getResources(filters)
      setResources(data)
    } catch (err) {
      setError('Failed to fetch resources')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [])

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchResources()
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header flex justify-between items-center mb-8">
          <div>
            <h1 className="page-title">Facilities Catalogue</h1>
            <p className="page-subtitle">Explore and discover available campus resources and halls.</p>
          </div>
          <div className="header-actions">
             <button className="btn btn-primary px-6">
                <Layers size={16} /> All Facilities
             </button>
          </div>
        </div>

        <div className="card mb-8" style={{border: 'none', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)'}}>
          <form onSubmit={handleSearch} className="form-grid">
            <div className="form-group">
              <label className="form-label" style={{fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--text-muted)'}}>
                <Filter size={12} style={{marginRight: '4px'}} /> Resource Type
              </label>
              <select name="type" value={filters.type} onChange={handleFilterChange} className="form-select">
                <option value="">All Types</option>
                <option value="ROOM">Room</option>
                <option value="LAB">Lab</option>
                <option value="HALL">Hall</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--text-muted)'}}>Min Capacity</label>
              <input type="number" name="minCapacity" value={filters.minCapacity} onChange={handleFilterChange} className="form-input" placeholder="e.g. 50" />
            </div>
            <div className="form-group" style={{gridColumn: 'span 1'}}>
              <label className="form-label" style={{fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--text-muted)'}}>Location / Block</label>
              <input type="text" name="location" value={filters.location} onChange={handleFilterChange} className="form-input" placeholder="Search location..." />
            </div>
            <div className="form-group">
              <button type="submit" className="btn btn-primary" style={{width: '100%', height: '42px', marginTop: 'auto'}}>
                <Search size={18} /> Apply filters
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center">
            <div className="spinner mb-8" />
            <p className="page-subtitle">Scanning campus resources...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">
             <p className="font-bold mb-2">Error Connection</p>
             <p>{error}</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="card text-center py-20" style={{background: '#f8fafc', borderStyle: 'dashed'}}>
            <p className="page-subtitle italic">No resources found matching your criteria. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="resource-grid">
            {resources.map(res => (
              <ResourceCard key={res.id} resource={res} isAdmin={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
