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
  AlertTriangle,
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
import { useTurnoSocket } from "@/hooks/use-turno-socket"
import { useRecaladaSocket } from "@/hooks/use-recalada-socket"

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

  const isGuia = user?.rol === Rol.GUIA

  useTurnoSocket()
  useRecaladaSocket()

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
      roles: [Rol.SUPER_ADMIN],
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

  const overdueRecaladasCount: number = (() => {
    const fromCounts = (overview as any)?.counts?.overdueRecaladas
    const fromSupervisor = (overview as any)?.supervisor?.counts?.overdueRecaladas
    const fromAlerts = ((overview as any)?.supervisor?.alerts ?? (overview as any)?.alerts ?? [])
      .find((a: any) => a?.code === "OVERDUE_RECALADAS")?.count
    return Number(fromCounts ?? fromSupervisor ?? fromAlerts ?? 0) || 0
  })()

  const disponiblesOrdered = useMemo(() => {
    const list = Array.isArray(guiaDisponibles) ? guiaDisponibles : []
    return [...list].sort(
      (a: any, b: any) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
    )
  }, [guiaDisponibles])

  return (
    <AppShell>
      <div className="space-y-6">
        {!isGuia && overdueRecaladasCount > 0 && (
          <button
            type="button"
            onClick={() => navigate("/recaladas?overdueDeparture=true")}
            className="group w-full text-left animate-fade-in-up focus-ring rounded-2xl"
            aria-label="Revisar recaladas vencidas pendientes de zarpe"
          >
            <div
              className="relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 group-hover:shadow-[0_8px_30px_-12px_rgba(var(--color-danger),0.35)]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(var(--color-danger), 0.10) 0%, rgba(var(--color-danger), 0.04) 60%, rgba(var(--color-danger), 0.07) 100%)",
                border: "1px solid rgba(var(--color-danger), 0.28)",
              }}
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-[rgb(var(--color-danger))]" />
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[rgb(var(--color-danger)/0.10)] blur-2xl" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="relative w-11 h-11 rounded-xl bg-[rgb(var(--color-danger)/0.14)] flex items-center justify-center shrink-0 ring-1 ring-[rgb(var(--color-danger)/0.22)]">
                    <span className="absolute inset-0 rounded-xl bg-[rgb(var(--color-danger)/0.18)] animate-ping opacity-40" />
                    <AlertTriangle className="relative w-5 h-5 text-[rgb(var(--color-danger))]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[rgb(var(--color-danger))]">
                        Atención operativa
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--color-danger)/0.14)] px-2 py-0.5 text-[10.5px] font-semibold text-[rgb(var(--color-danger))] ring-1 ring-[rgb(var(--color-danger)/0.18)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--color-danger))]" />
                        ARRIVED · salida vencida
                      </span>
                    </div>
                    <p className="mt-1.5 text-[15px] font-bold leading-tight text-[rgb(var(--color-fg))] sm:text-base">
                      Recaladas pendientes de zarpe
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-[rgb(var(--color-muted))] sm:text-sm">
                      {overdueRecaladasCount === 1
                        ? "Hay 1 recalada arribada cuya salida programada ya venció."
                        : `Hay ${overdueRecaladasCount} recaladas arribadas cuya salida programada ya venció.`}{" "}
                      Revisa la lista filtrada y marca el zarpe correspondiente.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="relative rounded-xl bg-[rgb(var(--color-danger)/0.14)] px-3.5 py-2 text-center ring-1 ring-inset ring-[rgb(var(--color-danger)/0.20)]">
                    <p className="tabular-nums text-2xl font-black leading-none text-[rgb(var(--color-danger))]">
                      {overdueRecaladasCount}
                    </p>
                    <p className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[rgb(var(--color-danger)/0.85)]">
                      vencidas
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-[rgb(var(--color-bg-elevated))] px-3.5 py-2 text-[12.5px] font-bold text-[rgb(var(--color-danger))] ring-1 ring-[rgb(var(--color-danger)/0.22)] shadow-sm transition-all duration-200 group-hover:translate-x-0.5 group-hover:ring-[rgb(var(--color-danger)/0.35)]">
                    Revisar
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </div>
          </button>
        )}

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
