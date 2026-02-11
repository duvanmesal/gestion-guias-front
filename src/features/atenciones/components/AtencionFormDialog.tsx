"use client"

import React from "react"

import { useState, useEffect } from "react"
import { GlassModal } from "@/shared/components/glass/GlassModal"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassTextarea } from "@/shared/components/glass/GlassTextarea"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { useAtenciones } from "@/hooks/use-atenciones"
import type { Atencion, CreateAtencionRequest, UpdateAtencionRequest } from "@/core/models/atenciones"

interface AtencionFormDialogProps {
  isOpen: boolean
  onClose: () => void
  recaladaId?: number
  atencion?: Atencion | null
  onSuccess?: () => void
}

export function AtencionFormDialog({
  isOpen,
  onClose,
  recaladaId,
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
        fechaInicio: atencion.fechaInicio ? atencion.fechaInicio.slice(0, 16) : "",
        fechaFin: atencion.fechaFin ? atencion.fechaFin.slice(0, 16) : "",
        turnosTotal: String(atencion.turnosTotal),
        descripcion: atencion.descripcion || "",
      })
    } else if (isOpen) {
      // Default to today with some reasonable times
      const now = new Date()
      const startTime = new Date(now)
      startTime.setHours(8, 0, 0, 0)
      const endTime = new Date(now)
      endTime.setHours(12, 0, 0, 0)

      setFormData({
        fechaInicio: startTime.toISOString().slice(0, 16),
        fechaFin: endTime.toISOString().slice(0, 16),
        turnosTotal: "6",
        descripcion: "",
      })
    }
    setErrors({})
  }, [isOpen, atencion])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fechaInicio) newErrors.fechaInicio = "Ingresa la fecha/hora de inicio"
    if (!formData.fechaFin) newErrors.fechaFin = "Ingresa la fecha/hora de fin"

    if (formData.fechaInicio && formData.fechaFin) {
      if (new Date(formData.fechaFin) <= new Date(formData.fechaInicio)) {
        newErrors.fechaFin = "La fecha de fin debe ser posterior al inicio"
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
            ...(desc ? { descripcion: desc } : {}), // 👈 si está vacío, NO lo envía
          }
        await createAtencionAsync(createData)
      }
      onSuccess?.()
    } catch (error) {
      console.error("Error saving atencion:", error)
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
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-1">
              Fecha/Hora Inicio *
            </label>
            <GlassInput
              type="datetime-local"
              value={formData.fechaInicio}
              onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
            />
            {errors.fechaInicio && (
              <p className="text-xs text-[rgb(var(--color-danger))] mt-1">{errors.fechaInicio}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-1">
              Fecha/Hora Fin *
            </label>
            <GlassInput
              type="datetime-local"
              value={formData.fechaFin}
              onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
            />
            {errors.fechaFin && (
              <p className="text-xs text-[rgb(var(--color-danger))] mt-1">{errors.fechaFin}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-1">
            Numero de Turnos *
          </label>
          <GlassInput
            type="number"
            value={formData.turnosTotal}
            onChange={(e) => setFormData({ ...formData, turnosTotal: e.target.value })}
            min="1"
            max="100"
          />
          {errors.turnosTotal && (
            <p className="text-xs text-[rgb(var(--color-danger))] mt-1">{errors.turnosTotal}</p>
          )}
          <p className="text-xs text-[rgb(var(--color-muted))] mt-1">
            Se crearan {formData.turnosTotal || 0} turnos disponibles para esta atencion
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-1">
            Descripcion
          </label>
          <GlassTextarea
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
