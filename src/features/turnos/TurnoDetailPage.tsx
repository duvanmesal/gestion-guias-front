"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Hand,
  LogIn,
  Ship,
  Square,
  User,
  UserMinus,
  UserPlus,
  UserX,
  XCircle,
} from "lucide-react"

import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import { useMe } from "@/hooks/use-me"
import { useTurno } from "@/hooks/use-turnos"
import { useAtencionTurnos } from "@/hooks/use-atenciones"
import { useTurnoSocket } from "@/hooks/use-turno-socket"
import { extractApiError } from "@/core/utils/api-error"
import { AppShell } from "@/shared/components/layout/AppShell"
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
} from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { GlassModal, GlassModalFooter } from "@/shared/components/glass/GlassModal"
import { GlassTextarea } from "@/shared/components/glass/GlassTextarea"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { useToast } from "@/shared/components/feedback/Toast"
import { AssignTurnoDialog } from "./components/AssignTurnoDialog"
import { TurnoStatusBadge } from "./components/TurnoStatusBadge"

function formatDateTime(value?: string | null) {
  if (!value) return "No registrado"
  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function TurnoDetailPage() {
  const { id } = useParams()
  const turnoId = Number(id)
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { me } = useMe()
  const { showToast } = useToast()
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectError, setRejectError] = useState<string | null>(null)

  const {
    turno,
    isLoading,
    error,
    refetch,
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
  } = useTurno(Number.isFinite(turnoId) ? turnoId : null)

  useTurnoSocket({
    atencionId: turno?.atencionId,
  })

  const { turnos: atencionTurnos } = useAtencionTurnos(turno?.atencionId ?? null)
  const firstAvailableTurnoId = [...atencionTurnos]
    .filter((t) => t.status === "AVAILABLE" && !t.guia)
    .sort((a, b) => a.numero - b.numero)[0]?.id ?? null
  const isFirstAvailableTurno =
    firstAvailableTurnoId == null ? false : firstAvailableTurnoId === turno?.id

  const isSupervisor = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR
  const isGuia = user?.rol === Rol.GUIA
  const isMyTurno = turno?.guia?.usuario?.id === user?.id
  const isBusy =
    isCheckingIn ||
    isConfirmingCheckIn ||
    isRejectingCheckIn ||
    isCheckingOut ||
    isUnassigning ||
    isMarkingNoShow ||
    isCanceling ||
    isClaiming

  const hasPendingCheckIn = Boolean(
    turno?.checkInRequestedAt && !turno?.checkInConfirmedAt && !turno?.checkInRejectedAt,
  )
  const wasRejected = Boolean(turno?.checkInRejectedAt)
  // Epica 5: el guía solo puede solicitar si está ASSIGNED, sin solicitud previa
  // pendiente y sin rechazo (el reintento queda fuera de esta épica).
  const canRequestCheckIn =
    isGuia && isMyTurno && turno?.status === "ASSIGNED" && !hasPendingCheckIn && !wasRejected
  const canConfirmCheckIn = isSupervisor && turno?.status === "ASSIGNED" && hasPendingCheckIn
  const canRejectCheckIn = isSupervisor && turno?.status === "ASSIGNED" && hasPendingCheckIn
  const canCheckOut = isGuia && isMyTurno && turno?.status === "IN_PROGRESS"
  const assignmentMode = me?.turnoAssignmentMode ?? user?.turnoAssignmentMode ?? "MANUAL_RECLAMO"
  const guiaDisponible = me?.disponibleParaTurnos ?? user?.disponibleParaTurnos ?? false
  const guiaPenalizado = me?.pendingPenalty ?? user?.pendingPenalty ?? false
  const canClaim =
    isGuia &&
    assignmentMode === "MANUAL_RECLAMO" &&
    guiaDisponible &&
    !guiaPenalizado &&
    turno?.status === "AVAILABLE" &&
    isFirstAvailableTurno
  const showClaimBlockedHint =
    isGuia &&
    assignmentMode === "MANUAL_RECLAMO" &&
    guiaDisponible &&
    !guiaPenalizado &&
    turno?.status === "AVAILABLE" &&
    firstAvailableTurnoId != null &&
    !isFirstAvailableTurno
  const canAssign = isSupervisor && turno?.status === "AVAILABLE"
  const canUnassign = isSupervisor && turno?.status === "ASSIGNED" && !hasPendingCheckIn
  const canMarkNoShow = isSupervisor && turno?.status === "ASSIGNED"
  const canCancel = isSupervisor && (turno?.status === "AVAILABLE" || turno?.status === "ASSIGNED")

  const runAction = async (action: () => Promise<unknown>, successMessage: string, errorMessage: string) => {
    try {
      await action()
      showToast("success", successMessage)
      refetch()
    } catch (error) {
      showToast("error", extractApiError(error) || errorMessage)
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
      refetch()
      setIsRejectDialogOpen(false)
      setRejectReason("")
      setRejectError(null)
    } catch (error) {
      showToast("error", extractApiError(error) || "Error al rechazar check-in")
    }
  }

  const handleCancel = async () => {
    const reason = cancelReason.trim()
    if (reason.length < 3) {
      setCancelError("Ingresa un motivo de cancelacion de al menos 3 caracteres")
      return
    }

    await runAction(
      () => cancelTurnoAsync({ cancelReason: reason }),
      "Turno cancelado",
      "Error al cancelar turno",
    )
    setIsCancelDialogOpen(false)
    setCancelReason("")
    setCancelError(null)
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <GlassButton variant="ghost" onClick={() => navigate(-1)} aria-label="Volver">
              <ArrowLeft className="w-4 h-4" />
            </GlassButton>
            <div>
              <h1 className="text-3xl font-bold text-[rgb(var(--color-fg))]">
                {turno ? `Turno #${turno.numero}` : "Detalle de turno"}
              </h1>
              <p className="text-[rgb(var(--color-muted))] mt-1">
                Registro operacional del cupo y su asignacion.
              </p>
            </div>
          </div>
          {turno && <TurnoStatusBadge status={turno.status} />}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Skeleton height="18rem" />
            <Skeleton height="18rem" />
            <Skeleton height="18rem" />
          </div>
        ) : error || !turno ? (
          <GlassCard>
            <GlassCardContent>
              <div className="py-12 text-center text-[rgb(var(--color-muted))]">
                No se pudo cargar el turno solicitado.
              </div>
            </GlassCardContent>
          </GlassCard>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <GlassCard className="lg:col-span-2">
                <GlassCardHeader>
                  <GlassCardTitle>Informacion operacional</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem icon={<CalendarClock className="w-4 h-4" />} label="Inicio" value={formatDateTime(turno.fechaInicio)} />
                    <InfoItem icon={<CalendarClock className="w-4 h-4" />} label="Fin" value={formatDateTime(turno.fechaFin)} />
                  </div>

                  <CheckInTimeline
                    requestedAt={turno.checkInRequestedAt}
                    confirmedAt={turno.checkInConfirmedAt}
                    checkInAt={turno.checkInAt}
                    checkOutAt={turno.checkOutAt}
                    rejectedAt={turno.checkInRejectedAt}
                  />

                  {hasPendingCheckIn && (
                    <div
                      className="mt-4 flex items-start gap-3 rounded-xl border border-[rgb(var(--color-warning)/0.28)] bg-[rgb(var(--color-warning)/0.06)] p-3"
                      role="status"
                    >
                      <span
                        className="relative mt-1.5 flex h-2 w-2 flex-shrink-0"
                        aria-hidden="true"
                      >
                        <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--color-warning)/0.55)]" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[rgb(var(--color-warning))]" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[rgb(var(--color-fg))]">
                          Check-in pendiente de confirmación
                        </p>
                        <p className="mt-0.5 text-xs text-[rgb(var(--color-muted))]">
                          El guía solicitó su check-in. Un supervisor debe confirmarlo para que el turno inicie oficialmente.
                        </p>
                      </div>
                    </div>
                  )}
                  {wasRejected && (
                    <div
                      className="mt-4 flex items-start gap-3 rounded-xl border border-[rgb(var(--color-danger)/0.28)] bg-[rgb(var(--color-danger)/0.06)] p-3"
                      role="alert"
                    >
                      <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[rgb(var(--color-danger))]" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[rgb(var(--color-fg))]">Check-in rechazado</p>
                        <p className="mt-0.5 text-xs text-[rgb(var(--color-muted))]">
                          Motivo: {turno.checkInRejectReason ?? "No registrado"}
                        </p>
                      </div>
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>

              <GlassCard>
                <GlassCardHeader>
                  <GlassCardTitle>Guia asignado</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  {turno.guia ? (
                    <div className="glass-subtle rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-primary)/0.14)] flex items-center justify-center">
                          <User className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[rgb(var(--color-fg))] truncate">
                            {`${turno.guia.usuario?.nombres ?? ""} ${turno.guia.usuario?.apellidos ?? ""}`.trim() ||
                              turno.guia.usuario?.email ||
                              "Guia asignado"}
                          </p>
                          {turno.guia.usuario?.email && (
                            <p className="text-xs text-[rgb(var(--color-muted))] truncate">
                              {turno.guia.usuario.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[rgb(var(--color-muted))]">
                      Este turno no tiene guia asignado.
                    </p>
                  )}
                </GlassCardContent>
              </GlassCard>
            </div>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Contexto</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    icon={<CalendarClock className="w-4 h-4" />}
                    label="Atencion"
                    value={`#${turno.atencionId}`}
                    action={
                      <Link to={`/atenciones/${turno.atencionId}`} className="text-xs text-[rgb(var(--color-primary))]">
                        Ver atencion
                      </Link>
                    }
                  />
                  <InfoItem
                    icon={<Ship className="w-4 h-4" />}
                    label="Recalada"
                    value={turno.atencion?.recalada?.codigoRecalada ?? "No disponible"}
                    action={
                      turno.atencion?.recaladaId ? (
                        <Link to={`/recaladas/${turno.atencion.recaladaId}`} className="text-xs text-[rgb(var(--color-primary))]">
                          Ver recalada
                        </Link>
                      ) : undefined
                    }
                  />
                </div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Acciones</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="flex flex-wrap gap-2">
                  {canRequestCheckIn && (
                    <GlassButton
                      loading={isCheckingIn}
                      disabled={isBusy}
                      onClick={() =>
                        runAction(
                          () => checkInTurnoAsync(),
                          "Solicitud de check-in enviada",
                          "Error al solicitar check-in",
                        )
                      }
                    >
                      <LogIn className="w-4 h-4" />
                      Solicitar check-in
                    </GlassButton>
                  )}
                  {isGuia && isMyTurno && hasPendingCheckIn && (
                    <div
                      className="inline-flex items-center gap-2 rounded-xl border border-[rgb(var(--color-warning)/0.28)] bg-[rgb(var(--color-warning)/0.08)] px-3 py-2 text-sm font-medium text-[rgb(var(--color-fg))]"
                      role="status"
                    >
                      <span
                        className="relative flex h-2 w-2"
                        aria-hidden="true"
                      >
                        <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--color-warning)/0.55)]" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[rgb(var(--color-warning))]" />
                      </span>
                      Pendiente de confirmación del supervisor
                    </div>
                  )}
                  {canConfirmCheckIn && (
                    <GlassButton
                      loading={isConfirmingCheckIn}
                      disabled={isBusy}
                      onClick={() =>
                        runAction(
                          () => confirmCheckInTurnoAsync(),
                          "Check-in confirmado",
                          "Error al confirmar check-in",
                        )
                      }
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirmar check-in
                    </GlassButton>
                  )}
                  {canRejectCheckIn && (
                    <GlassButton
                      variant="danger"
                      loading={isRejectingCheckIn}
                      disabled={isBusy}
                      onClick={() => setIsRejectDialogOpen(true)}
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar check-in
                    </GlassButton>
                  )}
                  {canCheckOut && (
                    <GlassButton variant="secondary" loading={isCheckingOut} disabled={isBusy} onClick={() => runAction(() => checkOutTurnoAsync(), "Check-out realizado", "Error al realizar check-out")}>
                      <Square className="w-4 h-4" />
                      Finalizar
                    </GlassButton>
                  )}
                  {canClaim && (
                    <GlassButton loading={isClaiming} disabled={isBusy} onClick={() => runAction(() => claimTurnoAsync(), "Turno reclamado", "Error al reclamar turno")}>
                      <Hand className="w-4 h-4" />
                      Reclamar
                    </GlassButton>
                  )}
                  {canAssign && (
                    <GlassButton variant="glass" disabled={isBusy} onClick={() => setIsAssignDialogOpen(true)}>
                      <UserPlus className="w-4 h-4" />
                      Asignar guia
                    </GlassButton>
                  )}
                  {canUnassign && (
                    <GlassButton variant="ghost" loading={isUnassigning} disabled={isBusy} onClick={() => runAction(() => unassignTurnoAsync({ reason: "Liberado por supervisor" }), "Turno liberado", "Error al liberar turno")}>
                      <UserMinus className="w-4 h-4" />
                      Liberar
                    </GlassButton>
                  )}
                  {canMarkNoShow && (
                    <GlassButton variant="danger" loading={isMarkingNoShow} disabled={isBusy} onClick={() => runAction(() => noShowTurnoAsync({ reason: "No se presento" }), "Turno marcado como no-show", "Error al marcar no-show")}>
                      <UserX className="w-4 h-4" />
                      No-show
                    </GlassButton>
                  )}
                  {canCancel && (
                    <GlassButton variant="danger" loading={isCanceling} disabled={isBusy} onClick={() => setIsCancelDialogOpen(true)}>
                      <XCircle className="w-4 h-4" />
                      Cancelar
                    </GlassButton>
                  )}
                  {showClaimBlockedHint && (
                    <div className="w-full flex flex-col gap-2 rounded-lg border border-[rgb(var(--color-border)/0.12)] bg-[rgb(var(--color-bg)/0.4)] p-3 text-sm text-[rgb(var(--color-muted))]">
                      <span>
                        Este no es el primer turno disponible de la atención. Debes tomar primero el cupo más antiguo.
                      </span>
                      {turno?.atencionId && (
                        <Link
                          to={`/atenciones/${turno.atencionId}`}
                          className="self-start text-xs font-semibold text-[rgb(var(--color-primary))]"
                        >
                          Ir a la atención
                        </Link>
                      )}
                    </div>
                  )}
                  {!canRequestCheckIn &&
                    !canConfirmCheckIn &&
                    !canRejectCheckIn &&
                    !canCheckOut &&
                    !canClaim &&
                    !canAssign &&
                    !canUnassign &&
                    !canMarkNoShow &&
                    !canCancel &&
                    !showClaimBlockedHint &&
                    !(isGuia && isMyTurno && hasPendingCheckIn) && (
                      <p className="text-sm text-[rgb(var(--color-muted))]">
                        No hay acciones disponibles para tu rol y el estado actual.
                      </p>
                    )}
                </div>
              </GlassCardContent>
            </GlassCard>
          </>
        )}
      </div>

      {turno && (
        <AssignTurnoDialog
          isOpen={isAssignDialogOpen}
          onClose={() => setIsAssignDialogOpen(false)}
          turnoId={turno.id}
          turnoNumero={turno.numero}
          onSuccess={() => {
            setIsAssignDialogOpen(false)
            refetch()
          }}
        />
      )}

      {turno && (
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
          description="El turno permanecerá ASSIGNED. Indica un motivo claro para auditoría."
        >
          <GlassTextarea
            label="Motivo del rechazo"
            value={rejectReason}
            onChange={(event) => {
              setRejectReason(event.target.value)
              setRejectError(null)
            }}
            error={rejectError ?? undefined}
            placeholder="Describe por qué se rechaza el check-in..."
          />
          <GlassModalFooter>
            <GlassButton
              variant="ghost"
              disabled={isRejectingCheckIn}
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Volver
            </GlassButton>
            <GlassButton variant="danger" loading={isRejectingCheckIn} onClick={handleRejectCheckIn}>
              Rechazar check-in
            </GlassButton>
          </GlassModalFooter>
        </GlassModal>
      )}

      {turno && (
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
          <GlassModalFooter>
            <GlassButton variant="ghost" disabled={isCanceling} onClick={() => setIsCancelDialogOpen(false)}>
              Volver
            </GlassButton>
            <GlassButton variant="danger" loading={isCanceling} onClick={handleCancel}>
              Cancelar turno
            </GlassButton>
          </GlassModalFooter>
        </GlassModal>
      )}
    </AppShell>
  )
}

