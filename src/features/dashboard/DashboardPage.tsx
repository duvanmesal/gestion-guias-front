// src/features/dashboard/DashboardPage.tsx
"use client"

import { useMemo, type CSSProperties } from "react"
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
  GuiaOverview,
  TrendDay,
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

function shortDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("es-CO", { weekday: "short" }).slice(0, 3)
}

// ─── main page ───────────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isSupervisor = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR
  const isGuia = user?.rol === Rol.GUIA

  useTurnoSocket()
  useRecaladaSocket()

  const { data: healthData, isLoading: isLoadingHealth } = useQuery({
    queryKey: ["health"],
    queryFn: async () => { const r = await healthApi.check(); return r.data },
    refetchInterval: 30_000,
  })
  const apiOk = !!healthData

  const { overview, isLoading } = useDashboardOverview({ enabled: !!user })

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
            />
          : null
      }
    </AppShell>
  )
}

// ─── SupervisorDashboard ──────────────────────────────────────────────────────

interface DashProps {
  overview: DashboardOverview | null
  isLoadingHealth: boolean
  apiOk: boolean
  quickLinks: Array<{ to: string; icon: LucideIcon; label: string; description: string }>
  navigate: (to: string) => void
}

function SupervisorDashboard({ overview, isLoadingHealth, apiOk, quickLinks, navigate }: DashProps) {
  const sup: SupervisorOverview | undefined = overview?.supervisor
  const counts = sup?.counts
  const guides = sup?.guides
  const rates  = sup?.rates
  const pending = sup?.pendingWork
  const trend  = sup?.trend7d?.days ?? []
  const upcoming = sup?.upcoming ?? []

  const operativeDate = overview?.dateContext?.date
    ? formatDateOperative(overview.dateContext.date + "T12:00:00")
    : null

  const hasPendingAlerts = pending
    ? pending.pendingCheckIns > 0 || pending.overdueRecaladas > 0 || pending.unresolvedTurnos > 0
    : false

  return (
    <div className="space-y-5">

      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-in-up">
        <div>
          <p className="text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-widest">
            Dashboard operativo
          </p>
          <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))] leading-tight mt-0.5">
            {operativeDate ?? "Cargando…"}
          </h1>
          {overview?.serverTime && (
            <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">
              Actualizado a las {formatTime(overview.serverTime)} · {overview.dateContext?.timezoneHint ?? ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
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

      {/* ── Pending work alerts ────────────────────────────────────────────── */}
      {hasPendingAlerts && pending && (
        <div className="flex flex-col sm:flex-row gap-2 animate-fade-in-up" style={{ animationDelay: "0.03s" }}>
          {pending.overdueRecaladas > 0 && (
            <button
              type="button"
              onClick={() => navigate("/recaladas")}
              className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors hover:opacity-90 focus-ring"
              style={{ background: "rgb(var(--color-danger)/0.08)", border: "1px solid rgb(var(--color-danger)/0.22)" }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-[rgb(var(--color-danger))]" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[rgb(var(--color-fg))]">
                  {pending.overdueRecaladas === 1 ? "1 recalada vencida" : `${pending.overdueRecaladas} recaladas vencidas`}
                </p>
                <p className="text-xs text-[rgb(var(--color-muted))]">Pendientes de zarpe · Revisar</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 text-[rgb(var(--color-danger))] ml-auto" />
            </button>
          )}
          {pending.pendingCheckIns > 0 && (
            <button
              type="button"
              onClick={() => navigate("/turnos")}
              className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors hover:opacity-90 focus-ring"
              style={{ background: "rgb(var(--color-warning)/0.08)", border: "1px solid rgb(var(--color-warning)/0.22)" }}
            >
              <Timer className="w-4 h-4 shrink-0 text-[rgb(var(--color-warning))]" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[rgb(var(--color-fg))]">
                  {pending.pendingCheckIns === 1 ? "1 check-in pendiente" : `${pending.pendingCheckIns} check-ins pendientes`}
                </p>
                <p className="text-xs text-[rgb(var(--color-muted))]">Requieren confirmación · Ver turnos</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 text-[rgb(var(--color-warning))] ml-auto" />
            </button>
          )}
          {pending.unresolvedTurnos > 0 && (
            <button
              type="button"
              onClick={() => navigate("/turnos")}
              className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors hover:opacity-90 focus-ring"
              style={{ background: "rgb(var(--color-info)/0.07)", border: "1px solid rgb(var(--color-info)/0.20)" }}
            >
              <Activity className="w-4 h-4 shrink-0 text-[rgb(var(--color-info))]" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[rgb(var(--color-fg))]">
                  {pending.unresolvedTurnos === 1 ? "1 turno sin asignar" : `${pending.unresolvedTurnos} turnos sin asignar`}
                </p>
                <p className="text-xs text-[rgb(var(--color-muted))]">Disponibles · Ver turnos</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 text-[rgb(var(--color-info))] ml-auto" />
            </button>
          )}
        </div>
      )}

      {/* ── KPI row ─────────────────────────────────────────────────────────── */}
      <div
        className="grid gap-3 animate-fade-in-up"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", animationDelay: "0.05s" }}
      >
        <KpiCard label="Recaladas" value={counts?.recaladas} color="info" />
        <KpiCard label="Atenciones" value={counts?.atenciones} color="info" />
        <KpiCard label="Turnos" value={counts?.turnos} color="neutral" />
        <KpiCard label="En curso" value={counts?.turnosInProgress} color="warning" />
        <KpiCard label="Completados" value={counts?.turnosDone} color="success" />
        <KpiCard label="No-shows" value={counts?.turnosNoShow} color="danger" />
      </div>

      {/* ── Guides + Rates ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "0.08s" }}>

        {/* Guides card */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[rgb(var(--color-primary)/0.12)] flex items-center justify-center">
                <Users className="w-4 h-4 text-[rgb(var(--color-primary))]" />
              </div>
              <div>
                <GlassCardTitle>Guías operativos</GlassCardTitle>
                <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">Capacidad del día</p>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {guides ? (
              <div className="space-y-2.5">
                <GuideStatRow label="Activos" value={guides.activos} total={guides.activos} color="fg" />
                <GuideStatRow label="Disponibles" value={guides.disponibles ?? 0} total={guides.activos} color="success" />
                <GuideStatRow label="Asignados" value={guides.asignados} total={guides.activos} color="primary" />
                <GuideStatRow label="Sin turno" value={guides.libres} total={guides.activos} color="muted" />
                {(guides.penalizados ?? 0) > 0 && (
                  <GuideStatRow label="Penalizados" value={guides.penalizados ?? 0} total={guides.activos} color="danger" />
                )}
              </div>
            ) : (
              <Skeleton height="6rem" />
            )}
            <div className="mt-3 pt-3 border-t border-[rgb(var(--color-border)/0.5)]">
              <Link to="/users" className="text-xs font-medium text-[rgb(var(--color-primary))] hover:underline">
                Ver guías →
              </Link>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Rates card */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[rgb(var(--color-accent)/0.12)] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[rgb(var(--color-accent))]" />
              </div>
              <div>
                <GlassCardTitle>Tasas operativas</GlassCardTitle>
                <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">Del día en curso</p>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {rates ? (
              <div className="grid grid-cols-2 gap-3">
                <RateCell label="Asignación" value={rates.assignmentRate} color="primary" />
                <RateCell label="Ejecución" value={rates.executionRate} color="success" />
                <RateCell label="No-show" value={rates.noShowRate} color="danger" />
                <RateCell label="Disponibilidad" value={rates.guideAvailabilityRate} color="info" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Skeleton height="4rem" />
                <Skeleton height="4rem" />
                <Skeleton height="4rem" />
                <Skeleton height="4rem" />
              </div>
            )}
          </GlassCardContent>
        </GlassCard>

      </div>

      {/* ── Trend 7d ────────────────────────────────────────────────────────── */}
      {trend.length > 0 && (
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.11s" } as CSSProperties}>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[rgb(var(--color-primary)/0.12)] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                </div>
                <div>
                  <GlassCardTitle>Tendencia 7 días</GlassCardTitle>
                  <p className="text-xs text-[rgb(var(--color-muted))] mt-0.5">Turnos completados vs. no-shows</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[rgb(var(--color-muted))]">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-sm bg-[rgb(var(--color-success))]" /> Completados
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-sm bg-[rgb(var(--color-info))]" /> Otros
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-sm bg-[rgb(var(--color-danger))]" /> No-shows
                </span>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <Trend7dChart days={trend} />
          </GlassCardContent>
        </GlassCard>
      )}

      {/* ── Bottom row: upcoming + quick links ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: "0.14s" }}>

        {/* Upcoming milestones (2/3 width) */}
        <div className="lg:col-span-2">
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

        {/* Quick links */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Accesos rápidos</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-1.5">
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

      </div>
    </div>
  )
}

