"use client"

import { AlertTriangle, CheckCircle2, Clock3, Settings, Users } from "lucide-react"

import { AppShell } from "@/shared/components/layout/AppShell"
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
} from "@/shared/components/glass/GlassCard"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useGuidesLookup } from "@/hooks/use-guides"
import { useOperationalConfig } from "@/hooks/use-operational-config"
import type { TurnoAssignmentMode } from "@/core/models/auth"

const modes: Array<{
  value: TurnoAssignmentMode
  label: string
  description: string
}> = [
  {
    value: "MANUAL_RECLAMO",
    label: "Reclamo manual",
    description: "El guía disponible toma cupo desde la UI.",
  },
  {
    value: "FIFO_GLOBAL",
    label: "FIFO automático",
    description: "El sistema asigna por disponibilidad global.",
  },
]

function formatDateTime(value?: string | null) {
  if (!value) return "Sin registro"
  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function OperationalConfigPage() {
  const { showToast } = useToast()
  const { config, isLoading, updateModeAsync, isUpdatingMode } = useOperationalConfig()
  const { guides, isLoading: isLoadingGuides } = useGuidesLookup({
    activo: true,
    pageSize: 500,
  })

  const currentMode = config?.turnoAssignmentMode ?? "MANUAL_RECLAMO"
  const disponibles = guides.filter((g) => g.disponibleParaTurnos && !g.pendingPenalty).length
  const penalizados = guides.filter((g) => g.pendingPenalty).length

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

  return (
    <AppShell>
      <div className="max-w-6xl space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgb(var(--color-accent)/0.14)]">
              <Settings className="h-5 w-5 text-[rgb(var(--color-accent))]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">
                Configuración operativa
              </h1>
              <p className="text-sm text-[rgb(var(--color-muted))]">
                Modo global de asignación y disponibilidad actual del equipo.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Modo de asignación de turnos</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              {isLoading ? (
                <Skeleton height="8rem" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {modes.map((mode) => {
                    const active = currentMode === mode.value
                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => handleModeChange(mode.value)}
                        disabled={isUpdatingMode}
                        className={`rounded-xl border p-4 text-left transition-colors focus-ring ${
                          active
                            ? "border-[rgb(var(--color-primary)/0.55)] bg-[rgb(var(--color-primary)/0.10)]"
                            : "border-[rgb(var(--color-border)/0.12)] hover:bg-[rgb(var(--color-glass-hover)/0.4)]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[rgb(var(--color-fg))]">
                              {mode.label}
                            </p>
                            <p className="mt-1 text-xs text-[rgb(var(--color-muted))]">
                              {mode.description}
                            </p>
                          </div>
                          {active && (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[rgb(var(--color-primary))]" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </GlassCardContent>
          </GlassCard>

          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Estado del modo</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-3 text-sm">
                <div className="glass-subtle rounded-xl p-3">
                  <p className="text-xs text-[rgb(var(--color-muted))]">Modo activo</p>
                  <p className="mt-1 font-semibold text-[rgb(var(--color-fg))]">
                    {currentMode === "FIFO_GLOBAL" ? "FIFO automático" : "Reclamo manual"}
                  </p>
                </div>
                <div className="glass-subtle rounded-xl p-3">
                  <p className="text-xs text-[rgb(var(--color-muted))]">Última actualización</p>
                  <p className="mt-1 font-semibold text-[rgb(var(--color-fg))]">
                    {formatDateTime(config?.updatedAt)}
                  </p>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        <GlassCard>
          <GlassCardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <GlassCardTitle>Disponibilidad de guías</GlassCardTitle>
                <p className="text-xs text-[rgb(var(--color-muted))] mt-1">
                  {guides.length} guías activos · {disponibles} disponibles · {penalizados} penalizados
                </p>
              </div>
              <div className="flex gap-2">
                <div className="inline-flex items-center gap-1 rounded-lg bg-[rgb(var(--color-success)/0.12)] px-2.5 py-1 text-xs text-[rgb(var(--color-success))]">
                  <Users className="h-3.5 w-3.5" />
                  {disponibles}
                </div>
                <div className="inline-flex items-center gap-1 rounded-lg bg-[rgb(var(--color-warning)/0.12)] px-2.5 py-1 text-xs text-[rgb(var(--color-warning))]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {penalizados}
                </div>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {isLoadingGuides ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Skeleton height="4.5rem" />
                <Skeleton height="4.5rem" />
              </div>
            ) : guides.length === 0 ? (
              <div className="glass-subtle rounded-xl p-5 text-sm text-[rgb(var(--color-muted))]">
                No hay guías activos para mostrar.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {guides.map((guide) => (
                  <div key={guide.guiaId} className="glass-subtle rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[rgb(var(--color-fg))]">
                          {`${guide.nombres ?? ""} ${guide.apellidos ?? ""}`.trim() || guide.email}
                        </p>
                        <p className="truncate text-xs text-[rgb(var(--color-muted))]">{guide.email}</p>
                      </div>
                      <span
                        className={`rounded-lg px-2 py-1 text-xs font-medium ${
                          guide.pendingPenalty
                            ? "bg-[rgb(var(--color-warning)/0.12)] text-[rgb(var(--color-warning))]"
                            : guide.disponibleParaTurnos
                              ? "bg-[rgb(var(--color-success)/0.12)] text-[rgb(var(--color-success))]"
                              : "bg-[rgb(var(--color-border)/0.08)] text-[rgb(var(--color-muted))]"
                        }`}
                      >
                        {guide.pendingPenalty
                          ? "Penalizado"
                          : guide.disponibleParaTurnos
                            ? "Disponible"
                            : "No disponible"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-[rgb(var(--color-muted))]">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatDateTime(guide.disponibilidadUpdatedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>
    </AppShell>
  )
}
