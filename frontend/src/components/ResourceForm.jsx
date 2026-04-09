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
    <form onSubmit={handleSubmit} className="border p-4 rounded-md bg-gray-50 flex flex-col gap-4 max-w-lg">
      <h3 className="font-bold text-lg mb-2">{initialData ? 'Update Resource' : 'Create New Resource'}</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input 
          type="text" name="name" value={formData.name} onChange={handleChange} required
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select name="type" value={formData.type} onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="ROOM">Room</option>
          <option value="LAB">Lab</option>
          <option value="HALL">Hall</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Capacity</label>
        <input 
          type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="1" required
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input 
          type="text" name="location" value={formData.location} onChange={handleChange} required
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select name="status" value={formData.status} onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="ACTIVE">Active</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
        </select>
      </div>

      <div className="flex gap-2 justify-end mt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded hover:bg-gray-100">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}
