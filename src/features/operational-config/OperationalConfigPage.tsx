"use client"

import { useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Hand,
  ListOrdered,
  Search,
} from "lucide-react"

import { AppShell } from "@/shared/components/layout/AppShell"
import {
  GlassCard,
  GlassCardContent,
} from "@/shared/components/glass/GlassCard"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useGuidesLookup } from "@/hooks/use-guides"
import { useOperationalConfig } from "@/hooks/use-operational-config"
import type { TurnoAssignmentMode } from "@/core/models/auth"

type ModeMeta = {
  value: TurnoAssignmentMode
  label: string
  shortLabel: string
  description: string
  icon: typeof Hand
}

const MODES: ModeMeta[] = [
  {
    value: "MANUAL_RECLAMO",
    shortLabel: "Manual",
    label: "Reclamo manual",
    description: "El guía disponible reclama un cupo desde la app.",
    icon: Hand,
  },
  {
    value: "FIFO_GLOBAL",
    shortLabel: "FIFO",
    label: "FIFO automático",
    description: "El sistema asigna turnos por orden de disponibilidad.",
    icon: ListOrdered,
  },
]

type GuideFilter = "todos" | "disponibles" | "no-disponibles" | "penalizados"

const FILTERS: Array<{ id: GuideFilter; label: string }> = [
  { id: "todos", label: "Todos" },
  { id: "disponibles", label: "Disponibles" },
  { id: "no-disponibles", label: "No disponibles" },
  { id: "penalizados", label: "Penalizados" },
]

