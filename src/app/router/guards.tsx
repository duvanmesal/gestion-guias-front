import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import type { Rol } from "@/core/models/auth";
import { useAuth } from "@/hooks/use-auth";

/* =========================================================
 * PROTECTED ROUTE
 * ========================================================= */

interface ProtectedRouteProps {
  children: ReactNode;
  requireEmailVerification?: boolean;
}

export function ProtectedRoute({
  children,
  requireEmailVerification = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // 1️⃣ Esperar a que el estado de auth sea confiable
  if (isLoading) {
    return null; // o un spinner global si prefieres
  }

  // 2️⃣ No autenticado → login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3️⃣ Email requerido y NO verificado → verify-needed
  if (requireEmailVerification && !user?.emailVerifiedAt) {
    return <Navigate to="/verify-needed" replace />;
  }

  // 4️⃣ Acceso permitido
  return <>{children}</>;
}

/* =========================================================
 * REQUIRE ROLES
 * ========================================================= */

interface RequireRolesProps {
  children: ReactNode;
  allowedRoles: Rol[];
}

export function RequireRoles({
  children,
  allowedRoles,
}: RequireRolesProps) {
  const { user, isLoading } = useAuth();

  // Esperar identidad
  if (isLoading) {
    return null;
  }

  // Sin usuario o rol no permitido
  if (!user || !allowedRoles.includes(user.rol)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass p-8 max-w-md text-center">
          <h2 className="text-2xl font-semibold text-[rgb(var(--color-fg))] mb-2">
            Acceso Denegado
          </h2>
          <p className="text-[rgb(var(--color-fg)/0.8)]">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/* =========================================================
 * GUEST ROUTE
 * ========================================================= */

interface GuestRouteProps {
  children: ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Esperar a que auth esté listo
  if (isLoading) {
    return null;
  }

  // Si ya está autenticado → dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
