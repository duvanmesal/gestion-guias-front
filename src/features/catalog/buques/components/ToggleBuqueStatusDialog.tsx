"use client"

import { Power, AlertTriangle } from "lucide-react"
import { GlassModal, GlassModalFooter } from "@/shared/components/glass/GlassModal"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { useBuques } from "@/hooks/use-buques"
import type { Buque } from "@/core/models/catalog"

interface ToggleBuqueStatusDialogProps {
  isOpen: boolean
  onClose: () => void
  buque: Buque | null
  onSuccess: () => void
}

export function ToggleBuqueStatusDialog({ isOpen, onClose, buque, onSuccess }: ToggleBuqueStatusDialogProps) {
  const { updateBuqueAsync, isUpdating } = useBuques()

  const handleToggle = async () => {
    if (!buque) return

    try {
      await updateBuqueAsync({
        id: buque.id,
        data: {
          status: buque.status === "ACTIVO" ? "INACTIVO" : "ACTIVO",
        },
      })
      onSuccess()
    } catch (error) {
      console.error("Error toggling buque status:", error)
    }
  }

  if (!buque) return null

  const isActivating = buque.status === "INACTIVO"

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={isActivating ? "Activar Buque" : "Desactivar Buque"}
      size="sm"
    >
      <div className="text-center">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
            isActivating
              ? "bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/20"
              : "bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/20"
          }`}
        >
          {isActivating ? (
            <Power className="w-8 h-8 text-green-400" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-orange-400" />
          )}
        </div>

        <p className="text-[rgb(var(--color-fg))] mb-2">
          {isActivating ? "Deseas activar el buque " : "Deseas desactivar el buque "}
          <span className="font-semibold text-[rgb(var(--color-primary))]">{buque.nombre}</span>?
        </p>
        <p className="text-sm text-[rgb(var(--color-fg)/0.6)]">
          {isActivating
            ? "El buque estara disponible para su uso en el sistema."
            : "El buque quedara marcado como inactivo pero no se eliminara."}
        </p>
      </div>

      <GlassModalFooter className="justify-center">
        <GlassButton type="button" variant="ghost" onClick={onClose} disabled={isUpdating}>
          Cancelar
        </GlassButton>
        <GlassButton
          type="button"
          variant={isActivating ? "primary" : "glass"}
          onClick={handleToggle}
          loading={isUpdating}
        >
          {isActivating ? "Activar" : "Desactivar"}
        </GlassButton>
      </GlassModalFooter>
    </GlassModal>
  )
}