function formatDateTime(value?: string | null) {
  if (!value) return "Sin registro"
  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function formatRelative(value?: string | null) {
  if (!value) return null
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "Hace instantes"
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `Hace ${days} d`
}

function buildInitials(nombres?: string | null, apellidos?: string | null, email?: string) {
  const first = (nombres ?? "").trim().charAt(0)
  const last = (apellidos ?? "").trim().charAt(0)
  const combo = `${first}${last}`.toUpperCase()
  if (combo) return combo
  return (email?.charAt(0) ?? "?").toUpperCase()
}

export function OperationalConfigPage() {
  const { showToast } = useToast()
  const { config, isLoading, updateModeAsync, isUpdatingMode } = useOperationalConfig()
  const { guides, isLoading: isLoadingGuides } = useGuidesLookup({
    activo: true,
    pageSize: 500,
  })

  const [filter, setFilter] = useState<GuideFilter>("todos")
  const [query, setQuery] = useState("")

  const currentMode = config?.turnoAssignmentMode ?? "MANUAL_RECLAMO"
  const disponibles = useMemo(
    () => guides.filter((g) => g.disponibleParaTurnos && !g.pendingPenalty).length,
    [guides]
  )
  const noDisponibles = useMemo(
    () => guides.filter((g) => !g.disponibleParaTurnos && !g.pendingPenalty).length,
    [guides]
  )
  const penalizados = useMemo(
    () => guides.filter((g) => g.pendingPenalty).length,
    [guides]
  )

  const filteredGuides = useMemo(() => {
    const q = query.trim().toLowerCase()
    return guides.filter((g) => {
      if (filter === "disponibles" && (!g.disponibleParaTurnos || g.pendingPenalty)) return false
      if (filter === "no-disponibles" && (g.disponibleParaTurnos || g.pendingPenalty)) return false
      if (filter === "penalizados" && !g.pendingPenalty) return false
      if (!q) return true
      const name = `${g.nombres ?? ""} ${g.apellidos ?? ""}`.toLowerCase()
      return name.includes(q) || g.email?.toLowerCase().includes(q)
    })
  }, [guides, filter, query])

  const handleModeChange = async (mode: TurnoAssignmentMode) => {
    if (mode === currentMode) return

    try {
      await updateModeAsync(mode)
      showToast("success", "Modo de asignación actualizado")
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ??
        "No fue posible actualizar la configuración operativa"
      showToast("error", message)
    }
  }

  const activeMeta = MODES.find((m) => m.value === currentMode) ?? MODES[0]

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up">
          <p
            className="text-[11px] font-semibold uppercase mb-1"
            style={{
              color: "rgb(var(--color-muted))",
              letterSpacing: "0.12em",
            }}
          >
            Administración
          </p>
          <h1
            className="text-3xl font-bold"
            style={{
              color: "rgb(var(--color-fg))",
              letterSpacing: "-0.02em",
            }}
          >
            Configuración operativa
          </h1>
          <p
            className="text-sm mt-1.5"
            style={{ color: "rgb(var(--color-muted))" }}
          >
            Define cómo se asignan los turnos y revisa el estado del equipo en tiempo real.
          </p>
        </div>

        {/* KPI strip */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up"
          style={{ animationDelay: "0.05s" }}
        >
          <KpiTile
            label="Modo activo"
            value={activeMeta.shortLabel}
            sublabel={formatRelative(config?.updatedAt) ?? "Sin cambios"}
            accent="primary"
          />
          <KpiTile
            label="Disponibles"
            value={String(disponibles)}
            sublabel={`${guides.length} guías activos`}
            accent="success"
          />
          <KpiTile
            label="No disponibles"
            value={String(noDisponibles)}
            sublabel="Sin tomar turnos"
            accent="neutral"
          />
          <KpiTile
            label="Penalizados"
            value={String(penalizados)}
            sublabel={penalizados ? "Requiere revisión" : "Todo en orden"}
            accent="warning"
          />
        </div>

        {/* Mode selector */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <SectionTitle
            eyebrow="Modo de asignación"
            title="¿Cómo se reparten los turnos?"
          />

          {isLoading ? (
            <Skeleton height="8rem" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {MODES.map((mode) => {
                const active = currentMode === mode.value
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => handleModeChange(mode.value)}
                    disabled={isUpdatingMode}
                    className="rounded-2xl p-4 text-left transition-all focus-ring disabled:opacity-60"
                    style={{
                      background: active
                        ? "rgba(var(--color-primary), 0.06)"
                        : "rgb(var(--color-bg-elevated))",
                      border: active
                        ? "1.5px solid rgba(var(--color-primary), 0.45)"
                        : "1px solid rgba(var(--color-border), 0.07)",
                      boxShadow: active ? "var(--shadow-md)" : "var(--shadow-sm)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: active
                            ? "var(--gradient-primary)"
                            : "rgba(var(--color-border), 0.05)",
                          color: active ? "white" : "rgb(var(--color-fg))",
                        }}
                      >
                        <mode.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "rgb(var(--color-fg))" }}
                          >
                            {mode.label}
                          </p>
                          {active && (
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                              style={{
                                background: "rgba(var(--color-primary), 0.12)",
                                color: "rgb(var(--color-primary))",
                                letterSpacing: "0.05em",
                              }}
                            >
                              ACTIVO
                            </span>
                          )}
                        </div>
                        <p
                          className="mt-1 text-xs leading-relaxed"
                          style={{ color: "rgb(var(--color-muted))" }}
                        >
                          {mode.description}
                        </p>
                      </div>
                      {active && (
                        <CheckCircle2
                          className="w-4 h-4 shrink-0"
                          style={{ color: "rgb(var(--color-primary))" }}
                        />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <p
            className="text-xs mt-3 flex items-center gap-1.5"
            style={{ color: "rgb(var(--color-muted))" }}
          >
            <Clock3 className="w-3 h-3" />
            Última actualización: {formatDateTime(config?.updatedAt)}
          </p>
        </div>

        {/* Guides */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4">
            <SectionTitle
              eyebrow="Equipo"
              title="Disponibilidad de guías"
              description={`${filteredGuides.length} de ${guides.length} guías`}
            />

            <div className="relative w-full md:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "rgb(var(--color-muted))" }}
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar guía…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl focus-ring"
                style={{
                  background: "rgb(var(--color-bg-elevated))",
                  border: "1px solid rgba(var(--color-border), 0.08)",
                  color: "rgb(var(--color-fg))",
                }}
              />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {FILTERS.map((f) => {
              const active = filter === f.id
              const count =
                f.id === "todos"
                  ? guides.length
                  : f.id === "disponibles"
                    ? disponibles
                    : f.id === "no-disponibles"
                      ? noDisponibles
                      : penalizados
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors focus-ring"
                  style={{
                    background: active
                      ? "rgb(var(--color-fg))"
                      : "rgb(var(--color-bg-elevated))",
                    color: active
                      ? "rgb(var(--color-bg-elevated))"
                      : "rgb(var(--color-fg))",
                    border: active
                      ? "1px solid rgb(var(--color-fg))"
                      : "1px solid rgba(var(--color-border), 0.08)",
                  }}
                >
                  <span>{f.label}</span>
                  <span
                    className="text-[10px] tabular-nums"
                    style={{ opacity: 0.7 }}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Guide list */}
          {isLoadingGuides ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Skeleton height="4.5rem" />
              <Skeleton height="4.5rem" />
              <Skeleton height="4.5rem" />
              <Skeleton height="4.5rem" />
            </div>
          ) : filteredGuides.length === 0 ? (
            <GlassCard>
              <GlassCardContent>
                <p
                  className="text-sm text-center py-4"
                  style={{ color: "rgb(var(--color-muted))" }}
                >
                  No hay guías que coincidan con este filtro.
                </p>
              </GlassCardContent>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredGuides.map((guide) => {
                const status: "disponible" | "no-disponible" | "penalizado" = guide.pendingPenalty
                  ? "penalizado"
                  : guide.disponibleParaTurnos
                    ? "disponible"
                    : "no-disponible"

                const statusStyle = {
                  disponible: {
                    label: "Disponible",
                    fg: "rgb(var(--color-success))",
                    bg: "rgba(var(--color-success), 0.10)",
                    dot: "rgb(var(--color-success))",
                  },
                  "no-disponible": {
                    label: "No disponible",
                    fg: "rgb(var(--color-muted))",
                    bg: "rgba(var(--color-border), 0.05)",
                    dot: "rgb(var(--color-muted))",
                  },
                  penalizado: {
                    label: "Penalizado",
                    fg: "rgb(var(--color-warning))",
                    bg: "rgba(var(--color-warning), 0.10)",
                    dot: "rgb(var(--color-warning))",
                  },
                }[status]

                const fullName =
                  `${guide.nombres ?? ""} ${guide.apellidos ?? ""}`.trim() || guide.email
                const initials = buildInitials(guide.nombres, guide.apellidos, guide.email)
                const relative = formatRelative(guide.disponibilidadUpdatedAt)

                return (
                  <div
                    key={guide.guiaId}
                    className="rounded-2xl p-4"
                    style={{
                      background: "rgb(var(--color-bg-elevated))",
                      border: "1px solid rgba(var(--color-border), 0.07)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: "rgba(var(--color-primary), 0.10)",
                          color: "rgb(var(--color-primary))",
                        }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-sm font-semibold"
                          style={{ color: "rgb(var(--color-fg))" }}
                        >
                          {fullName}
                        </p>
                        <p
                          className="truncate text-xs"
                          style={{ color: "rgb(var(--color-muted))" }}
                        >
                          {guide.email}
                        </p>
                      </div>
                      <span
                        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shrink-0"
                        style={{ background: statusStyle.bg, color: statusStyle.fg }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: statusStyle.dot }}
                        />
                        {statusStyle.label}
                      </span>
                    </div>
                    <div
                      className="mt-3 pt-3 flex items-center justify-between text-[11px]"
                      style={{
                        borderTop: "1px dashed rgba(var(--color-border), 0.08)",
                        color: "rgb(var(--color-muted))",
                      }}
                    >
                      <span className="flex items-center gap-1.5">
                        <Clock3 className="w-3 h-3" />
                        {relative ?? "Sin actividad"}
                      </span>
                      {guide.pendingPenalty && (
                        <span
                          className="flex items-center gap-1"
                          style={{ color: "rgb(var(--color-warning))" }}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Penalización pendiente
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div>
      <p
        className="text-[11px] font-semibold uppercase"
        style={{
          color: "rgb(var(--color-muted))",
          letterSpacing: "0.12em",
        }}
      >
        {eyebrow}
      </p>
      <h2
        className="text-xl font-bold mt-0.5"
        style={{
          color: "rgb(var(--color-fg))",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          className="text-xs mt-1"
          style={{ color: "rgb(var(--color-muted))" }}
        >
          {description}
        </p>
      )}
    </div>
  )
}

function KpiTile({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string
  value: string
  sublabel: string
  accent: "primary" | "success" | "warning" | "neutral"
}) {
  const accentColor =
    accent === "primary"
      ? "rgb(var(--color-primary))"
      : accent === "success"
        ? "rgb(var(--color-success))"
        : accent === "warning"
          ? "rgb(var(--color-warning))"
          : "rgb(var(--color-muted))"

  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: "rgb(var(--color-bg-elevated))",
        border: "1px solid rgba(var(--color-border), 0.07)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{ background: accentColor, opacity: 0.7 }}
      />
      <p
        className="text-[10.5px] font-semibold uppercase ml-2"
        style={{
          color: "rgb(var(--color-muted))",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold mt-1 ml-2 tabular-nums"
        style={{
          color: "rgb(var(--color-fg))",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
      <p
        className="text-[11px] mt-1 ml-2 truncate"
        style={{ color: "rgb(var(--color-muted))" }}
      >
        {sublabel}
      </p>
    </div>
  )
}
