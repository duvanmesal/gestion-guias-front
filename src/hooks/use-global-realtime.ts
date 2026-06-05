import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { socketClient } from "@/core/socket/socket.client"
import { useAuthStore } from "@/app/stores/auth-store"
import { useToast } from "@/shared/components/feedback/Toast"

interface TurnoSocketPayload {
  turnoId: number
  atencionId?: number
  recaladaId?: number | null
}

interface AtencionSocketPayload {
  atencionId: number
  recaladaId?: number | null
}

interface RecaladaSocketPayload {
  recaladaId: number
}

interface UserSocketPayload {
  userId?: string
}

interface CatalogSocketPayload {
  paisId?: number
  buqueId?: number
  puertoId?: number
  muelleId?: number
}

interface DisponibilidadSocketPayload {
  atencionId?: number
  guiaId?: string
  guiaUserId?: string
  userId?: string
  penalizado?: boolean
  posicion?: number
  tuPosicion?: number
  total?: number
}

interface OperationalConfigPayload {
  turnoAssignmentMode?: string
}

interface AtencionNuevaPayload {
  atencionId: number
  recaladaId?: number
  fechaInicio?: string
  fechaFin?: string
  turnosTotal?: number
}

interface OpNotifPayload {
  notificationId: string
  type: string
  route: string
  title: string
  body: string
  recaladaId?: number | null
  atencionId?: number | null
  turnoId?: number | null
}

