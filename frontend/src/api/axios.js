import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT and user ID on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sc_jwt')
  const user = JSON.parse(localStorage.getItem('sc_user') || '{}')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (user.id) {
    config.headers['X-User-Id'] = user.id
  }
  return config
})

// If the server responds 401, clear local session and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sc_jwt')
      localStorage.removeItem('sc_user')
      window.location.replace('/login')
    }
    return Promise.reject(err)
  }
)

export default api
