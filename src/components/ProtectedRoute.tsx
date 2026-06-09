import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

type ProtectedRouteProps = {
  children: React.ReactNode
  requireAdmin?: boolean
  requireModerator?: boolean
  requireSubscriber?: boolean
}

export function ProtectedRoute({ children, requireAdmin, requireModerator, requireSubscriber }: ProtectedRouteProps) {
  const { user, loading, isAdmin, isModerator, isSubscriber } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#ff5a3c', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  if (requireModerator && !isModerator) {
    return <Navigate to="/" replace />
  }

  if (requireSubscriber && !isSubscriber) {
    return <Navigate to="/subscribe" replace />
  }

  return <>{children}</>
}
