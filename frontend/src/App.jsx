import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './pages/Dashboard';
import AdminUsers from './pages/AdminUsers';
import Unauthorized from './pages/Unauthorized';

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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
