import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { homeFor, useAuth } from '../context/AuthContext'
import { Loading } from './Status'

/** Only lets in logged-in users with one of the given roles. */
export default function ProtectedRoute({ roles }) {
  const { user, checking } = useAuth()
  const location = useLocation()

  if (checking) return <Loading text="Checking your session…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />
  return <Outlet />
}
