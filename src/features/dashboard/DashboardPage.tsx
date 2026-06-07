// src/features/dashboard/DashboardPage.tsx
"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
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
  Settings,
  CheckCircle2,
  TrendingUp,
  Timer,
  Star,
  type LucideIcon,
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
import type {
  DashboardOverview,
  SupervisorOverview,
  SupervisorAnalytics,
  GuiaOverview,
  WorkloadTrendDay,
  DashboardMilestone,
} from "@/core/models/dashboard"

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDateOperative(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
}

function formatRange(fechaInicio: string, fechaFin: string) {
  const start = new Date(fechaInicio)
  const end = new Date(fechaFin)
  const date = start.toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
  const t1 = start.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
  const t2 = end.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
  return `${date} · ${t1} – ${t2}`
}

// ─── main page ───────────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isSupervisor = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR
  const isGuia = user?.rol === Rol.GUIA

  const [rangeDays, setRangeDays] = useState<7 | 30>(30)

  useTurnoSocket()
  useRecaladaSocket()

  const { data: healthData, isLoading: isLoadingHealth } = useQuery({
    queryKey: ["health"],
    queryFn: async () => { const r = await healthApi.check(); return r.data },
    refetchInterval: 30_000,
  })
  const apiOk = !!healthData

  const { overview, isLoading, refetch } = useDashboardOverview({
    enabled: !!user,
    params: isSupervisor ? { rangeDays } : undefined,
  })

  const quickLinks = [
    { to: "/profile",               icon: User,      label: "Mi Perfil",        description: "Ver y editar tu perfil",    roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR, Rol.GUIA] },
    { to: "/users",                  icon: Users,     label: "Usuarios",         description: "Gestionar usuarios",        roles: [Rol.SUPER_ADMIN] },
    { to: "/catalog/paises",         icon: MapPin,    label: "Países",           description: "Catálogo de países",        roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR] },
    { to: "/catalog/buques",         icon: Ship,      label: "Buques",           description: "Catálogo de buques",        roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR] },
    { to: "/configuracion-operativa",icon: Settings,  label: "Config. operativa",description: "Modo manual o FIFO",       roles: [Rol.SUPER_ADMIN, Rol.SUPERVISOR] },
    { to: "/invitations",            icon: UserPlus,  label: "Invitaciones",     description: "Enviar invitaciones",       roles: [Rol.SUPER_ADMIN] },
  ].filter((l) => user && l.roles.includes(user.rol))

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton height="3rem" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Skeleton height="12rem" />
            <Skeleton height="12rem" />
            <Skeleton height="12rem" />
          </div>
          <Skeleton height="8rem" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      {isGuia
        ? <GuiaDashboard
            overview={overview as DashboardOverview}
            isLoadingHealth={isLoadingHealth}
            apiOk={apiOk}
            quickLinks={quickLinks}
            navigate={navigate}
          />
        : isSupervisor
          ? <SupervisorDashboard
              overview={overview as DashboardOverview}
              isLoadingHealth={isLoadingHealth}
              apiOk={apiOk}
              quickLinks={quickLinks}
              navigate={navigate}
              rangeDays={rangeDays}
              onRangeChange={setRangeDays}
              onRefresh={refetch}
            />
          : null
      }
    </AppShell>
  )
}

// ─── SupervisorDashboard ──────────────────────────────────────────────────────

interface BaseDashProps {
  overview: DashboardOverview | null
  isLoadingHealth: boolean
  apiOk: boolean
  quickLinks: Array<{ to: string; icon: LucideIcon; label: string; description: string }>
  navigate: (to: string) => void
}

interface DashProps extends BaseDashProps {
  rangeDays: 7 | 30
  onRangeChange: (r: 7 | 30) => void
  onRefresh: () => void
}

