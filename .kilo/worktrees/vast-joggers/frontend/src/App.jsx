import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import RoleRoute from './components/RoleRoute'

import LoginPage            from './pages/LoginPage'
import StudentHome          from './pages/StudentHome'
import LecturerHome         from './pages/LecturerHome'
import TechnicianDashboard  from './pages/TechnicianDashboard'
import AdminHome            from './pages/AdminHome'
import ProfilePage          from './pages/ProfilePage'
import Unauthorized         from './pages/Unauthorized'
import MyBookingsPage       from './pages/MyBookingsPage'
import CreateBookingPage    from './pages/CreateBookingPage'
import BookingDetailPage    from './pages/BookingDetailPage'

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

            <Route
              path="/profile"
              element={<RoleRoute role={['STUDENT', 'LECTURER', 'TECHNICIAN', 'ADMIN']}><ProfilePage /></RoleRoute>}
            />

            <Route
              path="/bookings"
              element={<RoleRoute role={['STUDENT', 'LECTURER', 'TECHNICIAN', 'ADMIN']}><MyBookingsPage /></RoleRoute>}
            />
            <Route
              path="/bookings/create"
              element={<RoleRoute role={['STUDENT', 'LECTURER', 'TECHNICIAN', 'ADMIN']}><CreateBookingPage /></RoleRoute>}
            />
            <Route
              path="/bookings/:id"
              element={<RoleRoute role={['STUDENT', 'LECTURER', 'TECHNICIAN', 'ADMIN']}><BookingDetailPage /></RoleRoute>}
            />

            {/* Catch-all → login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
