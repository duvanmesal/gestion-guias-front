"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, User, Square, UserX, UserPlus, UserMinus, Hand, LogIn, XCircle, CheckCircle2, Clock } from "lucide-react"
import { GlassCard } from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { GlassModal, GlassModalFooter } from "@/shared/components/glass/GlassModal"
import { GlassTextarea } from "@/shared/components/glass/GlassTextarea"
import { useToast } from "@/shared/components/feedback/Toast"
import { useTurno } from "@/hooks/use-turnos"
import { useMe } from "@/hooks/use-me"
import { useOperationalConfig } from "@/hooks/use-operational-config"
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
  AVAILABLE: "border-[rgb(var(--color-success)/0.28)] bg-[rgb(var(--color-success)/0.04)]",
  ASSIGNED: "border-[rgb(var(--color-info)/0.28)] bg-[rgb(var(--color-info)/0.04)]",
  IN_PROGRESS: "border-[rgb(var(--color-warning)/0.32)] bg-[rgb(var(--color-warning)/0.05)]",
  COMPLETED: "border-[rgb(var(--color-primary)/0.28)] bg-[rgb(var(--color-primary)/0.04)]",
  CANCELED: "border-[rgb(var(--color-border)/0.6)] bg-[rgb(var(--color-bg)/0.4)]",
  NO_SHOW: "border-[rgb(var(--color-danger)/0.28)] bg-[rgb(var(--color-danger)/0.04)]",
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
    confirmCheckInTurnoAsync,
    rejectCheckInTurnoAsync,
    checkOutTurnoAsync,
    unassignTurnoAsync,
    noShowTurnoAsync,
    cancelTurnoAsync,
    claimTurnoAsync,
    isCheckingIn,
    isConfirmingCheckIn,
    isRejectingCheckIn,
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
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectError, setRejectError] = useState<string | null>(null)
  const [isNoShowDialogOpen, setIsNoShowDialogOpen] = useState(false)
  const [noShowReason, setNoShowReason] = useState("")
  const [noShowError, setNoShowError] = useState<string | null>(null)

  const isSupervisor = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR
  const { config: opConfig } = useOperationalConfig({ enabled: isSupervisor })
  const penaltyHours = opConfig?.noShowPenaltyDurationHours ?? 48
  const isGuia = user?.rol === Rol.GUIA
  const isMyTurno = turno.guia?.usuario?.id === user?.id
  const actionsEnabled = canOperate

  const handleCheckIn = async () => {
    try {
      await checkInTurnoAsync()
      showToast("success", "Solicitud de check-in enviada")
      onRefresh?.()
    } catch (error) {
      showToast("error", extractApiError(error) || "Error al solicitar check-in")
    }
  }

  const handleConfirmCheckIn = async () => {
    try {
      await confirmCheckInTurnoAsync()
      showToast("success", "Check-in confirmado")
      onRefresh?.()
    } catch (error) {
      showToast("error", extractApiError(error) || "Error al confirmar check-in")
    }
  }

  const handleRejectCheckIn = async () => {
    const reason = rejectReason.trim()
    if (reason.length < 3) {
      setRejectError("Ingresa un motivo de al menos 3 caracteres")
      return
    }
    try {
      await rejectCheckInTurnoAsync({ reason })
      showToast("success", "Check-in rechazado")
      setIsRejectDialogOpen(false)
      setRejectReason("")
      setRejectError(null)
      onRefresh?.()
    } catch (error) {
      showToast("error", extractApiError(error) || "Error al rechazar check-in")
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
    const reason = noShowReason.trim()
    if (reason.length < 3) {
      setNoShowError("Ingresa un motivo de al menos 3 caracteres")
      return
    }
    try {
      await noShowTurnoAsync({ reason })
      showToast("success", "Turno marcado como NO_SHOW")
      setIsNoShowDialogOpen(false)
      setNoShowReason("")
      setNoShowError(null)
      onRefresh?.()
    } catch (error) {
      showToast("error", extractApiError(error) || "Error al marcar NO_SHOW")
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

  const hasPendingCheckIn = Boolean(
    turno.checkInRequestedAt && !turno.checkInConfirmedAt && !turno.checkInRejectedAt,
  )
  const wasRejected = Boolean(turno.checkInRejectedAt)
  const canRequestCheckIn =
    actionsEnabled &&
    isGuia &&
    isMyTurno &&
    turno.status === "ASSIGNED" &&
    !hasPendingCheckIn &&
    !wasRejected
  const canConfirmCheckIn =
    actionsEnabled && isSupervisor && turno.status === "ASSIGNED" && hasPendingCheckIn
  const canRejectCheckIn =
    actionsEnabled && isSupervisor && turno.status === "ASSIGNED" && hasPendingCheckIn
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
  const canUnassign =
    actionsEnabled && isSupervisor && turno.status === "ASSIGNED" && !hasPendingCheckIn
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
            <p className="text-xs font-medium text-[rgb(var(--color-success))]">
              In · {new Date(turno.checkInAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          {!turno.checkInAt && turno.checkInRequestedAt && !turno.checkInRejectedAt && (
            <div
              className="inline-flex items-center gap-1 rounded-md border border-[rgb(var(--color-warning)/0.28)] bg-[rgb(var(--color-warning)/0.1)] px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[rgb(var(--color-warning))]"
              role="status"
            >
              <Clock className="h-3 w-3" />
              Pendiente
            </div>
          )}
          {turno.checkInRejectedAt && (
            <p className="text-xs font-medium text-[rgb(var(--color-danger))]">
              Check-in rechazado
            </p>
          )}
          {turno.checkOutAt && (
            <p className="text-xs font-medium text-[rgb(var(--color-primary))]">
              Out · {new Date(turno.checkOutAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
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
            {canRequestCheckIn && (
              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleCheckIn}
                loading={isCheckingIn}
                className="flex-1"
              >
                <LogIn className="w-3 h-3" />
                Solicitar
              </GlassButton>
            )}
            {canConfirmCheckIn && (
              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleConfirmCheckIn}
                loading={isConfirmingCheckIn}
                className="flex-1"
                aria-label={`Confirmar check-in del turno ${turno.numero}`}
              >
                <CheckCircle2 className="w-3 h-3" />
                Confirmar
              </GlassButton>
            )}
            {canRejectCheckIn && (
              <GlassButton
                variant="danger"
                size="sm"
                onClick={() => setIsRejectDialogOpen(true)}
                loading={isRejectingCheckIn}
                aria-label={`Rechazar check-in del turno ${turno.numero}`}
              >
                <XCircle className="w-3 h-3" />
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
                aria-label={`Asignar guía al turno ${turno.numero}`}
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
                aria-label={`Liberar turno ${turno.numero}`}
              >
                <UserMinus className="w-3 h-3" />
              </GlassButton>
            )}
            {canMarkNoShow && (
              <GlassButton
                variant="danger"
                size="sm"
                onClick={() => setIsNoShowDialogOpen(true)}
                loading={isMarkingNoShow}
                aria-label={`Marcar NO_SHOW al turno ${turno.numero}`}
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
                aria-label={`Cancelar turno ${turno.numero}`}
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
        isOpen={isNoShowDialogOpen}
        onClose={() => {
          if (!isMarkingNoShow) {
            setIsNoShowDialogOpen(false)
            setNoShowReason("")
            setNoShowError(null)
          }
        }}
        title={`Marcar NO_SHOW turno #${turno.numero}`}
        description={`Aplica una penalización de ${penaltyHours} h al guía. Indica un motivo claro.`}
      >
        <div className="space-y-4">
          <GlassTextarea
            label="Motivo del NO_SHOW"
            value={noShowReason}
            onChange={(event) => {
              setNoShowReason(event.target.value)
              setNoShowError(null)
            }}
            error={noShowError ?? undefined}
            placeholder="Describe por qué se marca NO_SHOW..."
          />
        </div>
        <GlassModalFooter>
          <GlassButton
            variant="ghost"
            onClick={() => {
              setIsNoShowDialogOpen(false)
              setNoShowReason("")
              setNoShowError(null)
            }}
            disabled={isMarkingNoShow}
          >
            Volver
          </GlassButton>
          <GlassButton variant="danger" onClick={handleNoShow} loading={isMarkingNoShow}>
            Confirmar NO_SHOW
          </GlassButton>
        </GlassModalFooter>
      </GlassModal>

      <GlassModal
        isOpen={isRejectDialogOpen}
        onClose={() => {
          if (!isRejectingCheckIn) {
            setIsRejectDialogOpen(false)
            setRejectReason("")
            setRejectError(null)
          }
        }}
        title={`Rechazar check-in turno #${turno.numero}`}
        description="Indica un motivo claro para auditoría. El turno permanecerá ASSIGNED."
      >
        <div className="space-y-4">
          <GlassTextarea
            label="Motivo del rechazo"
            value={rejectReason}
            onChange={(event) => {
              setRejectReason(event.target.value)
              setRejectError(null)
            }}
            error={rejectError ?? undefined}
            placeholder="Describe por qué se rechaza..."
          />
        </div>
        <GlassModalFooter>
          <GlassButton
            variant="ghost"
            onClick={() => {
              setIsRejectDialogOpen(false)
              setRejectReason("")
              setRejectError(null)
            }}
            disabled={isRejectingCheckIn}
          >
            Volver
          </GlassButton>
          <GlassButton variant="danger" onClick={handleRejectCheckIn} loading={isRejectingCheckIn}>
            Rechazar
          </GlassButton>
        </GlassModalFooter>
      </GlassModal>

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
