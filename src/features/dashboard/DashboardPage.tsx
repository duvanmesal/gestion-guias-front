"use client"

import { useQuery } from "@tanstack/react-query"
import { AppShell } from "@/shared/components/layout/AppShell"
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/shared/components/glass/GlassCard"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { healthApi } from "@/core/api"
import { usersApi } from "@/core/api"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import {
  Activity,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  User,
  MapPin,
  Ship,
  UserPlus,
} from "lucide-react"
import { Link } from "react-router-dom"

export function DashboardPage() {
  const { user } = useAuthStore()

  const { data: healthData, isLoading: isLoadingHealth } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await healthApi.check()
      return response.data
    },
    refetchInterval: 30000,
  })

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", { activo: true, pageSize: 1 }],
    queryFn: async () => {
      const response = await usersApi.getUsers({ activo: true, pageSize: 1 })
      return response
    },
    enabled: user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR,
  })

  const canViewUsers = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR

  const quickLinks = [
    {
      to: "/profile",
      icon: User,
      label: "Mi Perfil",
      description: "Ver y editar tu perfil",
      roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR, Rol.GUIA],
    },
    {
      to: "/users",
      icon: Users,
      label: "Usuarios",
      description: "Gestionar usuarios",
      roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR],
    },
    {
      to: "/catalog/paises",
      icon: MapPin,
      label: "Paises",
      description: "Catalogo de paises",
      roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR],
    },
    {
      to: "/catalog/buques",
      icon: Ship,
      label: "Buques",
      description: "Catalogo de buques",
      roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR],
    },
    {
      to: "/invitations",
      icon: UserPlus,
      label: "Invitaciones",
      description: "Enviar invitaciones",
      roles: [Rol.SUPER_ADMIN],
    },
  ].filter((link) => user && link.roles.includes(user.rol))

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-[rgb(var(--color-fg))] mb-1">
            Bienvenido, {user?.nombres || user?.email?.split("@")[0]}
          </h1>
          <p className="text-[rgb(var(--color-muted))]">
            Panel de control del sistema de gestion de guias turisticos
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* System Status */}
          <GlassCard
            hover
            className="animate-fade-in-up"
            style={{ animationDelay: "0.05s" }}
          >
            <GlassCardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-primary)/0.15)] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                </div>
                <GlassCardTitle>Estado del Sistema</GlassCardTitle>
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              {isLoadingHealth ? (
                <Skeleton height="2rem" />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {healthData?.status === "ok" ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-[rgb(var(--color-success))]" />
                        <span className="text-lg font-bold text-[rgb(var(--color-success))]">
                          Operativo
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-[rgb(var(--color-danger))]" />
                        <span className="text-lg font-bold text-[rgb(var(--color-danger))]">
                          Con problemas
                        </span>
                      </>
                    )}
                  </div>
                  {healthData?.db && (
                    <p className="text-sm text-[rgb(var(--color-muted))]">
                      Base de datos: {healthData.db}
                    </p>
                  )}
                </div>
              )}
            </GlassCardContent>
          </GlassCard>

          {/* Active Users */}
          {canViewUsers && (
            <GlassCard
              hover
              className="animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <GlassCardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-accent)/0.15)] flex items-center justify-center">
                    <Users className="w-5 h-5 text-[rgb(var(--color-accent))]" />
                  </div>
                  <GlassCardTitle>Usuarios Activos</GlassCardTitle>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                {isLoadingUsers ? (
                  <Skeleton height="2rem" />
                ) : (
                  <div>
                    <span className="text-4xl font-bold text-[rgb(var(--color-fg))]">
                      {usersData?.meta?.total || 0}
                    </span>
                    <p className="text-sm text-[rgb(var(--color-muted))] mt-1">
                      Total de usuarios activos
                    </p>
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          )}

          {/* User Info */}
          <GlassCard
            hover
            className="animate-fade-in-up"
            style={{ animationDelay: "0.15s" }}
          >
            <GlassCardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-primary)/0.15)] flex items-center justify-center">
                  <User className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                </div>
                <GlassCardTitle>Mi Informacion</GlassCardTitle>
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[rgb(var(--color-muted))] uppercase tracking-wider mb-0.5">
                    Email
                  </p>
                  <p className="text-sm font-medium text-[rgb(var(--color-fg))]">
                    {user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--color-muted))] uppercase tracking-wider mb-0.5">
                    Rol
                  </p>
                  <span className="inline-block text-xs px-2.5 py-1 rounded-lg bg-[rgb(var(--color-accent)/0.15)] text-[rgb(var(--color-accent))] font-semibold">
                    {user?.rol}
                  </span>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Quick Links */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <GlassCardHeader>
            <GlassCardTitle>Accesos Rapidos</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {quickLinks.map((link, index) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="glass-subtle p-4 rounded-xl hover:bg-[rgb(var(--color-glass-hover)/0.5)] transition-all duration-200 focus-ring group animate-fade-in-up"
                  style={{ animationDelay: `${0.25 + index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[rgb(var(--color-primary)/0.1)] flex items-center justify-center group-hover:bg-[rgb(var(--color-primary)/0.2)] transition-colors">
                      <link.icon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-[rgb(var(--color-muted))] group-hover:text-[rgb(var(--color-primary))] group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="font-semibold text-[rgb(var(--color-fg))] text-sm">
                    {link.label}
                  </p>
                  <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">
                    {link.description}
                  </p>
                </Link>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </AppShell>
  )
}
