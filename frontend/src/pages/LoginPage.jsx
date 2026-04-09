import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'

function roleToPath(role) {
  switch (role) {
    case 'TECHNICIAN': return '/technician/dashboard'
    case 'LECTURER':   return '/lecturer/home'
    case 'ADMIN':      return '/admin/resources'
    default:           return '/student/home'
  }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { loginWithGoogle, loginWithPassword, signup } = useAuth()

  const [tab, setTab] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleGoogleSuccess(credentialResponse) {
    setError('')
    setBusy(true)
    try {
      const user = await loginWithGoogle(credentialResponse.credential)
      navigate(roleToPath(user.role), { replace: true })
    } catch (e) {
      setError(e.response?.data?.error || 'Google login failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function handleGoogleError() {
    setError('Google sign-in was cancelled or failed.')
  }

  async function handleFormSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      let user
      if (tab === 'login') {
        user = await loginWithPassword(form.email.trim(), form.password)
      } else {
        if (!form.name.trim()) { setError('Name is required.'); setBusy(false); return }
        user = await signup(form.name.trim(), form.email.trim(), form.password)
      }
      navigate(roleToPath(user.role), { replace: true })
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-layout">
      {/* Left — full-height photo */}
      <div className="login-photo">
        <img
          src="https://picsum.photos/seed/campus1/900/1200"
          alt="University campus"
        />
      </div>

      {/* Right — login panel */}
      <div className="login-panel">
        <div className="login-logo">
          Smart<span>Campus</span>
        </div>
        <p className="login-tagline">Integrated campus services for SLIIT</p>

        {/* Google button */}
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          text="signin_with"
          shape="rectangular"
          theme="outline"
          width="320"
        />

        <div className="login-divider">or</div>

        {/* Username / password tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => { setTab('login'); setError('') }}
          >
            Sign In
          </button>
          <button
            className={`login-tab${tab === 'signup' ? ' active' : ''}`}
            onClick={() => { setTab('signup'); setError('') }}
          >
            Create Account
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form className="login-form" onSubmit={handleFormSubmit}>
          {tab === 'signup' && (
            <div className="form-field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required={tab === 'signup'}
                placeholder="Your full name"
              />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={tab === 'signup' ? 8 : undefined}
              placeholder={tab === 'signup' ? 'At least 8 characters' : ''}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="login-note">Only university accounts are permitted.</p>
      </div>
    </div>
  )
}
