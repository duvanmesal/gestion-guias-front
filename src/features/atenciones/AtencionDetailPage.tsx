"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  Users,
  Edit,
  Lock,
  XCircle,
  Hand,
  Ship,
} from "lucide-react"
import { AppShell } from "@/shared/components/layout/AppShell"
import { GlassCard, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useAtencion, useAtencionTurnos, useAtencionSummary } from "@/hooks/use-atenciones"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import { useMe } from "@/hooks/use-me"
import { extractApiError } from "@/core/utils/api-error"
import { useTurnoSocket } from "@/hooks/use-turno-socket"
import { AtencionStatusBadge } from "./components/AtencionStatusBadge"
import { AtencionFormDialog } from "./components/AtencionFormDialog"
import { CancelAtencionDialog } from "./components/CancelAtencionDialog"
import { TurnoCard } from "../turnos/components/TurnoCard"
import { DisponibilidadQueuePanel } from "./components/DisponibilidadQueuePanel"

export function AtencionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { me } = useMe()
  const { showToast } = useToast()

const atencionId = id ? Number(id) : null
  useTurnoSocket({ atencionId: atencionId ?? undefined })
  const {
    atencion,
    isLoading,
    closeAtencionAsync,
    claimTurnoAsync,
    isClosing,
    isClaiming,
  } = useAtencion(atencionId)
  const { turnos, isLoading: loadingTurnos, refetch: refetchTurnos } = useAtencionTurnos(atencionId)
  const { summary, refetch: refetchSummary } = useAtencionSummary(atencionId)

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  const canEdit = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR
  const canOperate = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR
  const isGuia = user?.rol === Rol.GUIA
  const assignmentMode = me?.turnoAssignmentMode ?? user?.turnoAssignmentMode ?? "MANUAL_RECLAMO"
  const guiaDisponible =
    me?.disponibleParaTurnos ?? user?.disponibleParaTurnos ?? false
  const guiaPenalizado = me?.pendingPenalty ?? user?.pendingPenalty ?? false

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-CO", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDuration = () => {
    if (!atencion) return ""
    const start = new Date(atencion.fechaInicio)
    const end = new Date(atencion.fechaFin)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${diffHours}h ${diffMins}m`
  }

  const handleClose = async () => {
    try {
      await closeAtencionAsync()
      showToast("success", "Atencion cerrada exitosamente")
    } catch {
      // global handler shows error toast
    }
  }

const handleClaim = async () => {
    try {
      await claimTurnoAsync()
      showToast("success", "Turno asignado exitosamente")
      refetchTurnos()
      refetchSummary()
    } catch (error) {
      showToast("error", extractApiError(error))
    }
  }

// Use summary from backend or fallback to counting locally
  const turnoStats = summary
    ? {
        available: summary.availableCount,
        assigned: summary.assignedCount,
        inProgress: summary.inProgressCount,
        completed: summary.completedCount,
        noShow: summary.noShowCount,
        canceled: summary.canceledCount,
      }
    : {
        available: turnos.filter((t) => t.status === "AVAILABLE").length,
        assigned: turnos.filter((t) => t.status === "ASSIGNED").length,
        inProgress: turnos.filter((t) => t.status === "IN_PROGRESS").length,
        completed: turnos.filter((t) => t.status === "COMPLETED").length,
        noShow: turnos.filter((t) => t.status === "NO_SHOW").length,
        canceled: turnos.filter((t) => t.status === "CANCELED").length,
      }

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    )
  }

  if (!atencion) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <p className="text-[rgb(var(--color-muted))]">Atencion no encontrada</p>
          <GlassButton variant="ghost" onClick={() => navigate("/recaladas")} className="mt-4">
            <ArrowLeft className="w-4 h-4" />
            Volver a recaladas
          </GlassButton>
        </div>
      </AppShell>
    )
  }

  const guiaAlreadyHasTurnoInAtencion = isGuia
    ? turnos.some((t) => t.guia?.usuario?.id === user?.id)
    : false
  const firstAvailableTurnoId = [...turnos]
    .filter((t) => t.status === "AVAILABLE" && !t.guia)
    .sort((a, b) => a.numero - b.numero)[0]?.id ?? null
  const canCloseAtencion = atencion.operationalStatus === "OPEN"
  const canCancelAtencion = atencion.operationalStatus === "OPEN"
  const canClaimTurno =
    isGuia &&
    assignmentMode === "MANUAL_RECLAMO" &&
    guiaDisponible &&
    !guiaPenalizado &&
    !guiaAlreadyHasTurnoInAtencion &&
    atencion.operationalStatus === "OPEN" &&
    turnoStats.available > 0

  const showDisponibilidadQueue = canOperate && atencion.operationalStatus === "OPEN"

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back link */}
        <div className="animate-fade-in-up">
          <button
            onClick={() => atencion.recaladaId ? navigate(`/recaladas/${atencion.recaladaId}`) : navigate("/recaladas")}
            className="flex items-center gap-2 text-sm text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-primary))] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la recalada
          </button>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[rgb(var(--color-accent)/0.15)] flex items-center justify-center">
              <CalendarClock className="w-7 h-7 text-[rgb(var(--color-accent))]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">
                  Atencion #{atencion.id}
                </h1>
                <AtencionStatusBadge status={atencion.operationalStatus} size="md" />
              </div>
              {atencion.recalada && (
                <p className="text-[rgb(var(--color-muted))] flex items-center gap-2">
                  <Ship className="w-4 h-4" />
                  {atencion.recalada.buque.nombre} - {atencion.recalada.codigoRecalada}
                </p>
              )}
            </div>
          </div>
          {canEdit && atencion.operationalStatus === "OPEN" && (
            <GlassButton variant="ghost" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="w-4 h-4" />
              Editar
            </GlassButton>
          )}
        </div>

        {/* Two-column layout */}
        <div className="lg:grid lg:grid-cols-[1fr_272px] lg:gap-6 space-y-6 lg:space-y-0">
          {/* LEFT — main content */}
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[rgb(var(--color-primary)/0.1)] flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div>
                    <p className="text-sm text-[rgb(var(--color-muted))]">Ventana</p>
                    <p className="font-semibold text-[rgb(var(--color-fg))] text-sm">
                      {formatTime(atencion.fechaInicio)} - {formatTime(atencion.fechaFin)}
                    </p>
                    <p className="text-xs text-[rgb(var(--color-muted))]">{getDuration()}</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-[rgb(var(--color-muted))]">Disponibles</p>
                    <p className="font-semibold text-[rgb(var(--color-fg))]">{turnoStats.available}</p>
                    <p className="text-xs text-[rgb(var(--color-muted))]">de {atencion.turnosTotal}</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-[rgb(var(--color-muted))]">Asignados</p>
                    <p className="font-semibold text-[rgb(var(--color-fg))]">{turnoStats.assigned}</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-[rgb(var(--color-muted))]">Completados</p>
                    <p className="font-semibold text-[rgb(var(--color-fg))]">{turnoStats.completed}</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Schedule Info */}
            <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
              <h2 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Programacion</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-[rgb(var(--color-muted))]">Fecha</p>
                  <p className="font-semibold text-[rgb(var(--color-fg))]">{formatDate(atencion.fechaInicio)}</p>
                </div>
                <div>
                  <p className="text-sm text-[rgb(var(--color-muted))]">Horario</p>
                  <p className="font-semibold text-[rgb(var(--color-fg))]">
                    {formatTime(atencion.fechaInicio)} a {formatTime(atencion.fechaFin)}
                  </p>
                </div>
              </div>
              {atencion.descripcion && (
                <div className="mt-4 pt-4 border-t border-[rgb(var(--color-border)/0.06)]">
                  <p className="text-sm text-[rgb(var(--color-muted))]">{atencion.descripcion}</p>
                </div>
              )}
            </GlassCard>

            {/* Turnero */}
            <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <h2 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">
                Turnero ({turnos.length} turnos)
              </h2>

              {loadingTurnos ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : turnos.length === 0 ? (
                <GlassCard>
                  <GlassCardContent>
                    <div className="py-8 text-center">
                      <p className="text-[rgb(var(--color-muted))]">No hay turnos para esta atencion</p>
                    </div>
                  </GlassCardContent>
                </GlassCard>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {turnos.map((turno, index) => (
                    <TurnoCard
                      key={turno.id}
                      turno={turno}
                      index={index}
                      canOperate={canOperate}
                      onRefresh={refetchTurnos}
                      firstAvailableTurnoId={firstAvailableTurnoId}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — operations + metadata */}
          <div className="space-y-4">
            {/* Supervisor: cola de disponibilidad */}
            {showDisponibilidadQueue && (
              <DisponibilidadQueuePanel
                atencionId={atencion.id}
                turnosTotal={atencion.turnosTotal}
              />
            )}

            {(canOperate || canClaimTurno) && (canCloseAtencion || canCancelAtencion || canClaimTurno) && (
              <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
                <h3 className="text-sm font-semibold text-[rgb(var(--color-fg))] mb-3">Operaciones</h3>
                <div className="flex flex-col gap-2">
                  {canClaimTurno && (
                    <GlassButton variant="primary" fullWidth onClick={handleClaim} loading={isClaiming}>
                      <Hand className="w-4 h-4" />
                      Tomar primer turno disponible
                    </GlassButton>
                  )}
                  {canOperate && canCloseAtencion && (
                    <GlassButton variant="secondary" fullWidth onClick={handleClose} loading={isClosing}>
                      <Lock className="w-4 h-4" />
                      Cerrar Atencion
                    </GlassButton>
                  )}
                  {canOperate && canCancelAtencion && (
                    <GlassButton variant="danger" fullWidth onClick={() => setIsCancelDialogOpen(true)}>
                      <XCircle className="w-4 h-4" />
                      Cancelar Atencion
                    </GlassButton>
                  )}
                </div>
              </GlassCard>
            )}

            <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <h3 className="text-sm font-semibold text-[rgb(var(--color-fg))] mb-3">Detalles</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[rgb(var(--color-muted))]">Total turnos</p>
                  <p className="font-medium text-[rgb(var(--color-fg))]">{atencion.turnosTotal}</p>
                </div>
                <div>
                  <p className="text-[rgb(var(--color-muted))]">No-show</p>
                  <p className="font-medium text-[rgb(var(--color-fg))]">{turnoStats.noShow}</p>
                </div>
                <div>
                  <p className="text-[rgb(var(--color-muted))]">Cancelados</p>
                  <p className="font-medium text-[rgb(var(--color-fg))]">{turnoStats.canceled}</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AtencionFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        atencion={atencion}
        recaladaWindow={
          atencion.recalada?.fechaLlegada
            ? {
                fechaLlegada: atencion.recalada.fechaLlegada,
                fechaSalida: atencion.recalada.fechaSalida,
              }
            : undefined
        }
        onSuccess={() => {
          setIsEditDialogOpen(false)
          showToast("success", "Atencion actualizada exitosamente")
        }}
      />

      <CancelAtencionDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        atencionId={atencion.id}
        onSuccess={() => {
          setIsCancelDialogOpen(false)
          showToast("success", "Atencion cancelada")
        }}
      />
    </AppShell>
  )
}
