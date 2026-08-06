import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Loading from '@/components/common/loading/Loading'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

/**
 * Protected Route Component
 * Guards routes that require authentication
 */
export default function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/404" replace />
  }

  return <>{children}</>
}
