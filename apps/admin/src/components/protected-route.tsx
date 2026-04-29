import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { isLoggedIn } from "../admin/auth"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation()
  if (!isLoggedIn()) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <>{children}</>
}

