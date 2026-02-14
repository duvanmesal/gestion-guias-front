// src/features/turnos/components/AssignTurnoDialog.tsx
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { GlassModal } from "@/shared/components/glass/GlassModal"
import { GlassSelect } from "@/shared/components/glass/GlassSelect"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { useToast } from "@/shared/components/feedback/Toast"
import { useTurno } from "@/hooks/use-turnos"
import { useGuidesLookup } from "@/hooks/use-guides"

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

  const { guides = [], isLoading: loadingGuides } = useGuidesLookup({
    activo: true,
    pageSize: 200,
  })

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
      setError("Selecciona un guía")
      return
    }

    try {
      await assignTurnoAsync({ guiaId: selectedGuia })

      showToast("success", `Turno #${turnoNumero} asignado exitosamente`)

      onSuccess?.()
      onClose()
    } catch (err: any) {
      const backendMessage =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        "Error al asignar el turno"

      setError(backendMessage)
    }
  }

  const guiaOptions = useMemo(() => {
    return [
      { value: "", label: "Seleccionar guía" },
      ...guides.map((g) => ({
        value: String(g.guiaId),
        label: `${g.nombres ?? ""} ${g.apellidos ?? ""} (${g.email})`.trim(),
      })),
    ]
  }, [guides])

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={`Asignar Turno #${turnoNumero}`} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-1">
            Guía *
          </label>

          <GlassSelect
            options={guiaOptions}
            value={selectedGuia}
            onChange={(e: any) => setSelectedGuia(e.target.value)}
            disabled={loadingGuides || isAssigning}
          />

          {error && (
            <p className="text-xs text-[rgb(var(--color-danger))] mt-1">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <GlassButton type="button" variant="ghost" onClick={onClose} disabled={isAssigning}>
            Cancelar
          </GlassButton>

          <GlassButton type="submit" variant="primary" loading={isAssigning} disabled={!selectedGuia}>
            Asignar
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  )
}
