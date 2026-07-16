import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { socketClient } from "@/core/socket/socket.client"

interface RecaladaSocketPayload {
  recaladaId?: number
}

interface UseRecaladaSocketOptions {
  recaladaId?: number
}

export function useRecaladaSocket({ recaladaId }: UseRecaladaSocketOptions = {}) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = socketClient.getSocket()
    if (!socket) return

    if (recaladaId) {
      socket.emit("join:recalada", recaladaId)
    }

    const invalidate = (payload: RecaladaSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: ["recaladas"] })
      if (payload.recaladaId) {
        queryClient.invalidateQueries({ queryKey: ["recalada", payload.recaladaId] })
      }
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] })
    }

    const invalidateWithAtenciones = (payload: RecaladaSocketPayload) => {
      invalidate(payload)
      queryClient.invalidateQueries({ queryKey: ["atenciones"] })
    }

    const onCreated = (_p: RecaladaSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: ["recaladas"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] })
    }

    socket.on("recalada:created", onCreated)
    socket.on("recalada:updated", invalidate)
    socket.on("recalada:arrived", invalidate)
    socket.on("recalada:departed", invalidate)
    socket.on("recalada:canceled", invalidateWithAtenciones)
    socket.on("recalada:bulkChanged", onCreated)

    return () => {
      if (recaladaId) socket.emit("leave:recalada", recaladaId)
      socket.off("recalada:created", onCreated)
      socket.off("recalada:updated", invalidate)
      socket.off("recalada:arrived", invalidate)
      socket.off("recalada:departed", invalidate)
      socket.off("recalada:canceled", invalidateWithAtenciones)
      socket.off("recalada:bulkChanged", onCreated)
    }
  }, [recaladaId, queryClient])
}
