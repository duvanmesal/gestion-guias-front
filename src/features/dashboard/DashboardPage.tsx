// src/features/dashboard/DashboardPage.tsx
"use client"

import { useMemo, useState, type CSSProperties } from "react"
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

      {/* ── Row 1b: Priority actions + KPIs críticos ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 animate-fade-in-up" style={{ animationDelay: "0.03s" }}>
        {/* Priority actions */}
        {priorityActions.length > 0 ? (
          <div className="flex flex-col gap-2">
            {priorityActions.map((action) => {
              const isUrgent = action.type === "OVERDUE_RECALADAS" || action.type === "OLD_PENDING_CHECKINS"
              return (
                <button
                  key={action.type}
                  type="button"
                  onClick={() => navigate(action.to)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors hover:opacity-90 focus-ring"
                  style={{
                    background: isUrgent ? "rgb(var(--color-danger)/0.08)" : "rgb(var(--color-warning)/0.08)",
                    border: `1px solid ${isUrgent ? "rgb(var(--color-danger)/0.22)" : "rgb(var(--color-warning)/0.20)"}`,
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
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgb(var(--color-success)/0.08)", border: "1px solid rgb(var(--color-success)/0.18)" }}>
            <CheckCircle className="w-4 h-4 text-[rgb(var(--color-success))] shrink-0" />
            <p className="text-sm font-medium text-[rgb(var(--color-fg))]">Sin alertas pendientes</p>
          </div>
        )}

        {/* KPIs críticos */}
        <div className="grid grid-cols-3 lg:grid-cols-2 gap-2 lg:min-w-[200px]">
          <KpiCard label="Recaladas" value={counts?.recaladas} color="info" />
          <KpiCard label="Atenciones" value={counts?.atenciones} color="info" />
          <KpiCard label="En curso" value={counts?.turnosInProgress} color="warning" />
          <KpiCard label="Completados" value={counts?.turnosDone} color="success" />
          <KpiCard label="No-shows" value={counts?.turnosNoShow} color="danger" />
          <KpiCard label="Sin asignar" value={counts?.turnosAvailable} color="neutral" />
        </div>
      </div>

      {/* ── Row 2: Tendencia Nd + distribución de turnos ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 animate-fade-in-up" style={{ animationDelay: "0.06s" }}>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "0.09s" }}>
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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4 animate-fade-in-up" style={{ animationDelay: "0.12s" }}>
        <GlassCard>
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
          <GlassCardContent>
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
              <div className="space-y-1">
                {upcoming.map((m, i) => (
                  <MilestoneRow key={i} milestone={m} navigate={navigate} />
                ))}
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* ── Accesos rápidos ──────────────────────────────────────────────────── */}
      {quickLinks.length > 0 && (
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.15s" } as CSSProperties}>
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
  const maxTurnos = Math.max(...days.map((d) => d.turnos), 1)
  const BAR_H = 80

  return (
    <div className="flex items-end gap-1" style={{ height: BAR_H + 32 }}>
      {days.map((day) => {
        const completedH = Math.round((day.completed / maxTurnos) * BAR_H)
        const noShowH    = Math.round((day.noShows / maxTurnos) * BAR_H)
        const canceledH  = Math.round((day.canceled / maxTurnos) * BAR_H)
        const otherH     = Math.max(0, Math.round((day.turnos / maxTurnos) * BAR_H) - completedH - noShowH - canceledH)
        const totalH     = completedH + noShowH + canceledH + otherH
        const label      = day.date.slice(5) // MM-DD

        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1 min-w-0" title={`${day.date}\n${day.atenciones} atenciones · ${day.turnos} turnos\n${day.completed} completados · ${day.noShows} no-shows · ${day.canceled} cancelados`}>
            <div
              className="w-full flex flex-col justify-end rounded-sm overflow-hidden"
              style={{ height: BAR_H, background: "rgb(var(--color-glass-subtle))" }}
            >
              {totalH > 0 && (
                <div className="w-full flex flex-col" style={{ height: totalH }}>
                  {noShowH > 0 && <div style={{ height: noShowH, background: "rgb(var(--color-danger))", opacity: 0.75 }} />}
                  {canceledH > 0 && <div style={{ height: canceledH, background: "rgb(var(--color-warning))", opacity: 0.65 }} />}
                  {otherH > 0 && <div style={{ height: otherH, background: "rgb(var(--color-info))", opacity: 0.45 }} />}
                  {completedH > 0 && <div style={{ height: completedH, background: "rgb(var(--color-success))", opacity: 0.8 }} />}
                </div>
              )}
            </div>
            {days.length <= 14 && (
              <span className="text-[9px] text-[rgb(var(--color-muted))] truncate w-full text-center">{label}</span>
            )}
          </div>
        )
      })}
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
  const total = Object.values(status).reduce((s, v) => s + v, 0) || 1
  const entries = Object.entries(status).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-2.5">
      {entries.map(([key, count]) => {
        const cfg = TURNO_STATUS_CONFIG[key] ?? { label: key, color: "muted", to: "/turnos" }
        const pct = Math.round((count / total) * 100)
        return (
          <button
            key={key}
            type="button"
            onClick={() => navigate(cfg.to)}
            className="w-full text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex justify-between mb-1">
              <span className="text-xs text-[rgb(var(--color-muted))]">{cfg.label}</span>
              <span className="text-xs font-semibold tabular-nums text-[rgb(var(--color-fg))]">
                {count} <span className="text-[rgb(var(--color-muted))] font-normal">({pct}%)</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-[rgb(var(--color-glass-subtle))]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: `rgb(var(--color-${cfg.color}))` }}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}

function CheckInFlowPanel({ flow, navigate }: { flow: import("@/core/models/dashboard").CheckInFlowStats; navigate: (to: string) => void }) {
  const total = Math.max(flow.solicitados, 1)
  const steps = [
    { label: "Solicitados",  value: flow.solicitados,  pct: 100,                                    color: "info" },
    { label: "Confirmados",  value: flow.confirmados,  pct: Math.round((flow.confirmados / total) * 100),  color: "success" },
    { label: "Rechazados",   value: flow.rechazados,   pct: Math.round((flow.rechazados  / total) * 100),  color: "danger" },
    { label: "Pendientes",   value: flow.pendientes,   pct: Math.round((flow.pendientes  / total) * 100),  color: "warning" },
  ]

  return (
    <div className="space-y-2.5">
      {steps.map((s) => (
        <button key={s.label} type="button" onClick={() => navigate("/turnos?checkInPending=1")} className="w-full text-left hover:opacity-80 transition-opacity">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-[rgb(var(--color-muted))]">{s.label}</span>
            <span className="text-xs font-semibold tabular-nums text-[rgb(var(--color-fg))]">{s.value}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-[rgb(var(--color-glass-subtle))]">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.pct}%`, background: `rgb(var(--color-${s.color}))` }} />
          </div>
        </button>
      ))}
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
  const bars = [
    { label: "Disponibles",    value: capacity.disponibles,   rate: capacity.disponibilidadRate, color: "success" },
    { label: "Asignados",      value: capacity.asignados,     rate: capacity.utilizacionRate,    color: "primary" },
    { label: "No disponibles", value: capacity.noDisponibles, rate: Math.round((capacity.noDisponibles / Math.max(capacity.activos, 1)) * 100), color: "muted" },
  ]

  return (
    <div className="space-y-2.5">
      <div className="flex gap-3 mb-3 flex-wrap">
        {[
          { label: "Activos", value: capacity.activos },
          { label: "Libres",  value: capacity.libres },
          { label: "Penalizados", value: capacity.penalizados },
        ].map((k) => (
          <div key={k.label} className="glass-subtle rounded-lg px-3 py-2 text-center min-w-[64px]">
            <p className="text-lg font-bold tabular-nums text-[rgb(var(--color-fg))]">{k.value}</p>
            <p className="text-[10px] text-[rgb(var(--color-muted))]">{k.label}</p>
          </div>
        ))}
      </div>
      {bars.map((b) => (
        <div key={b.label}>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-[rgb(var(--color-muted))]">{b.label}</span>
            <span className="text-xs font-semibold tabular-nums text-[rgb(var(--color-fg))]">
              {b.value} <span className="text-[rgb(var(--color-muted))] font-normal">({b.rate.toFixed(1)}%)</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-[rgb(var(--color-glass-subtle))]">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${b.rate}%`, background: `rgb(var(--color-${b.color}))` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function EvaluationsPanel({ evals, navigate }: { evals: import("@/core/models/dashboard").EvaluationStats; navigate: (to: string) => void }) {
  const { atencionesEnRango, evaluadas, pendientesEval, avgCalificacion, distribucion } = evals
  const dist = [
    { label: "Satisfactoria",    value: distribucion.SATISFACTORIA,    color: "success" },
    { label: "Con novedades",    value: distribucion.CON_NOVEDADES,    color: "warning" },
    { label: "No satisfactoria", value: distribucion.NO_SATISFACTORIA, color: "danger" },
  ]

  return (
    <div className="space-y-3">
      <div className="flex gap-3 flex-wrap">
        <div className="glass-subtle rounded-lg px-3 py-2 text-center min-w-[72px]">
          <p className="text-lg font-bold tabular-nums text-[rgb(var(--color-fg))]">{atencionesEnRango}</p>
          <p className="text-[10px] text-[rgb(var(--color-muted))]">Cerradas</p>
        </div>
        <div className="glass-subtle rounded-lg px-3 py-2 text-center min-w-[72px]">
          <p className="text-lg font-bold tabular-nums text-[rgb(var(--color-success))]">{evaluadas}</p>
          <p className="text-[10px] text-[rgb(var(--color-muted))]">Evaluadas</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/atenciones?pendingEval=true")}
          className="glass-subtle rounded-lg px-3 py-2 text-center min-w-[72px] hover:opacity-80 transition-opacity"
        >
          <p className="text-lg font-bold tabular-nums text-[rgb(var(--color-warning))]">{pendientesEval}</p>
          <p className="text-[10px] text-[rgb(var(--color-muted))]">Sin eval.</p>
        </button>
        {avgCalificacion !== null && (
          <div className="glass-subtle rounded-lg px-3 py-2 text-center min-w-[72px]">
            <p className="text-lg font-bold tabular-nums text-[rgb(var(--color-info))]">{avgCalificacion.toFixed(1)}</p>
            <p className="text-[10px] text-[rgb(var(--color-muted))]">Promedio</p>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {dist.map((d) => {
          const pct = Math.round((d.value / Math.max(evaluadas, 1)) * 100)
          return (
            <div key={d.label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-[rgb(var(--color-muted))]">{d.label}</span>
                <span className="text-xs font-semibold tabular-nums text-[rgb(var(--color-fg))]">{d.value}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden bg-[rgb(var(--color-glass-subtle))]">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `rgb(var(--color-${d.color}))` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Sub-components — shared ──────────────────────────────────────────────────

function KpiCard({ label, value, color }: { label: string; value?: number; color: "info" | "success" | "warning" | "danger" | "neutral" }) {
  const colorMap: Record<string, string> = {
    info:    "rgb(var(--color-info))",
    success: "rgb(var(--color-success))",
    warning: "rgb(var(--color-warning))",
    danger:  "rgb(var(--color-danger))",
    neutral: "rgb(var(--color-fg))",
  }
  return (
    <div className="glass-subtle rounded-xl p-4 flex flex-col gap-1">
      <p className="text-xs text-[rgb(var(--color-muted))] font-medium truncate">{label}</p>
      <p className="text-2xl font-bold tabular-nums leading-none" style={{ color: colorMap[color] }}>
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

function MilestoneRow({ milestone, navigate }: { milestone: DashboardMilestone; navigate: (to: string) => void }) {
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
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[rgb(var(--color-glass-hover)/0.5)] transition-colors text-left"
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
