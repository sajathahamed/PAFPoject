import { useState, useEffect } from 'react'
import { getResources, createResource, updateResource, deleteResource, updateResourceStatus } from '../api/resource'
import ResourceForm from '../components/ResourceForm'
import ResourceCard from '../components/ResourceCard'

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
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Manage Resources (Admin)</h1>
      
      {!showForm && (
        <button 
          onClick={() => setShowForm(true)} 
          className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-block"
        >
          + Add New Resource
        </button>
      )}

      {showForm && (
        <div className="mb-8">
          <ResourceForm 
            initialData={editingResource} 
            onSubmit={handleSubmit} 
            onCancel={() => { setShowForm(false); setEditingResource(null); }} 
          />
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(res => (
            <div key={res.id} className="relative group">
               <ResourceCard 
                 resource={res} 
                 isAdmin={true} 
                 onDelete={handleDelete}
                 onStatusChange={handleStatusChange}
               />
               <button 
                  onClick={() => handleEdit(res)}
                  className="absolute top-2 right-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded hover:bg-yellow-200"
               >
                 Edit
               </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
