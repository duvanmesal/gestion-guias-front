"use client"

import React from "react"

import { useState, useEffect } from "react"
import { GlassModal } from "@/shared/components/glass/GlassModal"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassTextarea } from "@/shared/components/glass/GlassTextarea"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { GlassDateTimeInput } from "@/shared/components/glass/GlassDateTimeInput"
import { useAtenciones } from "@/hooks/use-atenciones"
import type { Atencion, CreateAtencionRequest, UpdateAtencionRequest } from "@/core/models/atenciones"

interface AtencionFormDialogProps {
  isOpen: boolean
  onClose: () => void
  recaladaId?: number
  recaladaWindow?: {
    fechaLlegada?: string | null
    fechaSalida?: string | null
  }
  atencion?: Atencion | null
  onSuccess?: () => void
}

function toLocalInputValue(iso?: string | null): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function addHours(iso: string, hours: number): string {
  const date = new Date(iso)
  date.setHours(date.getHours() + hours)
  return date.toISOString()
}

export function AtencionFormDialog({
  isOpen,
  onClose,
  recaladaId,
  recaladaWindow,
  atencion,
  onSuccess,
}: AtencionFormDialogProps) {
  const { createAtencionAsync, updateAtencionAsync, isCreating, isUpdating } = useAtenciones()

  const isEditing = !!atencion

  const [formData, setFormData] = useState({
    fechaInicio: "",
    fechaFin: "",
    turnosTotal: "6",
    descripcion: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen && atencion) {
      setFormData({
        fechaInicio: toLocalInputValue(atencion.fechaInicio),
        fechaFin: toLocalInputValue(atencion.fechaFin),
        turnosTotal: String(atencion.turnosTotal),
        descripcion: atencion.descripcion || "",
      })
    } else if (isOpen) {
      const fallbackStart = new Date()
      fallbackStart.setHours(8, 0, 0, 0)
      const fallbackEnd = new Date()
      fallbackEnd.setHours(12, 0, 0, 0)

      const fechaInicio = recaladaWindow?.fechaLlegada ?? fallbackStart.toISOString()
      const fechaFin =
        recaladaWindow?.fechaSalida ??
        (recaladaWindow?.fechaLlegada ? addHours(recaladaWindow.fechaLlegada, 4) : fallbackEnd.toISOString())

      setFormData({
        fechaInicio: toLocalInputValue(fechaInicio),
        fechaFin: toLocalInputValue(fechaFin),
        turnosTotal: "6",
        descripcion: "",
      })
    }
    setErrors({})
  }, [isOpen, atencion, recaladaWindow?.fechaLlegada, recaladaWindow?.fechaSalida])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fechaInicio) newErrors.fechaInicio = "Ingresa la fecha/hora de inicio"
    if (!formData.fechaFin) newErrors.fechaFin = "Ingresa la fecha/hora de fin"

    if (formData.fechaInicio && formData.fechaFin) {
      const start = new Date(formData.fechaInicio)
      const end = new Date(formData.fechaFin)

      if (end < start) {
        newErrors.fechaFin = "La fecha de fin debe ser mayor o igual al inicio"
      }

      if (recaladaWindow?.fechaLlegada && start < new Date(recaladaWindow.fechaLlegada)) {
        newErrors.fechaInicio = "Debe ser mayor o igual a la llegada de la recalada"
      }

      if (recaladaWindow?.fechaLlegada && end < new Date(recaladaWindow.fechaLlegada)) {
        newErrors.fechaFin = "Debe ser mayor o igual a la llegada de la recalada"
      }

      if (recaladaWindow?.fechaSalida && start > new Date(recaladaWindow.fechaSalida)) {
        newErrors.fechaInicio = "Debe ser menor o igual a la salida de la recalada"
      }

      if (recaladaWindow?.fechaSalida && end > new Date(recaladaWindow.fechaSalida)) {
        newErrors.fechaFin = "Debe ser menor o igual a la salida de la recalada"
      }
    }

    const turnos = Number(formData.turnosTotal)
    if (!formData.turnosTotal || Number.isNaN(turnos) || turnos < 1) {
      newErrors.turnosTotal = "Ingresa un numero valido de turnos (min 1)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      if (isEditing && atencion) {
        const updateData: UpdateAtencionRequest = {
          fechaInicio: new Date(formData.fechaInicio).toISOString(),
          fechaFin: new Date(formData.fechaFin).toISOString(),
          turnosTotal: Number(formData.turnosTotal),
          descripcion: formData.descripcion || null,
        }
        await updateAtencionAsync({ id: atencion.id, data: updateData })
      } else if (recaladaId) {
          const desc = formData.descripcion.trim()

          const createData: CreateAtencionRequest = {
            recaladaId,
            fechaInicio: new Date(formData.fechaInicio).toISOString(),
            fechaFin: new Date(formData.fechaFin).toISOString(),
            turnosTotal: Number(formData.turnosTotal),
            ...(desc ? { descripcion: desc } : {}),
          }
        await createAtencionAsync(createData)
      }
      onSuccess?.()
    } catch {
      // errors are surfaced via React Query's mutation state
    }
  }

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Atencion" : "Nueva Atencion"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassDateTimeInput
            label="Fecha/Hora Inicio *"
            type="datetime-local"
            value={formData.fechaInicio}
            onChange={(v) => setFormData({ ...formData, fechaInicio: v })}
            error={errors.fechaInicio}
          />

          <GlassDateTimeInput
            label="Fecha/Hora Fin *"
            type="datetime-local"
            value={formData.fechaFin}
            onChange={(v) => setFormData({ ...formData, fechaFin: v })}
            error={errors.fechaFin}
          />
        </div>

        <div>
          <GlassInput
            label="Numero de Turnos *"
            type="number"
            value={formData.turnosTotal}
            onChange={(e) => setFormData({ ...formData, turnosTotal: e.target.value })}
            min="1"
            max="100"
            error={errors.turnosTotal}
            helperText={`Se crearan ${formData.turnosTotal || 0} turnos disponibles para esta atencion`}
          />
        </div>

        <div>
          <GlassTextarea
            label="Descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Ej: Ventana de la manana, Grupo A..."
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <GlassButton type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton type="submit" variant="primary" loading={isCreating || isUpdating}>
            {isEditing ? "Guardar Cambios" : "Crear Atencion"}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  )
}