export function useGlobalRealtime() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const accessToken = useAuthStore((s) => s.accessToken)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const clearSession = useAuthStore((s) => s.clearSession)

  useEffect(() => {
    if (!accessToken) return

    socketClient.connect(accessToken)
    const socket = socketClient.getSocket()
    if (!socket) return

    const forceLogout = () => {
      socketClient.disconnect()
      clearSession()
      queryClient.clear()
      showToast("warning", "Tu sesión fue cerrada. Inicia sesión nuevamente.")
      window.location.assign("/login")
    }

    const invalidateSessions = () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] })
    }

    const invalidateTurnos = (payload: TurnoSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: ["turnos"] })
      queryClient.invalidateQueries({ queryKey: ["turnos-me"] })
      queryClient.invalidateQueries({ queryKey: ["turnos-me-next"] })
      queryClient.invalidateQueries({ queryKey: ["turnos-me-active"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] })
      if (payload.turnoId) {
        queryClient.invalidateQueries({ queryKey: ["turno", payload.turnoId] })
      }
      if (payload.atencionId) {
        queryClient.invalidateQueries({ queryKey: ["atencion", payload.atencionId] })
        queryClient.invalidateQueries({ queryKey: ["atencion-turnos", payload.atencionId] })
        queryClient.invalidateQueries({ queryKey: ["atencion-summary", payload.atencionId] })
      }
      if (payload.recaladaId) {
        queryClient.invalidateQueries({ queryKey: ["recalada", payload.recaladaId] })
      }
    }

    const invalidateAtenciones = (payload: AtencionSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: ["atenciones"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] })
      if (payload.atencionId) {
        queryClient.invalidateQueries({ queryKey: ["atencion", payload.atencionId] })
        queryClient.invalidateQueries({ queryKey: ["atencion-turnos", payload.atencionId] })
        queryClient.invalidateQueries({ queryKey: ["atencion-summary", payload.atencionId] })
      }
      if (payload.recaladaId) {
        queryClient.invalidateQueries({ queryKey: ["recalada", payload.recaladaId] })
      }
    }

    const invalidateRecaladas = (payload: RecaladaSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: ["recaladas"] })
      queryClient.invalidateQueries({ queryKey: ["atenciones"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] })
      if (payload.recaladaId) {
        queryClient.invalidateQueries({ queryKey: ["recalada", payload.recaladaId] })
      }
    }

    const invalidateUsers = (payload: UserSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["users-guides"] })
      if (payload.userId && payload.userId === currentUserId) {
        queryClient.invalidateQueries({ queryKey: ["me"] })
      }
    }

    const invalidateInvitations = () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] })
    }

    const invalidatePais = (payload: CatalogSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: ["paises"] })
      queryClient.invalidateQueries({ queryKey: ["paises", "lookup"] })
      if (payload.paisId) {
        queryClient.invalidateQueries({ queryKey: ["pais", payload.paisId] })
      }
    }

    const invalidateDisponibilidad = (payload: DisponibilidadSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] })
      queryClient.invalidateQueries({ queryKey: ["users-guides"] })
      queryClient.invalidateQueries({ queryKey: ["guide-availability", "me"] })
      if (payload.userId && payload.userId === currentUserId) {
        queryClient.invalidateQueries({ queryKey: ["me"] })
      }
      if (payload.atencionId) {
        queryClient.invalidateQueries({ queryKey: ["disponibilidad-queue", payload.atencionId] })
        queryClient.invalidateQueries({ queryKey: ["disponibilidad-me", payload.atencionId] })
      }
    }

    const invalidateOperationalConfig = (_payload: OperationalConfigPayload) => {
      queryClient.invalidateQueries({ queryKey: ["operational-config"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] })
      queryClient.invalidateQueries({ queryKey: ["me"] })
      queryClient.invalidateQueries({ queryKey: ["users-guides"] })
    }

    const handleAtencionNueva = (_payload: AtencionNuevaPayload) => {
      showToast("info", "Nueva atención disponible — puedes marcar tu disponibilidad")
      queryClient.invalidateQueries({ queryKey: ["atenciones"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] })
    }

    const handlePenalizado = () => {
      showToast(
        "warning",
        "Fuiste marcado como NO_SHOW. En la próxima atención irás al final de la cola.",
        8000,
      )
    }

    const invalidateBuque = (payload: CatalogSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: ["buques"] })
      queryClient.invalidateQueries({ queryKey: ["buques", "lookup"] })
      if (payload.buqueId) {
        queryClient.invalidateQueries({ queryKey: ["buque", payload.buqueId] })
      }
    }

    const invalidatePuerto = (payload: CatalogSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: ["puertos"] })
      queryClient.invalidateQueries({ queryKey: ["puertos", "lookup"] })
      queryClient.invalidateQueries({ queryKey: ["recaladas"] })
      if (payload.puertoId) {
        queryClient.invalidateQueries({ queryKey: ["puerto", payload.puertoId] })
      }
    }

    const invalidateMuelle = (payload: CatalogSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: ["muelles"] })
      queryClient.invalidateQueries({ queryKey: ["muelles", "lookup"] })
      queryClient.invalidateQueries({ queryKey: ["recaladas"] })
      if (payload.muelleId) {
        queryClient.invalidateQueries({ queryKey: ["muelle", payload.muelleId] })
      }
    }

    socket.on("disponibilidad:marcada", invalidateDisponibilidad)
    socket.on("disponibilidad:desmarcada", invalidateDisponibilidad)
    socket.on("disponibilidad:globalChanged", invalidateDisponibilidad)
    socket.on("disponibilidad:penalizado", handlePenalizado)
    socket.on("operational-config:changed", invalidateOperationalConfig)
    socket.on("atencion:nueva", handleAtencionNueva)

    socket.on("auth:sessionRevoked", forceLogout)
    socket.on("auth:sessionsChanged", invalidateSessions)

    socket.on("turno:assigned", invalidateTurnos)
    socket.on("turno:claimed", invalidateTurnos)
    socket.on("turno:checkedIn", invalidateTurnos)
    socket.on("turno:checkedOut", invalidateTurnos)
    socket.on("turno:unassigned", invalidateTurnos)
    socket.on("turno:noShow", invalidateTurnos)
    socket.on("turno:canceled", invalidateTurnos)

    socket.on("atencion:created", invalidateAtenciones)
    socket.on("atencion:updated", invalidateAtenciones)
    socket.on("atencion:canceled", invalidateAtenciones)
    socket.on("atencion:closed", invalidateAtenciones)
    socket.on("atencion:evaluation:updated", invalidateAtenciones)

    socket.on("recalada:created", invalidateRecaladas)
    socket.on("recalada:updated", invalidateRecaladas)
    socket.on("recalada:arrived", invalidateRecaladas)
    socket.on("recalada:departed", invalidateRecaladas)
    socket.on("recalada:canceled", invalidateRecaladas)

    socket.on("user:created", invalidateUsers)
    socket.on("user:updated", invalidateUsers)
    socket.on("user:deactivated", invalidateUsers)
    socket.on("guides:lookupChanged", invalidateUsers)

    socket.on("invitation:created", invalidateInvitations)
    socket.on("invitation:resent", invalidateInvitations)
    socket.on("invitation:used", invalidateInvitations)
    socket.on("invitation:expired", invalidateInvitations)

    socket.on("catalog:pais:created", invalidatePais)
    socket.on("catalog:pais:updated", invalidatePais)
    socket.on("catalog:pais:removed", invalidatePais)
    socket.on("catalog:pais:bulkChanged", invalidatePais)
    socket.on("catalog:buque:created", invalidateBuque)
    socket.on("catalog:buque:updated", invalidateBuque)
    socket.on("catalog:buque:removed", invalidateBuque)
    socket.on("catalog:buque:bulkChanged", invalidateBuque)
    socket.on("catalog:puerto:created", invalidatePuerto)
    socket.on("catalog:puerto:updated", invalidatePuerto)
    socket.on("catalog:puerto:removed", invalidatePuerto)
    socket.on("catalog:muelle:created", invalidateMuelle)
    socket.on("catalog:muelle:updated", invalidateMuelle)
    socket.on("catalog:muelle:removed", invalidateMuelle)

    // Epica 7 — Notificaciones operativas. Cada handler dispara un toast
    // informacional y refresca la cache de la entidad afectada para que la
    // UI quede al día sin esperar al próximo poll.
    const opNotifInfo = (payload: OpNotifPayload) => {
      showToast("info", payload.body, 6000)
    }
    const opNotifWarning = (payload: OpNotifPayload) => {
      showToast("warning", payload.body, 8000)
    }
    const handleOpNotifAtencionAvailable = (payload: OpNotifPayload) => {
      showToast("success", payload.body, 6000)
      queryClient.invalidateQueries({ queryKey: ["atenciones"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] })
      if (payload.atencionId) {
        queryClient.invalidateQueries({ queryKey: ["atencion", payload.atencionId] })
      }
    }
    const handleOpNotifTurno = (payload: OpNotifPayload) => {
      opNotifInfo(payload)
      queryClient.invalidateQueries({ queryKey: ["turnos"] })
      queryClient.invalidateQueries({ queryKey: ["turnos-me"] })
      queryClient.invalidateQueries({ queryKey: ["turnos-me-next"] })
      queryClient.invalidateQueries({ queryKey: ["turnos-me-active"] })
      if (payload.turnoId) {
        queryClient.invalidateQueries({ queryKey: ["turno", payload.turnoId] })
      }
    }
    const handleOpNotifCheckInPending = (payload: OpNotifPayload) => {
      opNotifWarning(payload)
      queryClient.invalidateQueries({ queryKey: ["turnos-check-ins-pending"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] })
    }
    const handleOpNotifPenalty = (payload: OpNotifPayload) => {
      opNotifWarning(payload)
      queryClient.invalidateQueries({ queryKey: ["me"] })
      queryClient.invalidateQueries({ queryKey: ["users-guides"] })
    }
    const handleOpNotifRecaladaOverdue = (payload: OpNotifPayload) => {
      opNotifWarning(payload)
      queryClient.invalidateQueries({ queryKey: ["recaladas"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] })
    }
    const handleOpNotifAtencionNear = (payload: OpNotifPayload) => {
      opNotifWarning(payload)
      queryClient.invalidateQueries({ queryKey: ["atenciones"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] })
    }

    socket.on("notif:atencion:available", handleOpNotifAtencionAvailable)
    socket.on("notif:turno:claimed", handleOpNotifTurno)
    socket.on("notif:turno:assigned", handleOpNotifTurno)
    socket.on("notif:turno:canceled", handleOpNotifTurno)
    socket.on("notif:turno:changed", handleOpNotifTurno)
    socket.on("notif:turno:checkInReminder", handleOpNotifTurno)
    socket.on("notif:guide:penalized", handleOpNotifPenalty)
    socket.on("notif:supervisor:checkInPending", handleOpNotifCheckInPending)
    socket.on("notif:recalada:overdue", handleOpNotifRecaladaOverdue)
    socket.on("notif:atencion:nearWithFreeTurnos", handleOpNotifAtencionNear)

    return () => {
      socket.off("disponibilidad:marcada", invalidateDisponibilidad)
      socket.off("disponibilidad:desmarcada", invalidateDisponibilidad)
      socket.off("disponibilidad:globalChanged", invalidateDisponibilidad)
      socket.off("disponibilidad:penalizado", handlePenalizado)
      socket.off("operational-config:changed", invalidateOperationalConfig)
      socket.off("atencion:nueva", handleAtencionNueva)

      socket.off("auth:sessionRevoked", forceLogout)
      socket.off("auth:sessionsChanged", invalidateSessions)

      socket.off("turno:assigned", invalidateTurnos)
      socket.off("turno:claimed", invalidateTurnos)
      socket.off("turno:checkedIn", invalidateTurnos)
      socket.off("turno:checkedOut", invalidateTurnos)
      socket.off("turno:unassigned", invalidateTurnos)
      socket.off("turno:noShow", invalidateTurnos)
      socket.off("turno:canceled", invalidateTurnos)

      socket.off("atencion:created", invalidateAtenciones)
      socket.off("atencion:updated", invalidateAtenciones)
      socket.off("atencion:canceled", invalidateAtenciones)
      socket.off("atencion:closed", invalidateAtenciones)
      socket.off("atencion:evaluation:updated", invalidateAtenciones)

      socket.off("recalada:created", invalidateRecaladas)
      socket.off("recalada:updated", invalidateRecaladas)
      socket.off("recalada:arrived", invalidateRecaladas)
      socket.off("recalada:departed", invalidateRecaladas)
      socket.off("recalada:canceled", invalidateRecaladas)

      socket.off("user:created", invalidateUsers)
      socket.off("user:updated", invalidateUsers)
      socket.off("user:deactivated", invalidateUsers)
      socket.off("guides:lookupChanged", invalidateUsers)

      socket.off("invitation:created", invalidateInvitations)
      socket.off("invitation:resent", invalidateInvitations)
      socket.off("invitation:used", invalidateInvitations)
      socket.off("invitation:expired", invalidateInvitations)

      socket.off("catalog:pais:created", invalidatePais)
      socket.off("catalog:pais:updated", invalidatePais)
      socket.off("catalog:pais:removed", invalidatePais)
      socket.off("catalog:pais:bulkChanged", invalidatePais)
      socket.off("catalog:buque:created", invalidateBuque)
      socket.off("catalog:buque:updated", invalidateBuque)
      socket.off("catalog:buque:removed", invalidateBuque)
      socket.off("catalog:buque:bulkChanged", invalidateBuque)
      socket.off("catalog:puerto:created", invalidatePuerto)
      socket.off("catalog:puerto:updated", invalidatePuerto)
      socket.off("catalog:puerto:removed", invalidatePuerto)
      socket.off("catalog:muelle:created", invalidateMuelle)
      socket.off("catalog:muelle:updated", invalidateMuelle)
      socket.off("catalog:muelle:removed", invalidateMuelle)

      socket.off("notif:atencion:available", handleOpNotifAtencionAvailable)
      socket.off("notif:turno:claimed", handleOpNotifTurno)
      socket.off("notif:turno:assigned", handleOpNotifTurno)
      socket.off("notif:turno:canceled", handleOpNotifTurno)
      socket.off("notif:turno:changed", handleOpNotifTurno)
      socket.off("notif:turno:checkInReminder", handleOpNotifTurno)
      socket.off("notif:guide:penalized", handleOpNotifPenalty)
      socket.off("notif:supervisor:checkInPending", handleOpNotifCheckInPending)
      socket.off("notif:recalada:overdue", handleOpNotifRecaladaOverdue)
      socket.off("notif:atencion:nearWithFreeTurnos", handleOpNotifAtencionNear)
    }
  }, [accessToken, clearSession, currentUserId, queryClient, showToast])
}
