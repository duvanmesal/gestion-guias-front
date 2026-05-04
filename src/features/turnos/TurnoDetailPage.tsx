"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CalendarClock,
  Hand,
  Play,
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
import { useTurno } from "@/hooks/use-turnos"
import { useTurnoSocket } from "@/hooks/use-turno-socket"
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
  const { showToast } = useToast()
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelError, setCancelError] = useState<string | null>(null)

  const {
    turno,
    isLoading,
    error,
    refetch,
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
  } = useTurno(Number.isFinite(turnoId) ? turnoId : null)

  useTurnoSocket({
    atencionId: turno?.atencionId,
  })

  const isSupervisor = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR
  const isGuia = user?.rol === Rol.GUIA
  const isMyTurno = turno?.guia?.usuario?.id === user?.id
  const isBusy =
    isCheckingIn ||
    isCheckingOut ||
    isUnassigning ||
    isMarkingNoShow ||
    isCanceling ||
    isClaiming

  const canCheckIn = isGuia && isMyTurno && turno?.status === "ASSIGNED"
  const canCheckOut = isGuia && isMyTurno && turno?.status === "IN_PROGRESS"
  const canClaim = isGuia && turno?.status === "AVAILABLE"
  const canAssign = isSupervisor && turno?.status === "AVAILABLE"
  const canUnassign = isSupervisor && turno?.status === "ASSIGNED"
  const canMarkNoShow = isSupervisor && turno?.status === "ASSIGNED"
  const canCancel = isSupervisor && (turno?.status === "AVAILABLE" || turno?.status === "ASSIGNED")

  const runAction = async (action: () => Promise<unknown>, successMessage: string, errorMessage: string) => {
    try {
      await action()
      showToast("success", successMessage)
      refetch()
    } catch {
      showToast("error", errorMessage)
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
                    <InfoItem icon={<Play className="w-4 h-4" />} label="Check-in" value={formatDateTime(turno.checkInAt)} />
                    <InfoItem icon={<Square className="w-4 h-4" />} label="Check-out" value={formatDateTime(turno.checkOutAt)} />
                  </div>
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
                  {canCheckIn && (
                    <GlassButton loading={isCheckingIn} disabled={isBusy} onClick={() => runAction(() => checkInTurnoAsync(), "Check-in realizado", "Error al realizar check-in")}>
                      <Play className="w-4 h-4" />
                      Iniciar
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
                  {!canCheckIn && !canCheckOut && !canClaim && !canAssign && !canUnassign && !canMarkNoShow && !canCancel && (
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
