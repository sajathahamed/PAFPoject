import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sc_jwt')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
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
