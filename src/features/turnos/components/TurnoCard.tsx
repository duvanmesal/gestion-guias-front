"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, User, Play, Square, UserX, UserPlus, UserMinus, Hand, XCircle } from "lucide-react"
import { GlassCard } from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { GlassModal, GlassModalFooter } from "@/shared/components/glass/GlassModal"
import { GlassTextarea } from "@/shared/components/glass/GlassTextarea"
import { useToast } from "@/shared/components/feedback/Toast"
import { useTurno } from "@/hooks/use-turnos"
import { useMe } from "@/hooks/use-me"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import type { TurnoListItem, TurnoStatus } from "@/core/models/turnos"
import { extractApiError } from "@/core/utils/api-error"
import { TurnoStatusBadge } from "./TurnoStatusBadge"
import { AssignTurnoDialog } from "./AssignTurnoDialog"

interface TurnoCardProps {
  turno: TurnoListItem
  index?: number
  canOperate?: boolean
  onRefresh?: () => void
  /**
   * When provided, used to enforce that a guía can only claim the turno
   * that matches the first available `numero` of its atencion.
   */
  firstAvailableTurnoId?: number | null
}

const statusColors: Record<TurnoStatus, string> = {
  AVAILABLE: "border-green-500/30 bg-green-500/5",
  ASSIGNED: "border-blue-500/30 bg-blue-500/5",
  IN_PROGRESS: "border-yellow-500/30 bg-yellow-500/5",
  COMPLETED: "border-purple-500/30 bg-purple-500/5",
  CANCELED: "border-gray-500/30 bg-gray-500/5",
  NO_SHOW: "border-red-500/30 bg-red-500/5",
}

