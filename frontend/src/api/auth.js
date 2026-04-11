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
  const res = await api.post('/auth/signup', { name, email, password })
  return res.data
}

export async function getMe() {
  const res = await api.get('/api/users/me')
  return res.data
}
