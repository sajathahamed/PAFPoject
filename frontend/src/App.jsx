import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './pages/Dashboard';
import AdminHome from './pages/AdminHome';
import AdminUsers from './pages/AdminUsers';
import StudentHome from './pages/StudentHome';
import TechnicianDashboard from './pages/TechnicianDashboard';
import LecturerHome from './pages/LecturerHome';
import Unauthorized from './pages/Unauthorized';

function roleToPath(role) {
  switch (role) {
    case 'TECHNICIAN': return '/technician/dashboard';
    case 'LECTURER':   return '/lecturer/home';
    case 'ADMIN':    return '/admin/home';
    default:       return '/student/home';
  }
}

/**
 * Main App component with routing configuration.
 * 
 * Route structure:
 * - Public routes: /login, /oauth-callback
 * - Protected routes (any authenticated user): /dashboard
 * - Admin-only routes: /admin/users
 * - Fallback: redirect to dashboard
 */
function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  const defaultRoute = user ? roleToPath(user.role) : '/login';

  return (
    <div className="app">
      {/* Navigation - only shows when authenticated */}
      <Navbar />

      {/* Main content area */}
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

          {/* Technician routes (placeholder) */}
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
