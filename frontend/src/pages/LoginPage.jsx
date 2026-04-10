import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import '../styles/ClassicHero.css';

function roleToPath(role) {
  switch (role) {
    case 'TECHNICIAN':
      return '/dashboard';
    case 'LECTURER':
      return '/dashboard';
    case 'ADMIN':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

const LoginPage = () => {
  const { loginWithGoogle, login, user, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authLoading || busy) return;
    if (!isAuthenticated || !user) return;
    const intended = location.state?.from?.pathname;
    const dest =
      intended && intended !== '/login' && !intended.startsWith('/oauth-callback')
        ? intended
        : roleToPath(user.role);
    navigate(dest, { replace: true });
  }, [authLoading, busy, isAuthenticated, user, navigate, location.state]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      navigate(roleToPath(user.role), { replace: true });
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setBusy(true);
    try {
      const user = await loginWithGoogle(credentialResponse.credential);
      navigate(roleToPath(user.role), { replace: true });
    } catch (e) {
      setError(e.response?.data?.error || 'Google login failed.');
    } finally {
      setBusy(false);
    }
  };

  if (authLoading) {
    return (
      <div className="hero-container">
        <div className="hero-form-container">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (busy) {
    return (
      <div className="hero-container">
        <div className="hero-form-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-container">
      <div className="hero-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
      </div>

      <motion.div
        className="hero-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Left Side - Logo */}
        <div className="hero-logo-left">
          <motion.div
            className="vscode-logo-container"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg className="vscode-logo" viewBox="0 0 256 256" fill="none">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#21ada1" />
                  <stop offset="50%" stopColor="#21ada1" />
                  <stop offset="100%" stopColor="#21ada1" />
                </linearGradient>
              </defs>
              <rect x="20" y="20" width="216" height="216" rx="50" fill="url(#logoGradient)" />
              <path d="M80 120L100 100L140 140L180 100V140L140 180L100 140L80 160V120Z" fill="white" />
            </svg>
            <div className="logo-glow"></div>
          </motion.div>
        </div>

        {/* Right Side - Form */}
        <div className="hero-form-right">
          <motion.div
            className="hero-form-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="hero-title">Welcome to Smart Campus</h1>
            <p className="hero-subtitle">Live Your Future</p>

            <div className="hero-divider"></div>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed')}
              useOneTap
            />

            <div className="divider">OR</div>

            <form onSubmit={handleSubmit} className="hero-form">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="email@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button type="submit" className="btn-primary">
                Sign In
              </button>
            </form>

            <div className="text-center mb-4">
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                Don't have an account? <Link to="/register" className="btn-link">Register</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

function LoginPageWithGoogle() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <LoginPage />
    </GoogleOAuthProvider>
  );
}

export default LoginPageWithGoogle;