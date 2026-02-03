"use client"

import { useState } from "react"
import { User, Play, Square, UserX, UserPlus, UserMinus } from "lucide-react"
import { GlassCard } from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useTurno } from "@/hooks/use-turnos"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import type { TurnoListItem, TurnoStatus } from "@/core/models/turnos"
import { TurnoStatusBadge } from "./TurnoStatusBadge"
import { AssignTurnoDialog } from "./AssignTurnoDialog"

interface TurnoCardProps {
  turno: TurnoListItem
  index?: number
  canOperate?: boolean
  onRefresh?: () => void
}

const statusColors: Record<TurnoStatus, string> = {
  AVAILABLE: "border-green-500/30 bg-green-500/5",
  ASSIGNED: "border-blue-500/30 bg-blue-500/5",
  IN_PROGRESS: "border-yellow-500/30 bg-yellow-500/5",
  COMPLETED: "border-purple-500/30 bg-purple-500/5",
  CANCELED: "border-gray-500/30 bg-gray-500/5",
  NO_SHOW: "border-red-500/30 bg-red-500/5",
}

export function TurnoCard({ turno, index = 0, canOperate = false, onRefresh }: TurnoCardProps) {
  const { user } = useAuthStore()
  const { showToast } = useToast()
  const {
    checkInTurnoAsync,
    checkOutTurnoAsync,
    unassignTurnoAsync,
    noShowTurnoAsync,
    isCheckingIn,
    isCheckingOut,
    isUnassigning,
    isMarkingNoShow,
  } = useTurno(turno.id)

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

  const isSupervisor = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR
  const isGuia = user?.rol === Rol.GUIA
  const isMyTurno = turno.guia?.usuario?.id === user?.id

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

  const canCheckIn = isGuia && isMyTurno && turno.status === "ASSIGNED"
  const canCheckOut = isGuia && isMyTurno && turno.status === "IN_PROGRESS"
  const canAssign = isSupervisor && turno.status === "AVAILABLE"
  const canUnassign = isSupervisor && turno.status === "ASSIGNED"
  const canMarkNoShow = isSupervisor && turno.status === "ASSIGNED"

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
    </>
  )
}
