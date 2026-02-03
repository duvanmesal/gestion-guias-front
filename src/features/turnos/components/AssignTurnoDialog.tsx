"use client"

import React from "react"

import { useState, useEffect } from "react"
import { GlassModal } from "@/shared/components/glass/GlassModal"
import { GlassSelect } from "@/shared/components/glass/GlassSelect"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useTurno } from "@/hooks/use-turnos"
import { useUsers } from "@/hooks/use-users"
import { Rol } from "@/core/models/auth"

interface AssignTurnoDialogProps {
  isOpen: boolean
  onClose: () => void
  turnoId: number
  turnoNumero: number
  onSuccess?: () => void
}

export function AssignTurnoDialog({
  isOpen,
  onClose,
  turnoId,
  turnoNumero,
  onSuccess,
}: AssignTurnoDialogProps) {
  const { showToast } = useToast()
  const { assignTurnoAsync, isAssigning } = useTurno(turnoId)
  const { users, isLoading: loadingUsers } = useUsers({ rol: Rol.GUIA, activo: true })

  const [selectedGuia, setSelectedGuia] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      setSelectedGuia("")
      setError("")
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedGuia) {
      setError("Selecciona un guia")
      return
    }

    try {
      await assignTurnoAsync({ guiaId: selectedGuia })
      showToast("success", `Turno #${turnoNumero} asignado exitosamente`)
      onSuccess?.()
    } catch (err) {
      setError("Error al asignar el turno")
    }
  }

  const guiaOptions = [
    { value: "", label: "Seleccionar guia" },
    ...users.map((u) => ({
      value: u.id,
      label: `${u.nombres || ""} ${u.apellidos || ""} (${u.email})`.trim(),
    })),
  ]

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={`Asignar Turno #${turnoNumero}`} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-1">
            Guia *
          </label>
          <GlassSelect
            options={guiaOptions}
            value={selectedGuia}
            onChange={(e) => setSelectedGuia(e.target.value)}
            disabled={loadingUsers}
          />
          {error && <p className="text-xs text-[rgb(var(--color-danger))] mt-1">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <GlassButton type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton type="submit" variant="primary" loading={isAssigning}>
            Asignar
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  )
}
