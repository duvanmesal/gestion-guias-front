"use client"

import { GlassModal, GlassModalFooter } from "@/shared/components/glass/GlassModal"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useUsers } from "@/hooks/use-users"
import type { User } from "@/core/models/auth"
import type { AxiosError } from "axios"
import type { ApiResponse } from "@/core/models/api"
import { AlertTriangle } from "lucide-react"

interface DeleteUserDialogProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSuccess?: () => void
}

export function DeleteUserDialog({ isOpen, onClose, user, onSuccess }: DeleteUserDialogProps) {
  const { showToast } = useToast()
  const { deleteUser, isDeleting } = useUsers()

  const handleDelete = () => {
    if (!user) return

    deleteUser(user.id, {
      onSuccess: () => {
        onSuccess?.()
      },
      onError: (error) => {
        const axiosError = error as AxiosError<ApiResponse<unknown>>
        const errorMessage = axiosError.response?.data?.error?.message || "Error al eliminar usuario"
        showToast("error", errorMessage)
      },
    })
  }

  if (!user) return null

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Eliminar Usuario" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 glass border border-red-400/20 bg-red-400/10 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400 mb-1">Esta acción no se puede deshacer</p>
            <p className="text-sm text-[rgb(var(--color-fg)/0.8)]">
              ¿Estás seguro de que deseas eliminar al usuario <strong>{user.email}</strong>?
            </p>
          </div>
        </div>

        <GlassModalFooter>
          <GlassButton type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton type="button" variant="danger" onClick={handleDelete} loading={isDeleting}>
            Eliminar
          </GlassButton>
        </GlassModalFooter>
      </div>
    </GlassModal>
  )
}
