import { createContext, ReactNode, useEffect, useState } from 'react'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<void>
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Auth Context Provider
 * Manages authentication state globally
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const userData = localStorage.getItem('user')

        if (token && userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Mock login - replace with actual API call
      const mockUser: User = {
        id: '1',
        email,
        name: 'Admin User',
        role: 'ADMIN',
        is_active: true,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Store tokens and user data
      localStorage.setItem('access_token', 'mock_access_token_' + Date.now())
      localStorage.setItem('refresh_token', 'mock_refresh_token_' + Date.now())
      localStorage.setItem('user', JSON.stringify(mockUser))

      setUser(mockUser)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      // Mock register - replace with actual API call
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role: 'CITIZEN',
        is_active: true,
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      localStorage.setItem('access_token', 'mock_access_token_' + Date.now())
      localStorage.setItem('refresh_token', 'mock_refresh_token_' + Date.now())
      localStorage.setItem('user', JSON.stringify(mockUser))

      setUser(mockUser)
    } catch (error) {
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
