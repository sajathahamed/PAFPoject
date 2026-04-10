import { createContext, useContext, useState, useCallback } from 'react'
import { googleCallback, passwordLogin, passwordSignup } from '../api/auth'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const s = localStorage.getItem('sc_user')
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [jwt, setJwt]   = useState(() => localStorage.getItem('sc_jwt') || null)

  const _persist = useCallback((token, userData) => {
    // Write localStorage synchronously FIRST so route guards can read it
    // immediately when navigate() triggers a re-render before setState commits.
    localStorage.setItem('sc_jwt', token)
    localStorage.setItem('sc_user', JSON.stringify(userData))
    setJwt(token)
    setUser(userData)
  }, [])

  const loginWithGoogle = useCallback(async (credential) => {
    const data = await googleCallback(credential)
    _persist(data.jwt, data.user)
    return data.user
  }, [_persist])

  const loginWithPassword = useCallback(async (email, password) => {
    const data = await passwordLogin(email, password)
    _persist(data.jwt, data.user)
    return data.user
  }, [_persist])

  const signup = useCallback(async (name, email, password) => {
    const data = await passwordSignup(name, email, password)
    _persist(data.jwt, data.user)
    return data.user
  }, [_persist])

  const logout = useCallback(() => {
    localStorage.removeItem('sc_jwt')
    localStorage.removeItem('sc_user')
    setJwt(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, jwt, loginWithGoogle, loginWithPassword, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
