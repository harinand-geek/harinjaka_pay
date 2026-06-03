import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '@/api/auth'
import { clearToken, getToken, setToken } from '@/api/client'
import type { AdminUser, LoginCredentials } from '@/types/auth'

interface AuthContextValue {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: AdminUser) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount, restore the session from a stored token (if any).
  useEffect(() => {
    let active = true
    const bootstrap = async () => {
      if (!getToken()) {
        setIsLoading(false)
        return
      }
      try {
        const me = await authApi.me()
        if (active) setUser(me)
      } catch {
        clearToken()
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void bootstrap()
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { token, user: u } = await authApi.login(credentials)
    setToken(token)
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      /* ignore network errors on logout */
    } finally {
      clearToken()
      setUser(null)
    }
  }, [])

  const updateUser = useCallback((u: AdminUser) => setUser(u), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [user, isLoading, login, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
