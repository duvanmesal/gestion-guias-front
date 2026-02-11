"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
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
  CalendarClock,
} from "lucide-react"

import { AppShell } from "@/shared/components/layout/AppShell"
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { Skeleton } from "@/shared/components/feedback/Skeleton"

import { healthApi, usersApi } from "@/core/api"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"

// ✅ ya existe en tu proyecto según lo que dijiste
import { useAtenciones } from "@/hooks/use-atenciones"

function startOfTodayISO() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function endOfTodayISO() {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

function formatRange(fechaInicio: string, fechaFin: string) {
  const start = new Date(fechaInicio)
  const end = new Date(fechaFin)

  const timeFmt: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" }
  const dateFmt: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" }

  const date = start.toLocaleDateString("es-CO", dateFmt)
  const t1 = start.toLocaleTimeString("es-CO", timeFmt)
  const t2 = end.toLocaleTimeString("es-CO", timeFmt)

  return `${date} · ${t1} - ${t2}`
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Health
  const { data: healthData, isLoading: isLoadingHealth } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await healthApi.check()
      return response.data
    },
    refetchInterval: 30000,
  })

  // Users (solo admin/supervisor)
  const canViewUsers = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", { activo: true, pageSize: 1 }],
    queryFn: async () => {
      const response = await usersApi.searchUsers({ activo: true, pageSize: 1 })
      return response
    },
    enabled: canViewUsers,
  })

  // ✅ Atenciones de hoy (usa el módulo existente)
  const {
    atenciones,
    isLoading: isLoadingAtenciones,
  } = useAtenciones({
    from: startOfTodayISO(),
    to: endOfTodayISO(),
    page: 1,
    pageSize: 6,
  })

  const orderedAtenciones = useMemo(() => {
    return [...(atenciones ?? [])].sort(
      (a: any, b: any) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
    )
  }, [atenciones])

  const openCount = useMemo(() => {
    return orderedAtenciones.filter((a: any) => a.operationalStatus === "OPEN").length
  }, [orderedAtenciones])

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
      label: "Países",
      description: "Catálogo de países",
      roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR],
    },
    {
      to: "/catalog/buques",
      icon: Ship,
      label: "Buques",
      description: "Catálogo de buques",
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

  const apiOk = !!healthData
  const activeUsersTotal = usersData?.meta?.total ?? 0

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Health */}
          <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
            <GlassCardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-accent)/0.15)] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[rgb(var(--color-accent))]" />
                </div>
                <div>
                  <GlassCardTitle>Estado del sistema</GlassCardTitle>
                  <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">API / Servicios</p>
                </div>
              </div>
            </GlassCardHeader>

            <GlassCardContent>
              {isLoadingHealth ? (
                <Skeleton height="3.5rem" />
              ) : (
                <div className="flex items-center justify-between glass-subtle rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    {apiOk ? (
                      <CheckCircle className="w-4 h-4 text-[rgb(var(--color-success))]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[rgb(var(--color-danger))]" />
                    )}
                    <span className="text-sm text-[rgb(var(--color-fg))]">
                      {apiOk ? "Operativo" : "Sin conexión"}
                    </span>
                  </div>
                  <span className="text-xs text-[rgb(var(--color-muted))]">
                    {apiOk ? "OK" : "ERROR"}
                  </span>
                </div>
              )}
            </GlassCardContent>
          </GlassCard>

          {/* Users */}
          <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.10s" }}>
            <GlassCardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-accent)/0.15)] flex items-center justify-center">
                  <Users className="w-5 h-5 text-[rgb(var(--color-accent))]" />
                </div>
                <div>
                  <GlassCardTitle>Usuarios activos</GlassCardTitle>
                  <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">Visión general</p>
                </div>
              </div>
            </GlassCardHeader>

            <GlassCardContent>
              {!canViewUsers ? (
                <div className="glass-subtle rounded-xl p-4">
                  <p className="text-sm text-[rgb(var(--color-muted))]">
                    No tienes permisos para ver usuarios.
                  </p>
                </div>
              ) : isLoadingUsers ? (
                <Skeleton height="3.5rem" />
              ) : (
                <div className="flex items-center justify-between glass-subtle rounded-xl p-4">
                  <span className="text-sm text-[rgb(var(--color-fg))]">Total</span>
                  <span className="text-sm font-semibold text-[rgb(var(--color-fg))]">
                    {activeUsersTotal}
                  </span>
                </div>
              )}
            </GlassCardContent>
          </GlassCard>

          {/* Quick links */}
          <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <GlassCardHeader>
              <div className="flex items-center justify-between">
                <GlassCardTitle>Accesos rápidos</GlassCardTitle>
                <Link to="/recaladas">
                  <GlassButton variant="ghost" size="sm">
                    Recaladas
                    <ArrowRight className="w-4 h-4" />
                  </GlassButton>
                </Link>
              </div>
            </GlassCardHeader>

            <GlassCardContent>
              <div className="grid grid-cols-1 gap-2">
                {quickLinks.map((l, idx) => {
                  const Icon = l.icon
                  return (
                    <Link
                      key={l.to}
                      to={l.to}
                      className="glass-subtle rounded-xl p-3 hover:bg-[rgb(var(--color-glass-hover)/0.5)] transition-all duration-200"
                      style={{ animationDelay: `${0.15 + idx * 0.03}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[rgb(var(--color-accent)/0.15)] flex items-center justify-center">
                          <Icon className="w-4 h-4 text-[rgb(var(--color-accent))]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[rgb(var(--color-fg))] truncate">
                            {l.label}
                          </p>
                          <p className="text-xs text-[rgb(var(--color-muted))] truncate">
                            {l.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* ✅ ATENCIONES EN DASHBOARD (sin archivos nuevos) */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.20s" }}>
          <GlassCardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-accent)/0.15)] flex items-center justify-center">
                  <CalendarClock className="w-5 h-5 text-[rgb(var(--color-accent))]" />
                </div>
                <div>
                  <GlassCardTitle>Atenciones de hoy</GlassCardTitle>
                  <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">
                    {isLoadingAtenciones
                      ? "Cargando..."
                      : `${orderedAtenciones.length} programadas · ${openCount} abiertas`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* si tienes ruta /atenciones úsala; si no, quítala */}
                <Link to="/atenciones">
                  <GlassButton variant="ghost" size="sm">
                    Ver todas
                    <ArrowRight className="w-4 h-4" />
                  </GlassButton>
                </Link>
              </div>
            </div>
          </GlassCardHeader>

          <GlassCardContent>
            {isLoadingAtenciones ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton height="6.5rem" />
                <Skeleton height="6.5rem" />
                <Skeleton height="6.5rem" />
                <Skeleton height="6.5rem" />
              </div>
            ) : orderedAtenciones.length === 0 ? (
              <div className="glass-subtle rounded-xl p-5">
                <p className="text-sm text-[rgb(var(--color-muted))]">
                  No hay atenciones para hoy. Crea una desde la recalada correspondiente.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orderedAtenciones.map((a: any, idx: number) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => navigate(`/atenciones/${a.id}`)}
                    className="text-left glass-subtle p-4 rounded-xl hover:bg-[rgb(var(--color-glass-hover)/0.5)] transition-all duration-200 focus-ring"
                    style={{ animationDelay: `${0.22 + idx * 0.03}s` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[rgb(var(--color-fg))]">
                          {formatRange(a.fechaInicio, a.fechaFin)}
                        </p>
                        <p className="text-xs text-[rgb(var(--color-muted))] mt-1">
                          {a.turnosTotal != null ? `${a.turnosTotal} turnos · ` : ""}
                          Estado: {a.operationalStatus ?? "—"}
                        </p>
                        {a.descripcion && (
                          <p className="text-xs text-[rgb(var(--color-muted))] mt-2 line-clamp-2">
                            {a.descripcion}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-[rgb(var(--color-muted))] mt-0.5 shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>
    </AppShell>
  )
}
