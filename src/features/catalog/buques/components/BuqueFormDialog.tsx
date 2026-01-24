"use client"

import React from "react"

import { useState, useEffect } from "react"
import { GlassModal, GlassModalFooter } from "@/shared/components/glass/GlassModal"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassSelect } from "@/shared/components/glass/GlassSelect"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { useBuques } from "@/hooks/use-buques"
import { usePaisesLookup } from "@/hooks/use-paises"
import type { Buque, StatusType } from "@/core/models/catalog"

interface BuqueFormDialogProps {
  isOpen: boolean
  onClose: () => void
  buque?: Buque | null
  onSuccess: () => void
  defaultPaisId?: string
}

export function BuqueFormDialog({ isOpen, onClose, buque, onSuccess, defaultPaisId }: BuqueFormDialogProps) {
  const { createBuqueAsync, updateBuqueAsync, isCreating, isUpdating } = useBuques()
  const { paises: paisesLookup, isLoading: loadingPaises } = usePaisesLookup()
  const isEditing = !!buque

  const [formData, setFormData] = useState({
    nombre: "",
    paisId: "",
    status: "ACTIVO" as StatusType,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (buque) {
      setFormData({
        nombre: buque.nombre,
        paisId: buque.paisId || "",
        status: buque.status,
      })
    } else {
      setFormData({
        nombre: "",
        paisId: defaultPaisId || "",
        status: "ACTIVO",
      })
    }
    setErrors({})
  }, [buque, isOpen, defaultPaisId])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      if (isEditing && buque) {
        await updateBuqueAsync({
          id: buque.id,
          data: {
            nombre: formData.nombre,
            paisId: formData.paisId || null,
            status: formData.status,
          },
        })
      } else {
        await createBuqueAsync({
          nombre: formData.nombre,
          paisId: formData.paisId || null,
          status: formData.status,
        })
      }
      onSuccess()
    } catch (error) {
      console.error("Error saving buque:", error)
    }
  }

  const isLoading = isCreating || isUpdating

  const paisOptions = [
    { value: "", label: "Sin pais asignado" },
    ...paisesLookup
      .filter((p) => p.status === "ACTIVO")
      .map((p) => ({
        value: p.id,
        label: `${p.nombre} (${p.codigo})`,
      })),
  ]

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Buque" : "Nuevo Buque"} size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <GlassInput
            label="Nombre"
            placeholder="Nombre del buque"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            error={errors.nombre}
          />

          <GlassSelect
            label="Pais"
            options={paisOptions}
            value={formData.paisId}
            onChange={(e) => setFormData({ ...formData, paisId: e.target.value })}
            disabled={loadingPaises}
          />

          <GlassSelect
            label="Estado"
            options={[
              { value: "ACTIVO", label: "Activo" },
              { value: "INACTIVO", label: "Inactivo" },
            ]}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusType })}
          />
        </div>

        <GlassModalFooter>
          <GlassButton type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </GlassButton>
          <GlassButton type="submit" variant="primary" loading={isLoading}>
            {isEditing ? "Guardar cambios" : "Crear buque"}
          </GlassButton>
        </GlassModalFooter>
      </form>
    </GlassModal>
  )
}