function SupervisorDashboard({ overview, isLoadingHealth, apiOk, quickLinks, navigate, rangeDays, onRangeChange, onRefresh }: DashProps) {
  const sup: SupervisorOverview | undefined = overview?.supervisor
  const counts  = sup?.counts
  const upcoming = sup?.upcoming ?? []
  const analytics: SupervisorAnalytics | undefined = sup?.analytics

  const operativeDate = overview?.dateContext?.date
    ? formatDateOperative(overview.dateContext.date + "T12:00:00")
    : null

  const priorityActions = analytics?.priorityActions ?? []

  return (
    <div className="space-y-5">

      {/* ── Row 1: Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3 animate-fade-in-up">
        <div>
          <p className="text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-widest">
            Dashboard operativo
          </p>
          <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))] leading-tight mt-0.5">
            {operativeDate ?? "Cargando…"}
          </h1>
          {overview?.serverTime && (
            <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">
              Actualizado {formatTime(overview.serverTime)} · {overview.dateContext?.timezoneHint ?? ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Range selector */}
          <div className="inline-flex rounded-lg overflow-hidden border border-[rgb(var(--color-border)/0.2)]">
            {([7, 30] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onRangeChange(d)}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={rangeDays === d
                  ? { background: "rgb(var(--color-primary))", color: "rgb(var(--color-bg))" }
                  : { background: "transparent", color: "rgb(var(--color-muted))" }}
              >
                {d}d
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80 focus-ring"
            style={{ background: "rgb(var(--color-glass-subtle))", color: "rgb(var(--color-muted))" }}
          >
            Actualizar
          </button>
          {/* API status */}
          {isLoadingHealth ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[rgb(var(--color-glass-subtle))] text-[rgb(var(--color-muted))]">
              <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-muted))]" /> Verificando
            </span>
          ) : apiOk ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[rgb(var(--color-success)/0.12)] text-[rgb(var(--color-success))]">
              <CheckCircle className="w-3 h-3" /> API operativa
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[rgb(var(--color-danger)/0.12)] text-[rgb(var(--color-danger))]">
              <AlertCircle className="w-3 h-3" /> Sin conexión
            </span>
          )}
        </div>
      </div>

      {/* ── Row 1b: Alertas operativas ──────────────────────────────────────── */}
      {priorityActions.length > 0 ? (
        <div className="flex flex-col gap-2">
          {priorityActions.map((action, i) => {
            const isUrgent = action.type === "OVERDUE_RECALADAS" || action.type === "OLD_PENDING_CHECKINS"
            return (
              <button
                key={action.type}
                type="button"
                onClick={() => navigate(action.to)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors hover:opacity-90 focus-ring animate-fade-in-up"
                style={{
                  background: isUrgent ? "rgb(var(--color-danger)/0.08)" : "rgb(var(--color-warning)/0.08)",
                  border: `1px solid ${isUrgent ? "rgb(var(--color-danger)/0.22)" : "rgb(var(--color-warning)/0.20)"}`,
                  animationDelay: `${30 + i * 35}ms`,
                }}
              >
                <AlertTriangle className={`w-4 h-4 shrink-0 ${isUrgent ? "text-[rgb(var(--color-danger))]" : "text-[rgb(var(--color-warning))]"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[rgb(var(--color-fg))]">{action.label}</p>
                </div>
                <ArrowRight className={`w-3.5 h-3.5 shrink-0 ml-auto ${isUrgent ? "text-[rgb(var(--color-danger))]" : "text-[rgb(var(--color-warning))]"}`} />
              </button>
            )
          })}
        </div>
      ) : (
        <div
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl animate-fade-in-up"
          style={{ background: "rgb(var(--color-success)/0.08)", border: "1px solid rgb(var(--color-success)/0.18)", animationDelay: "30ms" }}
        >
          <CheckCircle className="w-3.5 h-3.5 text-[rgb(var(--color-success))] shrink-0" />
          <p className="text-xs font-medium text-[rgb(var(--color-muted))]">Sin alertas pendientes</p>
        </div>
      )}

      {/* ── Row 1c: KPIs métricas ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {([
          { label: "Recaladas",   value: counts?.recaladas,       color: "info"    },
          { label: "Atenciones",  value: counts?.atenciones,      color: "info"    },
          { label: "En curso",    value: counts?.turnosInProgress, color: "warning" },
          { label: "Completados", value: counts?.turnosDone,       color: "success" },
          { label: "No-shows",    value: counts?.turnosNoShow,     color: "danger"  },
          { label: "Sin asignar", value: counts?.turnosAvailable,  color: "neutral" },
        ] as const).map((k, i) => (
          <KpiCard key={k.label} {...k} delay={i * 40} />
        ))}
      </div>

      {/* ── Row 2: Tendencia Nd + distribución de turnos ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 animate-fade-in-up" style={{ animationDelay: "0.08s" }}>
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[rgb(var(--color-primary)/0.12)] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                </div>
                <div>
                  <GlassCardTitle>Tendencia {rangeDays} días</GlassCardTitle>
                  <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">
                    {analytics?.range.startDate ?? "—"} → {analytics?.range.endDate ?? "—"}
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[11px] text-[rgb(var(--color-muted))]">
                {[
                  { label: "Completados", color: "success" },
                  { label: "No-shows",    color: "danger" },
                  { label: "Cancelados",  color: "warning" },
                  { label: "Otros",       color: "info" },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1">
                    <span className={`inline-block w-2 h-2 rounded-sm bg-[rgb(var(--color-${l.color}))]`} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {analytics?.workloadTrend ? (
              <WorkloadTrendChart days={analytics.workloadTrend} />
            ) : (
              <Skeleton height="5rem" />
            )}
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[rgb(var(--color-accent)/0.12)] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[rgb(var(--color-accent))]" />
              </div>
              <div>
                <GlassCardTitle>Distribución turnos</GlassCardTitle>
                <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">Estado actual del día</p>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {analytics?.turnoStatus ? (
              <TurnoStatusBars status={analytics.turnoStatus} navigate={navigate} />
            ) : (
              <Skeleton height="6rem" />
            )}
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* ── Row 3: Check-in flow + capacidad guías ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "0.12s" }}>
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[rgb(var(--color-info)/0.12)] flex items-center justify-center">
                <Timer className="w-4 h-4 text-[rgb(var(--color-info))]" />
              </div>
              <div>
                <GlassCardTitle>Embudo de check-in</GlassCardTitle>
                <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">
                  {analytics?.range.days ?? rangeDays} días · tiempo medio de respuesta
                </p>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {analytics?.checkInFlow ? (
              <CheckInFlowPanel flow={analytics.checkInFlow} navigate={navigate} />
            ) : (
              <Skeleton height="7rem" />
            )}
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[rgb(var(--color-primary)/0.12)] flex items-center justify-center">
                <Users className="w-4 h-4 text-[rgb(var(--color-primary))]" />
              </div>
              <div>
                <GlassCardTitle>Capacidad de guías</GlassCardTitle>
                <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">Estado operativo actual</p>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {analytics?.guideCapacity ? (
              <GuideCapacityPanel capacity={analytics.guideCapacity} />
            ) : (
              <Skeleton height="7rem" />
            )}
            <div className="mt-3 pt-3 border-t border-[rgb(var(--color-border)/0.5)]">
              <Link to="/users" className="text-xs font-medium text-[rgb(var(--color-primary))] hover:underline">
                Ver guías →
              </Link>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* ── Row 4: Evaluaciones + próximos hitos ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "0.16s" }}>
        <GlassCard className="flex flex-col">
          <GlassCardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[rgb(var(--color-success)/0.12)] flex items-center justify-center">
                <Star className="w-4 h-4 text-[rgb(var(--color-success))]" />
              </div>
              <div>
                <GlassCardTitle>Evaluaciones</GlassCardTitle>
                <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">Cierre de atenciones · {rangeDays}d</p>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent className="flex-1 flex flex-col min-h-0">
            {analytics?.evaluations ? (
              <EvaluationsPanel evals={analytics.evaluations} navigate={navigate} />
            ) : (
              <Skeleton height="7rem" />
            )}
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[rgb(var(--color-primary)/0.12)] flex items-center justify-center">
                <CalendarClock className="w-4 h-4 text-[rgb(var(--color-primary))]" />
              </div>
              <div>
                <GlassCardTitle>Próximos hitos</GlassCardTitle>
                <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">Llegadas, salidas, aperturas y cierres</p>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-[rgb(var(--color-muted))] py-2">No hay hitos próximos registrados.</p>
            ) : (
              <div
                className="space-y-1 overflow-y-auto"
                style={{ maxHeight: "30rem", scrollbarWidth: "thin" }}
              >
                {upcoming.map((m, i) => (
                  <MilestoneRow key={i} milestone={m} navigate={navigate} delay={i * 55} />
                ))}
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* ── Accesos rápidos ──────────────────────────────────────────────────── */}
      {quickLinks.length > 0 && (
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.20s" } as CSSProperties}>
          <GlassCardHeader>
            <GlassCardTitle>Accesos rápidos</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {quickLinks.map((l) => {
                const Icon = l.icon
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[rgb(var(--color-glass-hover)/0.5)] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[rgb(var(--color-accent)/0.12)] flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-[rgb(var(--color-accent))]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[rgb(var(--color-fg))] truncate">{l.label}</p>
                      <p className="text-xs text-[rgb(var(--color-muted))] truncate">{l.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </GlassCardContent>
        </GlassCard>
      )}
    </div>
  )
}

// ─── GuiaDashboard ────────────────────────────────────────────────────────────

function GuiaDashboard({ overview, isLoadingHealth, apiOk, quickLinks, navigate }: BaseDashProps) {
  const guia: GuiaOverview | undefined = overview?.guia

  const guiaActiveTurno = guia?.activeTurno
  const guiaNextTurno = guia?.nextTurno
  const guiaDisponibilidad = guia?.disponibilidad
  const assignmentMode = guia?.assignmentMode ?? overview?.turnoAssignmentMode ?? "MANUAL_RECLAMO"
  const guiaDisponible = guiaDisponibilidad?.disponibleParaTurnos ?? false
  const guiaPenalizado = guiaDisponibilidad?.pendingPenalty ?? false

  const disponiblesOrdered = useMemo(() => {
    const list = guia?.atencionesDisponibles ?? []
    return [...list].sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
  }, [guia?.atencionesDisponibles])

  return (
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
                <span className="text-xs text-[rgb(var(--color-muted))]">{apiOk ? "OK" : "ERROR"}</span>
              </div>
            )}
          </GlassCardContent>
        </GlassCard>

        {/* My shift */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.10s" }}>
          <GlassCardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-accent)/0.15)] flex items-center justify-center">
                <Clock className="w-5 h-5 text-[rgb(var(--color-accent))]" />
              </div>
              <div>
                <GlassCardTitle>Tu jornada</GlassCardTitle>
                <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">Siguiente / Activo</p>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-2">
              <div className="glass-subtle rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[rgb(var(--color-muted))]">Turno activo</p>
                  <p className="text-sm font-semibold text-[rgb(var(--color-fg))] truncate">
                    {guiaActiveTurno ? `#${guiaActiveTurno.numero} · ${guiaActiveTurno.status}` : "No tienes turno en curso"}
                  </p>
                </div>
                {guiaActiveTurno && (
                  <GlassButton variant="ghost" size="sm" onClick={() => navigate("/turnos")}>
                    Continuar <PlayCircle className="w-4 h-4" />
                  </GlassButton>
                )}
              </div>
              <div className="glass-subtle rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-[rgb(var(--color-muted))]">Disponibilidad</p>
                    <p className="text-sm font-semibold text-[rgb(var(--color-fg))]">
                      {guiaPenalizado ? "Penalizado" : guiaDisponible ? "Disponible" : "No disponible"}
                    </p>
                  </div>
                  <CheckCircle2 className={`h-4 w-4 ${guiaDisponible && !guiaPenalizado ? "text-[rgb(var(--color-success))]" : "text-[rgb(var(--color-muted))]"}`} />
                </div>
              </div>
              <div className="glass-subtle rounded-xl p-4">
                <p className="text-xs text-[rgb(var(--color-muted))]">Siguiente turno</p>
                <p className="text-sm font-semibold text-[rgb(var(--color-fg))]">
                  {guiaNextTurno ? `#${guiaNextTurno.numero} · ${guiaNextTurno.status}` : "No tienes un turno próximo"}
                </p>
                <p className="mt-1 text-xs text-[rgb(var(--color-muted))]">
                  {assignmentMode === "FIFO_GLOBAL" ? "FIFO automático activo" : "Reclamo manual activo"}
                </p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Quick links */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <GlassCardTitle>Accesos rápidos</GlassCardTitle>
              <Link to="/recaladas">
                <GlassButton variant="ghost" size="sm">Recaladas <ArrowRight className="w-4 h-4" /></GlassButton>
              </Link>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 gap-2">
              {quickLinks.map((l) => {
                const Icon = l.icon
                return (
                  <Link key={l.to} to={l.to} className="glass-subtle rounded-xl p-3 hover:bg-[rgb(var(--color-glass-hover)/0.5)] transition-all duration-200">
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

      {/* Atenciones disponibles */}
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
                  {disponiblesOrdered.length > 0 ? `${disponiblesOrdered.length} disponibles` : "—"}
                </p>
              </div>
            </div>
            <Link to="/atenciones">
              <GlassButton variant="ghost" size="sm">Ver atenciones <ArrowRight className="w-4 h-4" /></GlassButton>
            </Link>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          {disponiblesOrdered.length === 0 ? (
            <div className="glass-subtle rounded-xl p-5">
              <p className="text-sm text-[rgb(var(--color-muted))]">
                {assignmentMode === "FIFO_GLOBAL"
                  ? "FIFO automático está activo. Los turnos se asignan por disponibilidad global."
                  : guiaPenalizado
                    ? "Tienes una penalización pendiente y no puedes tomar turnos."
                    : !guiaDisponible
                      ? "Marca disponibilidad en Mi Perfil para ver turnos reclamables."
                      : "No hay atenciones disponibles en este momento."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {disponiblesOrdered.slice(0, 6).map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => navigate(`/atenciones/${a.id}`)}
                  className="text-left glass-subtle p-4 rounded-xl hover:bg-[rgb(var(--color-glass-hover)/0.5)] transition-all duration-200 focus-ring"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[rgb(var(--color-fg))]">
                        {a.fechaInicio && a.fechaFin ? formatRange(a.fechaInicio, a.fechaFin) : `Atención #${a.id}`}
                      </p>
                      <p className="text-xs text-[rgb(var(--color-muted))] mt-1">
                        {a.recalada?.buque?.nombre ?? ""} · {a.availableTurnos} turno{a.availableTurnos !== 1 ? "s" : ""} libre{a.availableTurnos !== 1 ? "s" : ""}
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
    </div>
  )
}

// ─── Sub-components — analytics ──────────────────────────────────────────────

function WorkloadTrendChart({ days }: { days: WorkloadTrendDay[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const maxTurnos = Math.max(...days.map((d) => d.turnos), 1)
  const BAR_H = 180
  const hoveredDay = hoveredIdx !== null ? days[hoveredIdx] : null
  const showLabels = days.length <= 14

  return (
    <div className="flex flex-col gap-2">
      {/* Detail strip — fixed height to avoid layout jump */}
      <div
        className="h-7 flex items-center gap-2.5 text-[11px] overflow-hidden px-0.5"
        style={{ opacity: hoveredDay ? 1 : 0, transition: "opacity 140ms ease" }}
      >
        {hoveredDay && (
          <>
            <span className="font-semibold text-[rgb(var(--color-fg))] shrink-0">{hoveredDay.date.slice(5)}</span>
            <span className="text-[rgb(var(--color-muted))] shrink-0">{hoveredDay.turnos} turno{hoveredDay.turnos !== 1 ? "s" : ""}</span>
            {hoveredDay.completed > 0 && (
              <span style={{ color: "rgb(var(--color-success))" }} className="shrink-0">{hoveredDay.completed} ok</span>
            )}
            {hoveredDay.noShows > 0 && (
              <span style={{ color: "rgb(var(--color-danger))" }} className="shrink-0">{hoveredDay.noShows} ns</span>
            )}
            {hoveredDay.canceled > 0 && (
              <span style={{ color: "rgb(var(--color-warning))" }} className="shrink-0">{hoveredDay.canceled} cancel.</span>
            )}
          </>
        )}
      </div>

      {/* Bars area with guide lines, then optional label row */}
      <div className="flex flex-col">

        {/* Bars + guide lines */}
        <div className="relative" style={{ height: BAR_H }}>

          {/* Horizontal guide lines at 25 / 50 / 75 % */}
          {[0.25, 0.5, 0.75].map((pct) => (
            <div
              key={pct}
              className="absolute inset-x-0 pointer-events-none"
              style={{
                bottom: `${pct * 100}%`,
                borderTop: "1px solid rgba(var(--color-border), 0.09)",
              }}
            />
          ))}

          {/* Bars */}
          <div className="absolute inset-0 flex items-end gap-1">
            {days.map((day, i) => {
              const ratio     = day.turnos / maxTurnos
              const isHovered = hoveredIdx === i
              const isDimmed  = hoveredIdx !== null && !isHovered

              return (
                <div
                  key={day.date}
                  className="flex-1 h-full flex items-end min-w-0"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{ cursor: "default" }}
                >
                  <div
                    className="w-full rounded-sm overflow-hidden animate-bar-grow"
                    style={{
                      height: `${ratio * 100}%`,
                      background: "rgba(var(--color-border), 0.1)",
                      animationDelay: `${i * 18}ms`,
                      opacity: isDimmed ? 0.35 : 1,
                      boxShadow: isHovered ? "0 0 0 1.5px rgb(var(--color-primary)/0.45)" : "none",
                      transition: "opacity 180ms ease, box-shadow 180ms ease",
                    }}
                  >
                    <div className="w-full h-full flex flex-col justify-end">
                      {day.noShows > 0 && (
                        <div style={{ height: `${(day.noShows / day.turnos) * 100}%`, background: "rgb(var(--color-danger))", opacity: 0.75 }} />
                      )}
                      {day.canceled > 0 && (
                        <div style={{ height: `${(day.canceled / day.turnos) * 100}%`, background: "rgb(var(--color-warning))", opacity: 0.65 }} />
                      )}
                      {day.completed > 0 && (
                        <div style={{ height: `${(day.completed / day.turnos) * 100}%`, background: "rgb(var(--color-success))", opacity: 0.8 }} />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>

        {/* Date labels (only when ≤14 days) */}
        {showLabels && (
          <div className="flex gap-1 mt-1.5">
            {days.map((day, i) => {
              const isHovered = hoveredIdx === i
              return (
                <div
                  key={day.date}
                  className="flex-1 flex items-center justify-center min-w-0"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <span
                    className="text-[9px] truncate w-full text-center"
                    style={{
                      color: isHovered ? "rgb(var(--color-fg))" : "rgb(var(--color-muted))",
                      fontWeight: isHovered ? 600 : 400,
                      transition: "color 180ms ease",
                    }}
                  >
                    {day.date.slice(5)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

const TURNO_STATUS_CONFIG: Record<string, { label: string; color: string; to: string }> = {
  AVAILABLE:   { label: "Sin asignar",  color: "info",    to: "/turnos?status=AVAILABLE" },
  ASSIGNED:    { label: "Asignados",    color: "primary", to: "/turnos?status=ASSIGNED" },
  IN_PROGRESS: { label: "En curso",     color: "warning", to: "/turnos?status=IN_PROGRESS" },
  COMPLETED:   { label: "Completados",  color: "success", to: "/turnos?status=COMPLETED" },
  CANCELED:    { label: "Cancelados",   color: "muted",   to: "/turnos?status=CANCELED" },
  NO_SHOW:     { label: "No-shows",     color: "danger",  to: "/turnos?status=NO_SHOW" },
}

function TurnoStatusBars({ status, navigate }: { status: Record<string, number>; navigate: (to: string) => void }) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const total   = Object.values(status).reduce((s, v) => s + v, 0) || 1
  const entries = Object.entries(status).sort((a, b) => b[1] - a[1])
  const hoveredCfg   = hoveredKey ? (TURNO_STATUS_CONFIG[hoveredKey] ?? null) : null
  const hoveredCount = hoveredKey ? (status[hoveredKey] ?? 0) : 0
  const hoveredPct   = hoveredKey ? Math.round((hoveredCount / total) * 100) : 0

  return (
    <div className="space-y-2.5">
      {/* Detail strip */}
      <div
        className="h-7 flex items-center gap-2 text-[11px] overflow-hidden"
        style={{ opacity: hoveredCfg ? 1 : 0, transition: "opacity 140ms ease" }}
      >
        {hoveredCfg && (
          <>
            <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: `rgb(var(--color-${hoveredCfg.color}))` }} />
            <span className="font-semibold text-[rgb(var(--color-fg))]">{hoveredCfg.label}</span>
            <span className="text-[rgb(var(--color-muted))]">·</span>
            <span style={{ color: `rgb(var(--color-${hoveredCfg.color}))` }}>{hoveredCount}</span>
            <span className="text-[rgb(var(--color-muted))]">({hoveredPct}% de {total})</span>
          </>
        )}
      </div>
      {entries.map(([key, count], i) => {
        const cfg       = TURNO_STATUS_CONFIG[key] ?? { label: key, color: "muted", to: "/turnos" }
        const pct       = Math.round((count / total) * 100)
        const isHovered = hoveredKey === key
        const isDimmed  = hoveredKey !== null && !isHovered
        return (
          <button
            key={key}
            type="button"
            onClick={() => navigate(cfg.to)}
            onMouseEnter={() => setHoveredKey(key)}
            onMouseLeave={() => setHoveredKey(null)}
            className="w-full text-left animate-fade-in-up"
            style={{
              animationDelay: `${i * 55}ms`,
              animationFillMode: "backwards" as const,
              animationTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
              opacity: isDimmed ? 0.38 : 1,
              transition: "opacity 180ms ease",
            }}
          >
            <div className="flex justify-between mb-1">
              <span className="text-xs text-[rgb(var(--color-muted))]">{cfg.label}</span>
              <span className="text-xs font-semibold tabular-nums animate-num-pop" style={{ color: `rgb(var(--color-${cfg.color}))`, animationDelay: `${30 + i * 55}ms`, animationFillMode: "backwards" as const }}>
                {count} <span className="text-[rgb(var(--color-muted))] font-normal">({pct}%)</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-[rgb(var(--color-glass-subtle))]">
              <div
                className="h-full rounded-full animate-bar-fill"
                style={{ width: `${pct}%`, background: `rgb(var(--color-${cfg.color}))`, animationDelay: `${20 + i * 55}ms`, animationFillMode: "backwards" as const }}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}

function CheckInFlowPanel({ flow, navigate }: { flow: import("@/core/models/dashboard").CheckInFlowStats; navigate: (to: string) => void }) {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null)
  const total = Math.max(flow.solicitados, 1)
  const steps = [
    { label: "Solicitados",  value: flow.solicitados,  pct: 100,                                           color: "info"    },
    { label: "Confirmados",  value: flow.confirmados,  pct: Math.round((flow.confirmados / total) * 100),  color: "success" },
    { label: "Rechazados",   value: flow.rechazados,   pct: Math.round((flow.rechazados  / total) * 100),  color: "danger"  },
    { label: "Pendientes",   value: flow.pendientes,   pct: Math.round((flow.pendientes  / total) * 100),  color: "warning" },
  ]
  const hoveredStep = steps.find((s) => s.label === hoveredLabel) ?? null

  return (
    <div className="space-y-2.5">
      {/* Detail strip */}
      <div
        className="h-7 flex items-center gap-2 text-[11px] overflow-hidden"
        style={{ opacity: hoveredStep ? 1 : 0, transition: "opacity 140ms ease" }}
      >
        {hoveredStep && (
          <>
            <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: `rgb(var(--color-${hoveredStep.color}))` }} />
            <span className="font-semibold text-[rgb(var(--color-fg))]">{hoveredStep.label}</span>
            <span style={{ color: `rgb(var(--color-${hoveredStep.color}))` }}>{hoveredStep.value}</span>
            <span className="text-[rgb(var(--color-muted))]">
              ({hoveredStep.pct}%{hoveredStep.label !== "Solicitados" ? ` de ${flow.solicitados}` : ""})
            </span>
          </>
        )}
      </div>
      {steps.map((s, i) => {
        const isHovered = hoveredLabel === s.label
        const isDimmed  = hoveredLabel !== null && !isHovered
        return (
          <button
            key={s.label}
            type="button"
            onClick={() => navigate("/turnos?checkInPending=1")}
            onMouseEnter={() => setHoveredLabel(s.label)}
            onMouseLeave={() => setHoveredLabel(null)}
            className="w-full text-left animate-fade-in-up"
            style={{
              animationDelay: `${i * 60}ms`,
              animationFillMode: "backwards" as const,
              animationTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
              opacity: isDimmed ? 0.38 : 1,
              transition: "opacity 180ms ease",
            }}
          >
            <div className="flex justify-between mb-1">
              <span className="text-xs text-[rgb(var(--color-muted))]">{s.label}</span>
              <span className="text-xs font-semibold tabular-nums animate-num-pop" style={{ color: `rgb(var(--color-${s.color}))`, animationDelay: `${35 + i * 60}ms`, animationFillMode: "backwards" as const }}>{s.value}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-[rgb(var(--color-glass-subtle))]">
              <div className="h-full rounded-full animate-bar-fill" style={{ width: `${s.pct}%`, background: `rgb(var(--color-${s.color}))`, animationDelay: `${20 + i * 60}ms`, animationFillMode: "backwards" as const }} />
            </div>
          </button>
        )
      })}
      <div className="pt-2 flex flex-wrap gap-3 text-[11px] text-[rgb(var(--color-muted))]">
        {flow.avgResponseTimeMin !== null && (
          <span>Tiempo respuesta: <strong className="text-[rgb(var(--color-fg))]">{flow.avgResponseTimeMin} min</strong></span>
        )}
        {flow.pendientesAntiguos > 0 && (
          <button type="button" onClick={() => navigate("/turnos?checkInPending=1")} className="text-[rgb(var(--color-danger))] font-medium hover:underline">
            {flow.pendientesAntiguos} sin respuesta &gt;15 min
          </button>
        )}
      </div>
    </div>
  )
}

function GuideCapacityPanel({ capacity }: { capacity: import("@/core/models/dashboard").GuideCapacityStats }) {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null)
  const bars = [
    { label: "Disponibles",    value: capacity.disponibles,   rate: capacity.disponibilidadRate, color: "success" },
    { label: "Asignados",      value: capacity.asignados,     rate: capacity.utilizacionRate,    color: "primary" },
    { label: "No disponibles", value: capacity.noDisponibles, rate: Math.round((capacity.noDisponibles / Math.max(capacity.activos, 1)) * 100), color: "muted" },
  ]
  const hoveredBar = bars.find((b) => b.label === hoveredLabel) ?? null

  return (
    <div className="space-y-2.5">
      <div className="flex gap-3 mb-3 flex-wrap">
        {[
          { label: "Activos",      value: capacity.activos },
          { label: "Libres",       value: capacity.libres },
          { label: "Penalizados",  value: capacity.penalizados },
        ].map((k, i) => (
          <div key={k.label} className="glass-subtle rounded-lg px-3 py-2 text-center min-w-[64px]">
            <p className="text-lg font-bold tabular-nums text-[rgb(var(--color-fg))] animate-num-pop" style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" as const }}>{k.value}</p>
            <p className="text-[10px] text-[rgb(var(--color-muted))]">{k.label}</p>
          </div>
        ))}
      </div>
      {/* Detail strip */}
      <div
        className="h-7 flex items-center gap-2 text-[11px] overflow-hidden"
        style={{ opacity: hoveredBar ? 1 : 0, transition: "opacity 140ms ease" }}
      >
        {hoveredBar && (
          <>
            <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: `rgb(var(--color-${hoveredBar.color}))` }} />
            <span className="font-semibold text-[rgb(var(--color-fg))]">{hoveredBar.label}</span>
            <span style={{ color: `rgb(var(--color-${hoveredBar.color}))` }}>{hoveredBar.value} guías</span>
            <span className="text-[rgb(var(--color-muted))]">({hoveredBar.rate.toFixed(1)}%)</span>
          </>
        )}
      </div>
      {bars.map((b, i) => {
        const isHovered = hoveredLabel === b.label
        const isDimmed  = hoveredLabel !== null && !isHovered
        return (
          <div
            key={b.label}
            className="animate-fade-in-up"
            onMouseEnter={() => setHoveredLabel(b.label)}
            onMouseLeave={() => setHoveredLabel(null)}
            style={{
              animationDelay: `${180 + i * 60}ms`,
              animationFillMode: "backwards" as const,
              animationTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
              opacity: isDimmed ? 0.38 : 1,
              transition: "opacity 180ms ease",
              cursor: "default",
            }}
          >
            <div className="flex justify-between mb-1">
              <span className="text-xs text-[rgb(var(--color-muted))]">{b.label}</span>
              <span className="text-xs font-semibold tabular-nums text-[rgb(var(--color-fg))]">
                {b.value} <span className="text-[rgb(var(--color-muted))] font-normal">({b.rate.toFixed(1)}%)</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-[rgb(var(--color-glass-subtle))]">
              <div className="h-full rounded-full animate-bar-fill" style={{ width: `${b.rate}%`, background: `rgb(var(--color-${b.color}))`, animationDelay: `${200 + i * 60}ms`, animationFillMode: "backwards" as const }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Donut chart — pure SVG, angle-based hit detection ──────────────────────

function DonutChart({
  segments,
  centerValue,
  centerLabel,
  size = 200,
  onHover,
  hoveredKey,
}: {
  segments: Array<{ key: string; value: number; color: string }>;
  centerValue: string;
  centerLabel: string;
  size?: number;
  onHover?: (key: string | null) => void;
  hoveredKey?: string | null;
}) {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  const SW = 18;
  const R  = (size - SW * 2 - 8) / 2;
  const CX = size / 2;
  const CY = size / 2;
  const C  = 2 * Math.PI * R;
  const total = segments.reduce((s, d) => s + d.value, 0);

  // Compute per-segment data once (render + hit detection share this)
  let cumDash = 0;
  let cumPct  = 0;
  const processed = segments.map((seg) => {
    const pct      = total > 0 ? seg.value / total : 0;
    const dash     = pct * C;
    const dashOff  = cumDash;
    const startPct = cumPct;
    cumDash += dash;
    cumPct  += pct;
    return { ...seg, pct, dash, dashOff, startPct, endPct: cumPct };
  });

  // Angle-based hit detection: maps mouse position → which segment
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onHover || total === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx   = (e.clientX - rect.left  - rect.width  / 2) * (size / rect.width);
    const dy   = (e.clientY - rect.top   - rect.height / 2) * (size / rect.height);
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Only trigger inside the donut ring (with small tolerance)
    if (dist < R - SW / 2 - 5 || dist > R + SW / 2 + 6) {
      onHover(null);
      return;
    }
    // atan2(dx, -dy) → 0 at top, increases clockwise → matches segment start order
    let angle = Math.atan2(dx, -dy);
    if (angle < 0) angle += 2 * Math.PI;
    const pct = angle / (2 * Math.PI);
    const hit = processed.find((s) => s.value > 0 && pct >= s.startPct && pct < s.endPct);
    onHover(hit ? hit.key : null);
  };

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => onHover?.(null)}
      style={{ cursor: onHover ? "pointer" : undefined, overflow: "visible" }}
    >
      {/* Track — very faint, should be fully covered when evaluadas > 0 */}
      <circle cx={CX} cy={CY} r={R} fill="none" strokeWidth={SW}
        style={{ stroke: "rgb(var(--color-border))", opacity: 0.07 }} />

      {/* Segments — rotate -90° so first segment starts at 12 o'clock */}
      {total > 0 && (
        <g transform={`rotate(-90 ${CX} ${CY})`}>
          {processed.map((seg, i) => {
            if (seg.value === 0) return null;
            const isHovered = hoveredKey === seg.key;
            const isDimmed  = hoveredKey !== null && !isHovered;
            return (
              <circle
                key={seg.key}
                cx={CX} cy={CY} r={R}
                fill="none"
                strokeLinecap="butt"
                style={{
                  stroke: `rgb(var(--color-${seg.color}))`,
                  strokeWidth: isHovered ? SW + 5 : SW,
                  strokeDasharray: drawn ? `${seg.dash} ${C}` : `0 ${C}`,
                  strokeDashoffset: seg.dashOff,
                  opacity: isDimmed ? 0.25 : 1,
                  transition: [
                    `stroke-dasharray 580ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 130}ms`,
                    "stroke-width 200ms ease",
                    "opacity 200ms ease",
                  ].join(", "),
                } as React.CSSProperties}
              />
            );
          })}
        </g>
      )}

      {/* Center text */}
      <text x={CX} y={CY - 9} textAnchor="middle"
        style={{ fill: "rgb(var(--color-fg))", fontSize: 22, fontWeight: 700, fontFamily: "inherit" }}>
        {centerValue}
      </text>
      <text x={CX} y={CY + 12} textAnchor="middle"
        style={{ fill: "rgb(var(--color-muted))", fontSize: 10, fontFamily: "inherit" }}>
        {centerLabel}
      </text>
    </svg>
  );
}

// ─── EvaluationsPanel ─────────────────────────────────────────────────────────

function EvaluationsPanel({ evals, navigate }: { evals: import("@/core/models/dashboard").EvaluationStats; navigate: (to: string) => void }) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const { atencionesEnRango, evaluadas, pendientesEval, avgCalificacion, distribucion } = evals

  if (atencionesEnRango === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-10 gap-1.5 text-center">
        <p className="text-sm font-medium text-[rgb(var(--color-muted))]">Sin atenciones cerradas</p>
        <p className="text-xs text-[rgb(var(--color-muted))] opacity-60">No hay datos en el período seleccionado.</p>
      </div>
    )
  }

  const coverage      = Math.round((evaluadas / atencionesEnRango) * 100)
  const coverageColor = coverage === 100 ? "success" : coverage >= 60 ? "warning" : "danger"

  // Donut = distribution of evaluated only (SATISFACTORIA + CON_NOVEDADES + NO_SATISFACTORIA)
  const dist = [
    { label: "Satisfactoria",    key: "SATISFACTORIA",    value: distribucion.SATISFACTORIA,    color: "success" },
    { label: "Con novedades",    key: "CON_NOVEDADES",    value: distribucion.CON_NOVEDADES,    color: "warning" },
    { label: "No satisfactoria", key: "NO_SATISFACTORIA", value: distribucion.NO_SATISFACTORIA, color: "danger"  },
  ].map((d) => ({
    ...d,
    // pct relative to evaluadas (not atencionesEnRango)
    pct: evaluadas > 0 ? Math.round((d.value / evaluadas) * 100) : 0,
  }))

  const donutKey    = dist.map((d) => d.value).join("-")
  const hoveredDist = dist.find((d) => d.key === hoveredKey) ?? null

  // Bottom block content
  const bottomInsight = (() => {
    if (pendientesEval === 0 && distribucion.NO_SATISFACTORIA === 0 && distribucion.CON_NOVEDADES === 0)
      return "Todas las atenciones resultaron satisfactorias."
    if (pendientesEval === 0 && distribucion.CON_NOVEDADES > 0)
      return `${distribucion.CON_NOVEDADES} con novedades — revisión recomendada.`
    if (pendientesEval === 0 && distribucion.NO_SATISFACTORIA > 0)
      return `${distribucion.NO_SATISFACTORIA} resultado${distribucion.NO_SATISFACTORIA !== 1 ? "s" : ""} no satisfactorio${distribucion.NO_SATISFACTORIA !== 1 ? "s" : ""}. Requiere seguimiento.`
    return `${evaluadas} de ${atencionesEnRango} atenciones evaluadas en el período.`
  })()

  return (
    <div className="h-full flex flex-col gap-4">

      {/* ── Hero: N/total · coverage · promedio ── */}
      <div className="shrink-0 flex items-center gap-4 flex-wrap">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tabular-nums text-[rgb(var(--color-fg))] animate-num-pop">{evaluadas}</span>
          <span className="text-sm text-[rgb(var(--color-muted))] font-normal">/{atencionesEnRango}</span>
          <span className="text-[11px] text-[rgb(var(--color-muted))] ml-1">evaluadas</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold tabular-nums animate-num-pop"
            style={{ color: `rgb(var(--color-${coverageColor}))`, animationDelay: "60ms" }}>
            {coverage}%
          </span>
          <span className="text-[11px] text-[rgb(var(--color-muted))]">cobertura</span>
        </div>
        {avgCalificacion !== null && (
          <div className="flex items-baseline gap-1 ml-auto">
            <span className="text-xl font-bold tabular-nums text-[rgb(var(--color-info))] animate-num-pop"
              style={{ animationDelay: "120ms" }}>
              {avgCalificacion.toFixed(1)}
            </span>
            <span className="text-[11px] text-[rgb(var(--color-muted))]">promedio</span>
          </div>
        )}
      </div>

      {/* ── Donut (protagonist) + legend — fills available height ── */}
      <div className="flex-1 min-h-0 flex items-center gap-5">

        {/* Donut + segment hover detail */}
        <div className="shrink-0 flex flex-col items-center gap-1.5">
          <DonutChart
            key={donutKey}
            segments={dist}
            centerValue={String(evaluadas)}
            centerLabel="evaluadas"
            onHover={setHoveredKey}
            hoveredKey={hoveredKey}
          />
          {/* Segment tooltip strip below SVG */}
          <div
            className="h-6 flex items-center justify-center gap-1.5 text-[11px] w-full"
            style={{ opacity: hoveredDist ? 1 : 0, transition: "opacity 140ms ease" }}
          >
            {hoveredDist && (
              <>
                <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: `rgb(var(--color-${hoveredDist.color}))` }} />
                <span style={{ color: `rgb(var(--color-${hoveredDist.color}))` }} className="font-medium">{hoveredDist.label}</span>
                <span className="text-[rgb(var(--color-muted))]">·</span>
                <span className="font-semibold text-[rgb(var(--color-fg))]">{hoveredDist.value}</span>
                <span className="text-[rgb(var(--color-muted))]">({hoveredDist.pct}%)</span>
              </>
            )}
          </div>
        </div>

        {/* Legend — synced hover with donut */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="space-y-2.5">
            {dist.map((d, i) => {
              const isHovered = hoveredKey === d.key
              const isDimmed  = hoveredKey !== null && !isHovered
              return (
                <div
                  key={d.key}
                  className="flex items-center gap-2 animate-fade-in-up"
                  style={{
                    animationDelay: `${i * 50}ms`,
                    opacity: isDimmed ? 0.3 : 1,
                    transition: "opacity 200ms ease",
                    cursor: "default",
                  }}
                  onMouseEnter={() => setHoveredKey(d.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{
                      background: `rgb(var(--color-${d.color}))`,
                      transform: isHovered ? "scale(1.3)" : "scale(1)",
                      transition: "transform 180ms ease",
                    }}
                  />
                  <span className="text-xs text-[rgb(var(--color-muted))] flex-1 truncate">{d.label}</span>
                  <span className="text-xs font-semibold tabular-nums text-[rgb(var(--color-fg))]">{d.value}</span>
                  <span className="text-[10px] text-[rgb(var(--color-muted))] w-7 text-right shrink-0">{d.pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* ── Bloque inferior: Seguimiento de cierre — siempre al fondo ── */}
      <div
        className="mt-auto shrink-0 rounded-xl p-3.5 flex flex-col gap-2 animate-fade-in-up"
        style={{
          animationDelay: "200ms",
          background: pendientesEval > 0
            ? "rgba(var(--color-warning), 0.07)"
            : "rgba(var(--color-success), 0.07)",
          border: `1px solid rgba(var(--color-${pendientesEval > 0 ? "warning" : "success"}), 0.18)`,
        }}
      >
        {/* Title row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[rgb(var(--color-fg))]">
            {pendientesEval > 0 ? "Seguimiento de cierre" : "Cierre del período"}
          </span>
          <span
            className="text-xs font-bold tabular-nums"
            style={{ color: `rgb(var(--color-${coverageColor}))` }}
          >
            {coverage}%
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(var(--color-border), 0.1)" }}>
          <div
            className="h-full rounded-full animate-bar-fill"
            style={{
              width: `${coverage}%`,
              background: `rgb(var(--color-${coverageColor}))`,
              animationDelay: "260ms",
            }}
          />
        </div>
        {/* Bottom row: message + action */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-[rgb(var(--color-muted))] leading-tight flex-1 min-w-0 truncate">
            {pendientesEval > 0
              ? `${pendientesEval} pendiente${pendientesEval !== 1 ? "s" : ""} por evaluar`
              : bottomInsight
            }
          </p>
          {pendientesEval > 0 && (
            <button
              type="button"
              onClick={() => navigate("/atenciones?pendingEval=true")}
              className="shrink-0 text-[11px] font-semibold flex items-center gap-1 hover:underline transition-opacity hover:opacity-80"
              style={{ color: `rgb(var(--color-${coverageColor}))` }}
            >
              Evaluar
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

    </div>
  )
}

// ─── Sub-components — shared ──────────────────────────────────────────────────

function KpiCard({ label, value, color, delay = 0 }: { label: string; value?: number; color: "info" | "success" | "warning" | "danger" | "neutral"; delay?: number }) {
  const colorMap: Record<string, string> = {
    info:    "rgb(var(--color-info))",
    success: "rgb(var(--color-success))",
    warning: "rgb(var(--color-warning))",
    danger:  "rgb(var(--color-danger))",
    neutral: "rgb(var(--color-fg))",
  }
  return (
    <div
      className="glass-subtle rounded-xl p-4 flex flex-col gap-1 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs text-[rgb(var(--color-muted))] font-medium truncate">{label}</p>
      <p
        className="text-2xl font-bold tabular-nums leading-none animate-num-pop"
        style={{ color: colorMap[color], animationDelay: `${delay + 100}ms` }}
      >
        {value !== undefined ? value : "—"}
      </p>
    </div>
  )
}


const MILESTONE_COLORS: Record<string, string> = {
  RECALADA_ARRIVAL:   "rgb(var(--color-info))",
  RECALADA_DEPARTURE: "rgb(var(--color-warning))",
  ATENCION_START:     "rgb(var(--color-success))",
  ATENCION_END:       "rgb(var(--color-muted))",
}

const MILESTONE_LABELS: Record<string, string> = {
  RECALADA_ARRIVAL:   "Llegada",
  RECALADA_DEPARTURE: "Salida",
  ATENCION_START:     "Apertura",
  ATENCION_END:       "Cierre",
}

function MilestoneRow({ milestone, navigate, delay = 0 }: { milestone: DashboardMilestone; navigate: (to: string) => void; delay?: number }) {
  const color = MILESTONE_COLORS[milestone.kind] ?? "rgb(var(--color-muted))"
  const kindLabel = MILESTONE_LABELS[milestone.kind] ?? milestone.kind
  const atTime = formatTime(milestone.at)
  const atDate = new Date(milestone.at).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })

  function handleClick() {
    if (milestone.ref.recaladaId) navigate("/recaladas")
    else if (milestone.ref.atencionId) navigate("/atenciones")
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[rgb(var(--color-glass-hover)/0.5)] transition-colors text-left animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-0.5" style={{ background: color }} />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[rgb(var(--color-fg))] truncate leading-tight">{milestone.title}</p>
        <p className="text-[11px] text-[rgb(var(--color-muted))] mt-0.5">{kindLabel}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-medium tabular-nums text-[rgb(var(--color-fg))]">{atTime}</p>
        <p className="text-[10px] text-[rgb(var(--color-muted))]">{atDate}</p>
      </div>
    </button>
  )
}
