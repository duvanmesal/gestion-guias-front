import { createBrowserRouter, Navigate } from "react-router-dom"
import { LoginPage } from "@/features/auth/LoginPage"
import { DashboardPage } from "@/features/dashboard/DashboardPage"
import { UsersListPage } from "@/features/users/UsersListPage"
import { ProfilePage } from "@/features/profile/ProfilePage"
import { InvitationsPage } from "@/features/invitations/InvitationsPage"
import { ProtectedRoute, RequireRoles } from "./guards"
import { Rol } from "@/core/models/auth"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute>
        <RequireRoles allowedRoles={[Rol.SUPER_ADMIN, Rol.SUPERVISOR]}>
          <UsersListPage />
        </RequireRoles>
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/invitations",
    element: (
      <ProtectedRoute>
        <RequireRoles allowedRoles={[Rol.SUPER_ADMIN]}>
          <InvitationsPage />
        </RequireRoles>
      </ProtectedRoute>
    ),
  },
])
