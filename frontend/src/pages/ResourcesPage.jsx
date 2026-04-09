import { useState, useEffect } from 'react'
import { getResources } from '../api/resource'
import ResourceCard from '../components/ResourceCard'

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
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Resource Catalogue</h1>

      <form onSubmit={handleSearch} className="mb-8 flex flex-wrap gap-4 items-end bg-gray-50 p-4 rounded-md border">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select name="type" value={filters.type} onChange={handleFilterChange} className="border px-3 py-2 rounded">
            <option value="">All Types</option>
            <option value="ROOM">Room</option>
            <option value="LAB">Lab</option>
            <option value="HALL">Hall</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Min Capacity</label>
          <input type="number" name="minCapacity" value={filters.minCapacity} onChange={handleFilterChange} className="border px-3 py-2 rounded w-32" placeholder="e.g. 10" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input type="text" name="location" value={filters.location} onChange={handleFilterChange} className="border px-3 py-2 rounded" placeholder="Search location..." />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 h-[42px]">
          Filter / Search
        </button>
      </form>

      {loading ? (
        <p>Loading resources...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : resources.length === 0 ? (
        <p>No resources found matching the criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(res => (
            <ResourceCard key={res.id} resource={res} isAdmin={false} />
          ))}
        </div>
      )}
    </div>
  )
}