// ─── GuiaDashboard ────────────────────────────────────────────────────────────

function GuiaDashboard({ overview, isLoadingHealth, apiOk, quickLinks, navigate }: DashProps) {
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

// ─── Sub-components ──────────────────────────────────────────────────────────

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

function GuideStatRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  const colorVarMap: Record<string, string> = {
    fg: "rgb(var(--color-fg))",
    success: "rgb(var(--color-success))",
    primary: "rgb(var(--color-primary))",
    muted: "rgb(var(--color-muted))",
    danger: "rgb(var(--color-danger))",
  }
  const barColor = colorVarMap[color] ?? "rgb(var(--color-primary))"

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[rgb(var(--color-muted))]">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-[rgb(var(--color-fg))]">
          {value} <span className="text-[rgb(var(--color-muted))] font-normal">({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-[rgb(var(--color-glass-subtle))]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  )
}

function RateCell({ label, value, color }: { label: string; value: number; color: string }) {
  const colorVarMap: Record<string, string> = {
    primary: "rgb(var(--color-primary))",
    success: "rgb(var(--color-success))",
    danger:  "rgb(var(--color-danger))",
    info:    "rgb(var(--color-info))",
  }
  const c = colorVarMap[color] ?? "rgb(var(--color-primary))"
  return (
    <div className="glass-subtle rounded-xl p-3 flex flex-col gap-1">
      <p className="text-[11px] text-[rgb(var(--color-muted))] font-medium">{label}</p>
      <p className="text-xl font-bold tabular-nums leading-none" style={{ color: c }}>
        {value.toFixed(1)}<span className="text-sm font-normal text-[rgb(var(--color-muted))]">%</span>
      </p>
    </div>
  )
}

function Trend7dChart({ days }: { days: TrendDay[] }) {
  const maxTurnos = Math.max(...days.map((d) => d.turnos), 1)
  const BAR_HEIGHT = 72

  return (
    <div className="flex items-end gap-1.5" style={{ height: BAR_HEIGHT + 40 }}>
      {days.map((day) => {
        const completedH = Math.round((day.completed / maxTurnos) * BAR_HEIGHT)
        const noShowH    = Math.round((day.noShows / maxTurnos) * BAR_HEIGHT)
        const otherH     = Math.max(0, Math.round((day.turnos / maxTurnos) * BAR_HEIGHT) - completedH - noShowH)
        const totalH     = completedH + noShowH + otherH

        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] tabular-nums text-[rgb(var(--color-muted))]">
              {day.turnos > 0 ? day.turnos : ""}
            </span>
            <div
              className="w-full flex flex-col justify-end rounded-sm overflow-hidden"
              style={{ height: BAR_HEIGHT, background: "rgb(var(--color-glass-subtle))" }}
              title={`${day.date}: ${day.turnos} turnos, ${day.completed} completados, ${day.noShows} no-shows`}
            >
              {totalH > 0 && (
                <div className="w-full flex flex-col" style={{ height: totalH }}>
                  {noShowH > 0 && (
                    <div style={{ height: noShowH, background: "rgb(var(--color-danger))", opacity: 0.75 }} />
                  )}
                  {otherH > 0 && (
                    <div style={{ height: otherH, background: "rgb(var(--color-info))", opacity: 0.55 }} />
                  )}
                  {completedH > 0 && (
                    <div style={{ height: completedH, background: "rgb(var(--color-success))", opacity: 0.8 }} />
                  )}
                </div>
              )}
            </div>
            <span className="text-[10px] text-[rgb(var(--color-muted))] capitalize">
              {shortDayLabel(day.date)}
            </span>
          </div>
        )
      })}
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
