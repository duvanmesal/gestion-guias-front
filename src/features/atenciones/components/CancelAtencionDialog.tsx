"use client"

import React from "react"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { GlassModal } from "@/shared/components/glass/GlassModal"
import { GlassTextarea } from "@/shared/components/glass/GlassTextarea"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { useAtencion } from "@/hooks/use-atenciones"

interface CancelAtencionDialogProps {
  isOpen: boolean
  onClose: () => void
  atencionId: number
  onSuccess?: () => void
}

export function CancelAtencionDialog({
  isOpen,
  onClose,
  atencionId,
  onSuccess,
}: CancelAtencionDialogProps) {
  const { cancelAtencionAsync, isCanceling } = useAtencion(atencionId)
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!reason.trim()) {
      setError("Debes ingresar una razon para la cancelacion")
      return
    }

    try {
      await cancelAtencionAsync({ reason: reason.trim() })
      setReason("")
      onSuccess?.()
    } catch (err) {
      setError("Error al cancelar la atencion")
    }
  }

  const handleClose = () => {
    setReason("")
    setError("")
    onClose()
  }

  return (
    <GlassModal isOpen={isOpen} onClose={handleClose} title="Cancelar Atencion" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-[rgb(var(--color-danger)/0.1)] border border-[rgb(var(--color-danger)/0.2)]">
          <AlertTriangle className="w-5 h-5 text-[rgb(var(--color-danger))] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[rgb(var(--color-danger))]">Accion irreversible</p>
            <p className="text-sm text-[rgb(var(--color-muted))]">
              Esta accion cancelara la atencion y liberara todos los turnos asociados.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-1">
            Razon de cancelacion *
          </label>
          <GlassTextarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe el motivo de la cancelacion..."
            rows={3}
          />
          {error && <p className="text-xs text-[rgb(var(--color-danger))] mt-1">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <GlassButton type="button" variant="ghost" onClick={handleClose}>
            Volver
          </GlassButton>
          <GlassButton type="submit" variant="danger" loading={isCanceling}>
            Confirmar Cancelacion
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  )
}
