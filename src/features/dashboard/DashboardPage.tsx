// src/features/dashboard/DashboardPage.tsx
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
  Clock,
  PlayCircle,
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

import { healthApi } from "@/core/api"
import { useDashboardOverview } from "@/hooks/use-dashboard"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"

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

  const isSupervisor = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR
  const isGuia = user?.rol === Rol.GUIA

  // Health (se mantiene)
  const { data: healthData, isLoading: isLoadingHealth } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await healthApi.check()
      return response.data
    },
    refetchInterval: 30_000,
  })

  // ✅ Dashboard overview (1 sola llamada)
  const { overview, isLoading: isLoadingOverview } = useDashboardOverview({
    enabled: !!user,
  })

  const apiOk = !!healthData

  // Links por rol (se mantienen)
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

  // ✅ Intentamos leer campos de overview de forma defensiva (sin asumir shape rígida)
  const supervisorCounts = (overview as any)?.counts ?? (overview as any)?.supervisor?.counts
  const guiaNextTurno = (overview as any)?.nextTurno ?? (overview as any)?.guia?.nextTurno
  const guiaActiveTurno = (overview as any)?.activeTurno ?? (overview as any)?.guia?.activeTurno
  const guiaDisponibles = (overview as any)?.atencionesDisponibles ?? (overview as any)?.guia?.atencionesDisponibles

  const disponiblesOrdered = useMemo(() => {
    const list = Array.isArray(guiaDisponibles) ? guiaDisponibles : []
    return [...list].sort(
      (a: any, b: any) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
    )
  }, [guiaDisponibles])

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

          {/* Overview card (por rol) */}
          <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.10s" }}>
            <GlassCardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-accent)/0.15)] flex items-center justify-center">
                  {isGuia ? (
                    <Clock className="w-5 h-5 text-[rgb(var(--color-accent))]" />
                  ) : (
                    <Users className="w-5 h-5 text-[rgb(var(--color-accent))]" />
                  )}
                </div>
                <div>
                  <GlassCardTitle>{isGuia ? "Tu jornada" : "Resumen de hoy"}</GlassCardTitle>
                  <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">
                    {isGuia ? "Siguiente / Activo" : "Conteos operativos"}
                  </p>
                </div>
              </div>
            </GlassCardHeader>

            <GlassCardContent>
              {isLoadingOverview ? (
                <Skeleton height="3.5rem" />
              ) : isGuia ? (
                <div className="space-y-2">
                  <div className="glass-subtle rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-[rgb(var(--color-muted))]">Turno activo</p>
                      <p className="text-sm font-semibold text-[rgb(var(--color-fg))] truncate">
                        {guiaActiveTurno
                          ? `#${(guiaActiveTurno as any).numero ?? (guiaActiveTurno as any).id ?? "—"} · ${(guiaActiveTurno as any).status ?? "IN_PROGRESS"}`
                          : "No tienes turno en curso"}
                      </p>
                    </div>
                    {guiaActiveTurno && (
                      <GlassButton variant="ghost" size="sm" onClick={() => navigate("/turnos")}>
                        Continuar
                        <PlayCircle className="w-4 h-4" />
                      </GlassButton>
                    )}
                  </div>

                  <div className="glass-subtle rounded-xl p-4">
                    <p className="text-xs text-[rgb(var(--color-muted))]">Siguiente turno</p>
                    <p className="text-sm font-semibold text-[rgb(var(--color-fg))]">
                      {guiaNextTurno
                        ? `#${(guiaNextTurno as any).numero ?? (guiaNextTurno as any).id ?? "—"} · ${(guiaNextTurno as any).status ?? "ASSIGNED"}`
                        : "No tienes un turno próximo"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="glass-subtle rounded-xl p-4">
                    <p className="text-xs text-[rgb(var(--color-muted))]">Recaladas</p>
                    <p className="text-lg font-bold text-[rgb(var(--color-fg))]">
                      {supervisorCounts?.recaladas ?? "—"}
                    </p>
                  </div>
                  <div className="glass-subtle rounded-xl p-4">
                    <p className="text-xs text-[rgb(var(--color-muted))]">Atenciones</p>
                    <p className="text-lg font-bold text-[rgb(var(--color-fg))]">
                      {supervisorCounts?.atenciones ?? "—"}
                    </p>
                  </div>
                  <div className="glass-subtle rounded-xl p-4">
                    <p className="text-xs text-[rgb(var(--color-muted))]">Turnos</p>
                    <p className="text-lg font-bold text-[rgb(var(--color-fg))]">
                      {supervisorCounts?.turnos ?? "—"}
                    </p>
                  </div>
                  <div className="glass-subtle rounded-xl p-4">
                    <p className="text-xs text-[rgb(var(--color-muted))]">En curso</p>
                    <p className="text-lg font-bold text-[rgb(var(--color-fg))]">
                      {supervisorCounts?.inProgress ?? supervisorCounts?.turnosInProgress ?? "—"}
                    </p>
                  </div>
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
                          <p className="text-sm font-medium text-[rgb(var(--color-fg))] truncate">{l.label}</p>
                          <p className="text-xs text-[rgb(var(--color-muted))] truncate">{l.description}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* GUIA: atenciones disponibles (si el overview las trae) */}
        {isGuia && (
          <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.20s" }}>
            <GlassCardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-accent)/0.15)] flex items-center justify-center">
                    <CalendarClock className="w-5 h-5 text-[rgb(var(--color-accent))]" />
                  </div>
                  <div>
                    <GlassCardTitle>Atenciones disponibles</GlassCardTitle>
                    <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">
                      {Array.isArray(disponiblesOrdered) ? `${disponiblesOrdered.length} disponibles` : "—"}
                    </p>
                  </div>
                </div>

                <Link to="/atenciones">
                  <GlassButton variant="ghost" size="sm">
                    Ver atenciones
                    <ArrowRight className="w-4 h-4" />
                  </GlassButton>
                </Link>
              </div>
            </GlassCardHeader>

            <GlassCardContent>
              {isLoadingOverview ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton height="6.5rem" />
                  <Skeleton height="6.5rem" />
                </div>
              ) : disponiblesOrdered.length === 0 ? (
                <div className="glass-subtle rounded-xl p-5">
                  <p className="text-sm text-[rgb(var(--color-muted))]">
                    No hay atenciones disponibles en este momento.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {disponiblesOrdered.slice(0, 6).map((a: any, idx: number) => (
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
                            {a.fechaInicio && a.fechaFin ? formatRange(a.fechaInicio, a.fechaFin) : `Atención #${a.id}`}
                          </p>
                          <p className="text-xs text-[rgb(var(--color-muted))] mt-1">
                            {a.operationalStatus ? `Estado: ${a.operationalStatus}` : ""}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[rgb(var(--color-muted))] mt-0.5 shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </AppShell>
  )
}
