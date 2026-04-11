import { useState, useEffect } from 'react'

export default function ResourceForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'ROOM',
    capacity: 10,
    location: '',
    status: 'ACTIVE'
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="card resource-form-container">
      <div style={{borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px'}}>
        <h3 className="page-title" style={{fontSize: '1.5rem', marginBottom: '4px'}}>
          {initialData ? 'Update Resource' : 'Create New Resource'}
        </h3>
        <p className="page-subtitle">Fill in the detailed information about the campus facility.</p>
      </div>
      
      <div className="form-grid">
        <div style={{gridColumn: '1 / -1'}}>
          <label className="form-label">Resource Name</label>
          <input 
            type="text" name="name" value={formData.name} onChange={handleChange} required
            placeholder="e.g., Grand Auditorium"
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Facility Type</label>
          <select name="type" value={formData.type} onChange={handleChange} className="form-select">
            <option value="ROOM">Room</option>
            <option value="LAB">Lab</option>
            <option value="HALL">Hall</option>
          </select>
        </div>

        <div>
          <label className="form-label">Capacity (Seats)</label>
          <input 
            type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="1" required
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Location / Building</label>
          <input 
            type="text" name="location" value={formData.location} onChange={handleChange} required
            placeholder="e.g., Engineering Block A"
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Operational Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className="form-select">
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </div>
      </div>

      <div className="flex" style={{gap: '16px', justifyContent: 'flex-end', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9'}}>
        <button type="button" onClick={onCancel} className="btn" style={{backgroundColor: '#f1f5f9', color: '#64748b'}}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary px-8">
          {initialData ? 'Save Changes' : 'Create Resource'}
        </button>
      </div>
    </form>
  )
}
