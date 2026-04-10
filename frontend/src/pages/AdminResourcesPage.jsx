import { useState, useEffect } from 'react'
import { getResources, createResource, updateResource, deleteResource, updateResourceStatus } from '../api/resource'
import ResourceForm from '../components/ResourceForm'
import ResourceCard from '../components/ResourceCard'
import DashboardSidebar from '../components/DashboardSidebar'
import { Plus, Layout, Pencil } from 'lucide-react'

export default function AdminResourcesPage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingResource, setEditingResource] = useState(null)

  const fetchResources = async () => {
    try {
      setLoading(true)
      const data = await getResources()
      setResources(data)
    } catch (err) {
      setError('Failed to fetch resources')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [])

  const handleSubmit = async (formData) => {
    try {
      if (editingResource) {
        await updateResource(editingResource.id, formData)
      } else {
        await createResource(formData)
      }
      setShowForm(false)
      setEditingResource(null)
      fetchResources()
    } catch (err) {
      alert('Failed to save resource')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(id)
        fetchResources()
      } catch (err) {
        alert('Failed to delete resource')
      }
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateResourceStatus(id, newStatus)
      fetchResources()
    } catch (err) {
      alert('Failed to update status')
    }
  }

  const handleEdit = (resource) => {
    setEditingResource(resource)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header flex justify-between items-center mb-8">
          <div>
            <h1 className="page-title">Resource Management</h1>
            <p className="page-subtitle">Administrative panel to create, update, and manage campus facilities.</p>
          </div>
          <div className="header-actions">
             {!showForm && (
               <button 
                 onClick={() => setShowForm(true)} 
                 className="btn btn-primary px-6"
               >
                 <Plus size={18} /> New Resource
               </button>
             )}
             <div className="action-btn" style={{backgroundColor: 'white'}}>
                <Layout size={18} />
             </div>
          </div>
        </div>

        {showForm && (
          <div className="resource-form-container mb-8">
            <ResourceForm 
              initialData={editingResource} 
              onSubmit={handleSubmit} 
              onCancel={() => { setShowForm(false); setEditingResource(null); }} 
            />
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center">
            <div className="spinner mb-8" />
            <p className="page-subtitle">Loading inventory...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">
             <p className="font-bold">System Error</p>
             <p>{error}</p>
          </div>
        ) : (
          <div className="resource-grid">
            {resources.map(res => (
              <ResourceCard 
                key={res.id}
                resource={res} 
                isAdmin={true} 
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


