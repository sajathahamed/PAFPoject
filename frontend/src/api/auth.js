import api from './axios'

export async function googleCallback(idToken) {
  const res = await api.post('/auth/google/callback', { idToken })
  return res.data
}

export async function passwordLogin(email, password) {
  const res = await api.post('/auth/login', { email, password })
  return res.data
}

export async function passwordSignup(name, email, password) {
  const res = await api.post('/api/auth/register', { name, email, password })
  return res.data
}

export async function getMe() {
  const res = await api.get('/api/auth/me')
  return res.data
}
