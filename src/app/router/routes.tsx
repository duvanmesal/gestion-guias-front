import { createBrowserRouter, Navigate } from "react-router-dom"

import { LoginPage } from "@/features/auth/LoginPage"
import { ForgotPasswordPage } from "@/features/auth/ForgotPasswordPage"
import { ResetPasswordPage } from "@/features/auth/ResetPasswordPage"
import { VerifyEmailPage } from "@/features/auth/VerifyEmailPage"
import { VerifyNeededPage } from "@/features/auth/VerifyNeededPage"
import { DashboardPage } from "@/features/dashboard/DashboardPage"
import { UsersListPage } from "@/features/users/UsersListPage"
import { ProfilePage } from "@/features/profile/ProfilePage"
import { InvitationsPage } from "@/features/invitations/InvitationsPage"

import { PaisesPage } from "@/features/catalog/paises/PaisesPage"
import { BuquesPage } from "@/features/catalog/buques/BuquesPage"

import { RecaladasPage } from "@/features/recaladas/RecaladasPage"
import { RecaladaDetailPage } from "@/features/recaladas/RecaladaDetailPage"
import { AtencionDetailPage } from "@/features/atenciones/AtencionDetailPage"
import { TurnosPage } from "@/features/turnos/TurnosPage"

import { ProtectedRoute, RequireRoles, GuestRoute } from "./guards"
import { Rol } from "@/core/models/auth"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },

  /* =======================
     🔓 PUBLIC AUTH ROUTES
     ======================= */
  {
    path: "/login",
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <GuestRoute>
        <ForgotPasswordPage />
      </GuestRoute>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <GuestRoute>
        <ResetPasswordPage />
      </GuestRoute>
    ),
  },
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },

  /* =======================
     🔐 VERIFICATION GATE
     ======================= */
  {
    path: "/verify-needed",
    element: (
      <ProtectedRoute requireEmailVerification={false}>
        <VerifyNeededPage />
      </ProtectedRoute>
    ),
  },

  /* =======================
     🏠 PROTECTED ROUTES
     ======================= */
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
        <RequireRoles allowedRoles={[Rol.SUPER_ADMIN]}>
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

  /* =======================
     📦 CATÁLOGOS
     ======================= */
  {
    path: "/catalog/paises",
    element: (
      <ProtectedRoute>
        <RequireRoles allowedRoles={[Rol.SUPER_ADMIN, Rol.SUPERVISOR]}>
          <PaisesPage />
        </RequireRoles>
      </ProtectedRoute>
    ),
  },
  {
    path: "/catalog/buques",
    element: (
      <ProtectedRoute>
        <RequireRoles allowedRoles={[Rol.SUPER_ADMIN, Rol.SUPERVISOR]}>
          <BuquesPage />
        </RequireRoles>
      </ProtectedRoute>
    ),
  },

  /* =======================
     🛳️ RECALADAS / ATENCIONES
     ======================= */
  {
    path: "/recaladas",
    element: (
      <ProtectedRoute>
        <RecaladasPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recaladas/:id",
    element: (
      <ProtectedRoute>
        <RecaladaDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/atenciones/:id",
    element: (
      <ProtectedRoute>
        <AtencionDetailPage />
      </ProtectedRoute>
    ),
  },

  /* =======================
     ⏰ TURNOS
     ======================= */
  {
    path: "/turnos",
    element: (
      <ProtectedRoute>
        <TurnosPage />
      </ProtectedRoute>
    ),
  },

  /* =======================
     🚫 FALLBACK
     ======================= */
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
])