function CheckInTimeline({
  requestedAt,
  confirmedAt,
  checkInAt,
  checkOutAt,
  rejectedAt,
}: {
  requestedAt?: string | null
  confirmedAt?: string | null
  checkInAt?: string | null
  checkOutAt?: string | null
  rejectedAt?: string | null
}) {
  const steps: { label: string; time: string | null | undefined; tone: "done" | "active" | "pending" | "rejected" }[] = [
    {
      label: "Solicitado",
      time: requestedAt,
      tone: rejectedAt ? "rejected" : requestedAt ? (confirmedAt ? "done" : "active") : "pending",
    },
    {
      label: "Confirmado",
      time: confirmedAt,
      tone: rejectedAt ? "rejected" : confirmedAt ? "done" : "pending",
    },
    {
      label: "Inicio oficial",
      time: checkInAt,
      tone: checkInAt ? "done" : "pending",
    },
    {
      label: "Check-out",
      time: checkOutAt,
      tone: checkOutAt ? "done" : "pending",
    },
  ]

  return (
    <div
      className="mt-4 border-t border-[rgb(var(--color-border)/0.5)] pt-4"
      aria-label="Cronología del check-in"
    >
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--color-muted))]">
        Cronología del check-in
      </p>
      <ol className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((step) => {
          const dotClass =
            step.tone === "done"
              ? "bg-[rgb(var(--color-success))]"
              : step.tone === "active"
                ? "bg-[rgb(var(--color-warning))]"
                : step.tone === "rejected"
                  ? "bg-[rgb(var(--color-danger))]"
                  : "bg-[rgb(var(--color-border))]"
          const labelClass =
            step.tone === "pending"
              ? "text-[rgb(var(--color-muted))]"
              : "text-[rgb(var(--color-fg))]"
          return (
            <li key={step.label} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${dotClass}`}
                  aria-hidden="true"
                />
                <span className={`text-xs font-semibold ${labelClass}`}>
                  {step.label}
                </span>
              </div>
              <span className="text-xs text-[rgb(var(--color-muted))]">
                {step.time
                  ? new Date(step.time).toLocaleString("es-CO", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function InfoItem({
  icon,
  label,
  value,
  action,
}: {
  icon: ReactNode
  label: string
  value: string
  action?: ReactNode
}) {
  return (
    <div className="glass-subtle rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-[rgb(var(--color-muted))] uppercase tracking-wide">
            {icon}
            {label}
          </div>
          <p className="mt-2 text-sm font-semibold text-[rgb(var(--color-fg))] break-words">
            {value}
          </p>
        </div>
        {action}
      </div>
    </div>
  )
}
