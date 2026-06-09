import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { socketClient } from "@/core/socket/socket.client"
import { useToast } from "@/shared/components/feedback/Toast"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"

interface TurnoSocketPayload {
  turnoId: number
  atencionId: number
  recaladaId?: number | null
  status: string
  guiaId?: string | null
}

interface AtencionSocketPayload {
  atencionId: number
  recaladaId: number
}

// Estable entre renders para no reenganchar los listeners del socket.
const NOOP_TOAST = () => {}

interface UseTurnoSocketOptions {
  atencionId?: number
  /**
   * Si es `false`, este hook sólo invalida cache y no dispara toasts. Útil
   * cuando las alertas accionables `notif:*` (useGlobalRealtime) ya cubren la
   * notificación visible y queremos evitar toasts duplicados.
   */
  notify?: boolean
}

export function useTurnoSocket({ atencionId, notify = true }: UseTurnoSocketOptions = {}) {
  const queryClient = useQueryClient()
  const { showToast: rawShowToast } = useToast()
  const { user } = useAuthStore()

  // Silenciar toasts cuando notify === false, manteniendo la invalidación.
  const showToast: typeof rawShowToast = notify ? rawShowToast : NOOP_TOAST

  useEffect(() => {
    const socket = socketClient.getSocket()
    if (!socket) return

    if (atencionId) {
      socket.emit("join:atencion", atencionId)
    }

    const invalidateTurnos = (payload: TurnoSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: ["turnos"] })
      queryClient.invalidateQueries({ queryKey: ["turnos-me"] })
      queryClient.invalidateQueries({ queryKey: ["turno", payload.turnoId] })
      queryClient.invalidateQueries({ queryKey: ["atencion-turnos", payload.atencionId] })
      queryClient.invalidateQueries({ queryKey: ["atencion-summary", payload.atencionId] })
      queryClient.invalidateQueries({ queryKey: ["turnos-me-next"] })
      queryClient.invalidateQueries({ queryKey: ["turnos-me-active"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] })
      if (payload.atencionId) {
        queryClient.invalidateQueries({ queryKey: ["atencion", payload.atencionId] })
      }
      if (payload.recaladaId) {
        queryClient.invalidateQueries({ queryKey: ["recalada", payload.recaladaId] })
      }
    }

    const invalidateAtencion = (payload: AtencionSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: ["atenciones"] })
      queryClient.invalidateQueries({ queryKey: ["atencion", payload.atencionId] })
      queryClient.invalidateQueries({ queryKey: ["atencion-turnos", payload.atencionId] })
      queryClient.invalidateQueries({ queryKey: ["atencion-summary", payload.atencionId] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] })
      if (payload.recaladaId) {
        queryClient.invalidateQueries({ queryKey: ["recalada", payload.recaladaId] })
      }
    }

    const isSupervisor = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR

    const onClaimed = (p: TurnoSocketPayload) => {
      invalidateTurnos(p)
      if (isSupervisor) showToast("info", `Turno #${p.turnoId} tomado por un guía`)
    }

    const onAssigned = (p: TurnoSocketPayload) => {
      invalidateTurnos(p)
      if (isSupervisor) showToast("info", `Turno #${p.turnoId} asignado`)
      else showToast("success", `Se te asignó el turno #${p.turnoId}`)
    }

    const onCheckedIn = (p: TurnoSocketPayload) => {
      invalidateTurnos(p)
      if (isSupervisor) showToast("info", `Turno #${p.turnoId} en curso`)
    }

    const onCheckedOut = (p: TurnoSocketPayload) => {
      invalidateTurnos(p)
      if (isSupervisor) showToast("success", `Turno #${p.turnoId} completado`)
    }

    const onUnassigned = (p: TurnoSocketPayload) => {
      invalidateTurnos(p)
      if (isSupervisor) showToast("info", `Turno #${p.turnoId} liberado`)
    }

    const onNoShow = (p: TurnoSocketPayload) => {
      invalidateTurnos(p)
      if (isSupervisor) showToast("error", `Turno #${p.turnoId} marcado como no-show`)
    }

    const onCanceled = (p: TurnoSocketPayload) => {
      invalidateTurnos(p)
      if (isSupervisor) showToast("error", `Turno #${p.turnoId} cancelado`)
    }

    const invalidatePendingCheckIns = () => {
      queryClient.invalidateQueries({ queryKey: ["turnos-checkins-pending"] })
    }

    const onCheckInRequested = (p: TurnoSocketPayload) => {
      invalidateTurnos(p)
      invalidatePendingCheckIns()
      if (isSupervisor) showToast("info", `Turno #${p.turnoId}: check-in solicitado`)
    }

    const onCheckInConfirmed = (p: TurnoSocketPayload) => {
      invalidateTurnos(p)
      invalidatePendingCheckIns()
      if (isSupervisor) showToast("success", `Turno #${p.turnoId}: check-in confirmado`)
    }

    const onCheckInRejected = (p: TurnoSocketPayload) => {
      invalidateTurnos(p)
      invalidatePendingCheckIns()
      if (isSupervisor) showToast("error", `Turno #${p.turnoId}: check-in rechazado`)
    }

    const onAtencionClosed = (p: AtencionSocketPayload) => {
      invalidateAtencion(p)
      showToast("info", `Atención #${p.atencionId} cerrada`)
    }

    const onAtencionCanceled = (p: AtencionSocketPayload) => {
      invalidateAtencion(p)
      showToast("error", `Atención #${p.atencionId} cancelada`)
    }

    const onAtencionCreated = (_p: AtencionSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: ["atenciones"] })
    }

    socket.on("turno:claimed", onClaimed)
    socket.on("turno:assigned", onAssigned)
    socket.on("turno:checkedIn", onCheckedIn)
    socket.on("turno:checkedOut", onCheckedOut)
    socket.on("turno:unassigned", onUnassigned)
    socket.on("turno:noShow", onNoShow)
    socket.on("turno:canceled", onCanceled)
    socket.on("turno:checkInRequested", onCheckInRequested)
    socket.on("turno:checkInConfirmed", onCheckInConfirmed)
    socket.on("turno:checkInRejected", onCheckInRejected)
    socket.on("atencion:closed", onAtencionClosed)
    socket.on("atencion:canceled", onAtencionCanceled)
    socket.on("atencion:created", onAtencionCreated)
    socket.on("atencion:updated", invalidateAtencion)

    return () => {
      if (atencionId) socket.emit("leave:atencion", atencionId)
      socket.off("turno:claimed", onClaimed)
      socket.off("turno:assigned", onAssigned)
      socket.off("turno:checkedIn", onCheckedIn)
      socket.off("turno:checkedOut", onCheckedOut)
      socket.off("turno:unassigned", onUnassigned)
      socket.off("turno:noShow", onNoShow)
      socket.off("turno:canceled", onCanceled)
      socket.off("turno:checkInRequested", onCheckInRequested)
      socket.off("turno:checkInConfirmed", onCheckInConfirmed)
      socket.off("turno:checkInRejected", onCheckInRejected)
      socket.off("atencion:closed", onAtencionClosed)
      socket.off("atencion:canceled", onAtencionCanceled)
      socket.off("atencion:created", onAtencionCreated)
      socket.off("atencion:updated", invalidateAtencion)
    }
  }, [atencionId, queryClient, showToast, user?.rol])
}
