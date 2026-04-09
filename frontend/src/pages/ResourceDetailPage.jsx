import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getResourceById } from '../api/resource'

export default function ResourceDetailPage() {
  const { id } = useParams()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true)
        const data = await getResourceById(id)
        setResource(data)
      } catch (err) {
        setError('Failed to fetch resource details')
      } finally {
        setLoading(false)
      }
    }
    fetchResource()
  }, [id])

  if (loading) return <div className="p-8">Loading details...</div>
  if (error) return <div className="p-8 text-red-500">{error}</div>
  if (!resource) return <div className="p-8">Resource not found</div>

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="bg-white p-8 border rounded-lg shadow">
        <Link to="/resources" className="text-blue-600 hover:underline mb-6 inline-block">
          &larr; Back to Resources
        </Link>
        <h1 className="text-3xl font-bold mb-4">{resource.name}</h1>
        <div className="space-y-4">
          <p className="text-lg"><strong>Type:</strong> {resource.type}</p>
          <p className="text-lg"><strong>Capacity:</strong> {resource.capacity} people</p>
          <p className="text-lg"><strong>Location:</strong> {resource.location}</p>
          <p className="text-lg">
            <strong>Status:</strong>{' '}
            <span className={`px-3 py-1 rounded inline-block mt-2 ${resource.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {resource.status}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
