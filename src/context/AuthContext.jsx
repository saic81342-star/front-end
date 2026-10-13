import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getToken, setToken } from '../api/client'
import { authApi } from '../api/services'

const AuthContext = createContext(null)

/** Keeps the logged-in user. The token lives in localStorage so a refresh keeps you logged in. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(() => Boolean(getToken()))

  // Restore the session on page load.
  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    authApi
      .me()
      .then((me) => !cancelled && setUser(me))
      .catch(() => {
        if (!cancelled) {
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => !cancelled && setChecking(false))
    return () => {
      cancelled = true
    }
  }, [])

  // The API client fires this when the server answers 401.
  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('jobportal:logout', onLogout)
    return () => window.removeEventListener('jobportal:logout', onLogout)
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password)
    setToken(res.token)
    setUser(res.user)
    return res.user
  }, [])

  const register = useCallback(async (form) => {
    const res = await authApi.register(form)
    setToken(res.token)
    setUser(res.user)
    return res.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // already logged out on the server
    }
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((changes) => setUser((u) => (u ? { ...u, ...changes } : u)), [])

  const value = useMemo(
    () => ({ user, checking, login, register, logout, updateUser }),
    [user, checking, login, register, logout, updateUser],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}

/** Where each role lands after logging in. */
// eslint-disable-next-line react/only-export-components
export function homeFor(role) {
  if (role === 'EMPLOYER') return '/employer'
  if (role === 'ADMIN') return '/admin'
  return '/seeker'
}
