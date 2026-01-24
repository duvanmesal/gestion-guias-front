"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { GlassModal, GlassModalFooter } from "@/shared/components/glass/GlassModal"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { usePaises } from "@/hooks/use-paises"
import type { Pais } from "@/core/models/catalog"

interface DeletePaisDialogProps {
  isOpen: boolean
  onClose: () => void
  pais: Pais | null
  onSuccess: () => void
  onError: (message: string) => void
}

export function DeletePaisDialog({ isOpen, onClose, pais, onSuccess, onError }: DeletePaisDialogProps) {
  const { deletePaisAsync, isDeleting } = usePaises()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!pais) return

    setError(null)

    try {
      await deletePaisAsync(pais.id)
      onSuccess()
    } catch (err: any) {
      const errorMessage =
        err?.response?.status === 409
          ? "No se puede eliminar: existen buques asociados a este pais"
          : "Error al eliminar el pais"
      setError(errorMessage)
      onError(errorMessage)
    }
  }

  if (!pais) return null

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Eliminar Pais" size="sm">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        <p className="text-[rgb(var(--color-fg))] mb-2">
          Estas seguro que deseas eliminar el pais{" "}
          <span className="font-semibold text-[rgb(var(--color-primary))]">{pais.nombre}</span>?
        </p>
        <p className="text-sm text-[rgb(var(--color-fg)/0.6)]">Esta accion no se puede deshacer.</p>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      <GlassModalFooter className="justify-center">
        <GlassButton type="button" variant="ghost" onClick={onClose} disabled={isDeleting}>
          Cancelar
        </GlassButton>
        <GlassButton type="button" variant="danger" onClick={handleDelete} loading={isDeleting}>
          Eliminar
        </GlassButton>
      </GlassModalFooter>
    </GlassModal>
  )
}
