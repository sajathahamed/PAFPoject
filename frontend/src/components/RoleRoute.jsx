import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from './ProtectedRoute'

export default function RoleRoute({ role, children }) {
  const { user } = useAuth()

  // Fallback to localStorage in case React state hasn't committed yet
  // (race condition when navigate() is called immediately after login)
  const resolvedUser = user || (() => {
    try { return JSON.parse(localStorage.getItem('sc_user')) } catch { return null }
  })()

  return (
    <ProtectedRoute>
      {resolvedUser?.role === role
        ? children
        : <Navigate to="/unauthorized" replace />}
    </ProtectedRoute>
  )
}
