import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/app/stores/auth-store"
import type { Rol } from "@/core/models/auth"
import type { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

interface RequireRolesProps {
  children: ReactNode
  allowedRoles: Rol[]
}

export function RequireRoles({ children, allowedRoles }: RequireRolesProps) {
  const { user } = useAuthStore()

  if (!user || !allowedRoles.includes(user.rol)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass p-8 max-w-md text-center">
          <h2 className="text-2xl font-semibold text-[rgb(var(--color-fg))] mb-2">Acceso Denegado</h2>
          <p className="text-[rgb(var(--color-fg)/0.8)]">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
