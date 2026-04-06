import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  // Read from localStorage directly — React state may not have committed yet
  // when navigate() is called immediately after login.
  const { jwt } = useAuth()
  const token = jwt || localStorage.getItem('sc_jwt')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}
