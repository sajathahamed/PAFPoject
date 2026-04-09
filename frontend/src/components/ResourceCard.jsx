import { Link } from 'react-router-dom'

export default function ResourceCard({ resource, isAdmin, onDelete, onStatusChange }) {
  return (
    <div className="border p-4 rounded-md shadow-sm bg-white hover:shadow-md transition">
      <h3 className="text-xl font-semibold mb-2">{resource.name}</h3>
      <p className="text-sm text-gray-600 mb-1">Type: <span className="font-medium">{resource.type}</span></p>
      <p className="text-sm text-gray-600 mb-1">Capacity: <span className="font-medium">{resource.capacity}</span></p>
      <p className="text-sm text-gray-600 mb-2">Location: <span className="font-medium">{resource.location}</span></p>
      
      <div className="mb-4">
        <span className={`text-xs px-2 py-1 rounded ${resource.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {resource.status}
        </span>
      </div>

      <div className="flex justify-between items-center mt-4 border-t pt-4">
        <Link to={`/resources/${resource.id}`} className="text-blue-600 hover:underline text-sm">
          View Details
        </Link>
        
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => onStatusChange(resource.id, resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE')}
              className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
            >
              Toggle Status
            </button>
            <button
              onClick={() => onDelete(resource.id)}
              className="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
