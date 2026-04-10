import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import '../styles/ClassicHero.css';

function getApiErrorMessage(err) {
  const d = err?.response?.data;
  if (d == null) return err?.message || 'Something went wrong.';
  if (typeof d === 'string') return d;
  return d.error || d.message || 'Something went wrong.';
}

function roleToPath(role) {
  switch (role) {
    case 'TECHNICIAN':
      return '/technician/dashboard';
    case 'LECTURER':
      return '/lecturer/home';
    case 'ADMIN':
      return '/admin/home';
    default:
      return '/student/home';
  }
}

const LoginPage = () => {
  const { loginWithGoogle, login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(roleToPath(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const loggedIn = await login(form.email, form.password);
      setSuccess('Signed in successfully. Redirecting…');
      setBusy(false);
      setTimeout(() => {
        navigate(roleToPath(loggedIn.role), { replace: true });
      }, 600);
    } catch (e) {
      setError(getApiErrorMessage(e));
      setBusy(false);
    }
  };

  /** Uses Spring Security OAuth2 redirect — no browser GSI client or “authorized origins” needed for this flow. */
  const handleGoogleClick = () => {
    setError('');
    setSuccess('');
    loginWithGoogle();
  };

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

            <button type="button" className="btn-google" onClick={handleGoogleClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

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

              {success && <div className="alert alert-success">{success}</div>}
              {error && <div className="alert alert-error">{error}</div>}

              <button type="submit" className="btn-primary">
                Sign In
              </button>
            </form>

            <div className="text-center mb-4">
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                Don&apos;t have an account?{' '}
                Conatct your admin.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