export function TurnoCard({
  turno,
  index = 0,
  canOperate = false,
  onRefresh,
  firstAvailableTurnoId,
}: TurnoCardProps) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { me } = useMe()
  const { showToast } = useToast()
  const {
    checkInTurnoAsync,
    checkOutTurnoAsync,
    unassignTurnoAsync,
    noShowTurnoAsync,
    cancelTurnoAsync,
    claimTurnoAsync,
    isCheckingIn,
    isCheckingOut,
    isUnassigning,
    isMarkingNoShow,
    isCanceling,
    isClaiming,
  } = useTurno(turno.id)

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelError, setCancelError] = useState<string | null>(null)

  const isSupervisor = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR
  const isGuia = user?.rol === Rol.GUIA
  const isMyTurno = turno.guia?.usuario?.id === user?.id
  const actionsEnabled = canOperate

  const handleCheckIn = async () => {
    try {
      await checkInTurnoAsync()
      showToast("success", "Check-in realizado")
      onRefresh?.()
    } catch (error) {
      showToast("error", "Error al realizar check-in")
    }
  }

  const handleCheckOut = async () => {
    try {
      await checkOutTurnoAsync()
      showToast("success", "Check-out realizado")
      onRefresh?.()
    } catch (error) {
      showToast("error", "Error al realizar check-out")
    }
  }

  const handleUnassign = async () => {
    try {
      await unassignTurnoAsync({ reason: "Liberado por supervisor" })
      showToast("success", "Turno liberado")
      onRefresh?.()
    } catch (error) {
      showToast("error", "Error al liberar turno")
    }
  }

  const handleNoShow = async () => {
    try {
      await noShowTurnoAsync({ reason: "No se presento" })
      showToast("success", "Turno marcado como no-show")
      onRefresh?.()
    } catch (error) {
      showToast("error", "Error al marcar no-show")
    }
  }

  const handleClaim = async () => {
    try {
      await claimTurnoAsync()
      showToast("success", "Turno reclamado exitosamente")
      onRefresh?.()
    } catch (error) {
      showToast("error", extractApiError(error))
    }
  }

  const handleCancel = async () => {
    const reason = cancelReason.trim()
    if (reason.length < 3) {
      setCancelError("Ingresa un motivo de cancelacion de al menos 3 caracteres")
      return
    }

    try {
      await cancelTurnoAsync({ cancelReason: reason })
      showToast("success", "Turno cancelado")
      setIsCancelDialogOpen(false)
      setCancelReason("")
      setCancelError(null)
      onRefresh?.()
    } catch (error) {
      showToast("error", "Error al cancelar turno")
    }
  }

  const canCheckIn = actionsEnabled && isGuia && isMyTurno && turno.status === "ASSIGNED"
  const canCheckOut = actionsEnabled && isGuia && isMyTurno && turno.status === "IN_PROGRESS"
  const assignmentMode = me?.turnoAssignmentMode ?? user?.turnoAssignmentMode ?? "MANUAL_RECLAMO"
  const guiaDisponible = me?.disponibleParaTurnos ?? user?.disponibleParaTurnos ?? false
  const guiaPenalizado = me?.pendingPenalty ?? user?.pendingPenalty ?? false
  const isFirstAvailableTurno =
    firstAvailableTurnoId == null ? true : firstAvailableTurnoId === turno.id
  const canClaim =
    actionsEnabled &&
    isGuia &&
    assignmentMode === "MANUAL_RECLAMO" &&
    guiaDisponible &&
    !guiaPenalizado &&
    turno.status === "AVAILABLE" &&
    isFirstAvailableTurno
  const canAssign = actionsEnabled && isSupervisor && turno.status === "AVAILABLE"
  const canUnassign = actionsEnabled && isSupervisor && turno.status === "ASSIGNED"
  const canMarkNoShow = actionsEnabled && isSupervisor && turno.status === "ASSIGNED"
  const canCancel = actionsEnabled && isSupervisor && (turno.status === "AVAILABLE" || turno.status === "ASSIGNED")

  return (
    <>
      <GlassCard
        className={`animate-fade-in-up border-2 ${statusColors[turno.status]}`}
        style={{ animationDelay: `${index * 0.02}s` }}
      >
        <div className="space-y-2">
          {/* Number and Status */}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-[rgb(var(--color-fg))]">#{turno.numero}</span>
            <TurnoStatusBadge status={turno.status} />
          </div>

          {/* Guia Info */}
          {turno.guia && (
            <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-muted))]">
              <User className="w-4 h-4" />
              <span className="truncate">
                {turno.guia.usuario?.nombres || turno.guia.usuario?.email || "Guia asignado"}
              </span>
            </div>
          )}

          {/* Times */}
          {turno.checkInAt && (
            <p className="text-xs text-green-500">
              In: {new Date(turno.checkInAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          {turno.checkOutAt && (
            <p className="text-xs text-purple-500">
              Out: {new Date(turno.checkOutAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-1 pt-2">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/turnos/${turno.id}`)}
              aria-label={`Ver turno ${turno.numero}`}
            >
              <Eye className="w-3 h-3" />
            </GlassButton>
            {canCheckIn && (
              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleCheckIn}
                loading={isCheckingIn}
                className="flex-1"
              >
                <Play className="w-3 h-3" />
                Iniciar
              </GlassButton>
            )}
            {canCheckOut && (
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={handleCheckOut}
                loading={isCheckingOut}
                className="flex-1"
              >
                <Square className="w-3 h-3" />
                Finalizar
              </GlassButton>
            )}
            {canClaim && (
              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleClaim}
                loading={isClaiming}
                className="flex-1"
              >
                <Hand className="w-3 h-3" />
                Reclamar
              </GlassButton>
            )}
            {canAssign && (
              <GlassButton
                variant="glass"
                size="sm"
                onClick={() => setIsAssignDialogOpen(true)}
                className="flex-1"
              >
                <UserPlus className="w-3 h-3" />
              </GlassButton>
            )}
            {canUnassign && (
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={handleUnassign}
                loading={isUnassigning}
              >
                <UserMinus className="w-3 h-3" />
              </GlassButton>
            )}
            {canMarkNoShow && (
              <GlassButton
                variant="danger"
                size="sm"
                onClick={handleNoShow}
                loading={isMarkingNoShow}
              >
                <UserX className="w-3 h-3" />
              </GlassButton>
            )}
            {canCancel && (
              <GlassButton
                variant="danger"
                size="sm"
                onClick={() => setIsCancelDialogOpen(true)}
                loading={isCanceling}
              >
                <XCircle className="w-3 h-3" />
              </GlassButton>
            )}
          </div>
        </div>
      </GlassCard>

      <AssignTurnoDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        turnoId={turno.id}
        turnoNumero={turno.numero}
        onSuccess={() => {
          setIsAssignDialogOpen(false)
          onRefresh?.()
        }}
      />

      <GlassModal
        isOpen={isCancelDialogOpen}
        onClose={() => {
          if (!isCanceling) {
            setIsCancelDialogOpen(false)
            setCancelReason("")
            setCancelError(null)
          }
        }}
        title={`Cancelar turno #${turno.numero}`}
        description="Esta accion retira el cupo de la operacion sin borrar el historial."
      >
        <div className="space-y-4">
          <GlassTextarea
            label="Motivo de cancelacion"
            value={cancelReason}
            onChange={(event) => {
              setCancelReason(event.target.value)
              setCancelError(null)
            }}
            error={cancelError ?? undefined}
            placeholder="Describe el motivo de la cancelacion..."
          />
        </div>
        <GlassModalFooter>
          <GlassButton
            variant="ghost"
            onClick={() => {
              setIsCancelDialogOpen(false)
              setCancelReason("")
              setCancelError(null)
            }}
            disabled={isCanceling}
          >
            Volver
          </GlassButton>
          <GlassButton variant="danger" onClick={handleCancel} loading={isCanceling}>
            Cancelar turno
          </GlassButton>
        </GlassModalFooter>
      </GlassModal>
    </>
  )
}
