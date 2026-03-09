import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * OAuth2 callback handler page.
 * 
 * This page is shown after Google OAuth2 redirect.
 * It checks authentication status and redirects to dashboard.
 */
const OAuthCallback = () => {
  const { checkAuth, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Re-check authentication status after OAuth redirect
        await checkAuth();
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [checkAuth]);

  // Redirect to dashboard once authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else if (!loading && !isAuthenticated && error) {
      // If auth check completed and user is not authenticated, redirect to login
      navigate('/login', { replace: true });
    }
  }, [loading, isAuthenticated, error, navigate]);

  // Show error if authentication failed
  if (error) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="alert alert-error">
            {error}
          </div>
          <button 
            onClick={() => navigate('/login')} 
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="spinner"></div>
        <p className="text-center mt-2">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
