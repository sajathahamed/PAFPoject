import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import RoleRoute from './components/RoleRoute'

import LoginPage            from './pages/LoginPage'
import StudentHome          from './pages/StudentHome'
import LecturerHome         from './pages/LecturerHome'
import TechnicianDashboard  from './pages/TechnicianDashboard'
import AdminHome            from './pages/AdminHome'
import Unauthorized         from './pages/Unauthorized'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route
              path="/student/home"
              element={<RoleRoute role="STUDENT"><StudentHome /></RoleRoute>}
            />
            <Route
              path="/lecturer/home"
              element={<RoleRoute role="LECTURER"><LecturerHome /></RoleRoute>}
            />
            <Route
              path="/technician/dashboard"
              element={<RoleRoute role="TECHNICIAN"><TechnicianDashboard /></RoleRoute>}
            />
            <Route
              path="/admin/home"
              element={<RoleRoute role="ADMIN"><AdminHome /></RoleRoute>}
            />

            {/* Catch-all → login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
