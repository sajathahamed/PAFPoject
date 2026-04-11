import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './pages/Dashboard';
import AdminHome from './pages/AdminHome';
import AdminUsers from './pages/AdminUsers';
import StudentHome from './pages/StudentHome';
import TechnicianDashboard from './pages/TechnicianDashboard';
import SolvedTickets from './pages/SolvedTickets';
import LecturerHome from './pages/LecturerHome';
import Unauthorized from './pages/Unauthorized';
import ResourcesPage from './pages/ResourcesPage';
import AdminResourcesPage from './pages/AdminResourcesPage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import MyBookingsPage from './pages/MyBookingsPage';
import CreateBookingPage from './pages/CreateBookingPage';
import BookingDetailPage from './pages/BookingDetailPage';
import AdminBookingsPage from './pages/AdminBookingsPage';


function roleToPath(role) {
  switch (role) {
    case 'TECHNICIAN': return '/dashboard';
    case 'LECTURER':   return '/dashboard';
    case 'ADMIN':      return '/dashboard';
    default:           return '/dashboard';
  }
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  const defaultRoute = user ? roleToPath(user.role) : '/login';

  return (
    <div className="app">
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes - any authenticated user */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Role-based dashboard routes */}
          <Route
            path="/student/home"
            element={
              <ProtectedRoute roles="STUDENT">
                <StudentHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/home"
            element={
              <ProtectedRoute roles="ADMIN">
                <AdminHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technician/dashboard"
            element={
              <ProtectedRoute roles="TECHNICIAN">
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/home"
            element={
              <ProtectedRoute roles="LECTURER">
                <LecturerHome />
              </ProtectedRoute>
            }
          />

          {/* Admin-only routes */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles="ADMIN">
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          {/* Resource Catalogue Routes */}
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <ResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources/:id"
            element={
              <ProtectedRoute>
                <ResourceDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resources"
            element={
              <ProtectedRoute roles="ADMIN">
                <AdminResourcesPage />
              </ProtectedRoute>
            }
          />

          {/* Notifications */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute roles="ADMIN">
                <AdminBookingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings"
            element={
              <ProtectedRoute roles={['STUDENT', 'LECTURER', 'ADMIN']}>
                <Navigate to="/bookings/my" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings/my"
            element={
              <ProtectedRoute roles={['STUDENT', 'LECTURER', 'ADMIN']}>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings/new"
            element={
              <ProtectedRoute roles={['STUDENT', 'LECTURER']}>
                <CreateBookingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Student Tickets */}
          <Route
            path="/student/tickets"
            element={
              <ProtectedRoute roles="STUDENT">
                <StudentHome />
              </ProtectedRoute>
            }
          />

          {/* Lecturer Tickets */}
          <Route
            path="/lecturer/tickets"
            element={
              <ProtectedRoute roles="LECTURER">
                <StudentHome />
              </ProtectedRoute>
            }
          />

          {/* Technician Tickets */}
          <Route
            path="/technician/tickets"
            element={
              <ProtectedRoute roles="TECHNICIAN">
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />

          {/* Technician Solved Tickets */}
          <Route
            path="/technician/solved"
            element={
              <ProtectedRoute roles="TECHNICIAN">
                <SolvedTickets />
              </ProtectedRoute>
            }
          />

          {/* Work Orders */}
          <Route
            path="/work-orders"
            element={
              <ProtectedRoute roles={['ADMIN', 'TECHNICIAN']}>
                <div className="container" style={{ paddingTop: '24px' }}>
                  <h1>Work Orders</h1>
                  <p>Work orders management coming soon...</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to={defaultRoute} replace />} />

          {/* 404 - redirect to role-based dashboard */}
          <Route path="*" element={<Navigate to={defaultRoute} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
