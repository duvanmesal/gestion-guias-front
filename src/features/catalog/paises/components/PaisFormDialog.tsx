"use client"

import React from "react"

import { useState, useEffect } from "react"
import { GlassModal, GlassModalFooter } from "@/shared/components/glass/GlassModal"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassSelect } from "@/shared/components/glass/GlassSelect"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { usePaises } from "@/hooks/use-paises"
import type { Pais, StatusType } from "@/core/models/catalog"

interface PaisFormDialogProps {
  isOpen: boolean
  onClose: () => void
  pais?: Pais | null
  onSuccess: () => void
}

export function PaisFormDialog({ isOpen, onClose, pais, onSuccess }: PaisFormDialogProps) {
  const { createPaisAsync, updatePaisAsync, isCreating, isUpdating } = usePaises()
  const isEditing = !!pais

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    status: "ACTIVO" as StatusType,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (pais) {
      setFormData({
        codigo: pais.codigo,
        nombre: pais.nombre,
        status: pais.status,
      })
    } else {
      setFormData({
        codigo: "",
        nombre: "",
        status: "ACTIVO",
      })
    }
    setErrors({})
  }, [pais, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.codigo.trim()) {
      newErrors.codigo = "El codigo es requerido"
    } else if (formData.codigo.length < 2 || formData.codigo.length > 10) {
      newErrors.codigo = "El codigo debe tener entre 2 y 10 caracteres"
    }

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
      if (isEditing && pais) {
        await updatePaisAsync({
          id: pais.id,
          data: {
            codigo: formData.codigo,
            nombre: formData.nombre,
            status: formData.status,
          },
        })
      } else {
        await createPaisAsync({
          codigo: formData.codigo,
          nombre: formData.nombre,
          status: formData.status,
        })
      }
      onSuccess()
    } catch (error) {
      console.error("Error saving pais:", error)
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Pais" : "Nuevo Pais"} size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <GlassInput
            label="Codigo"
            placeholder="Ej: MX, US, CO"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
            error={errors.codigo}
            maxLength={10}
          />

          <GlassInput
            label="Nombre"
            placeholder="Nombre del pais"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            error={errors.nombre}
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
            {isEditing ? "Guardar cambios" : "Crear pais"}
          </GlassButton>
        </GlassModalFooter>
      </form>
    </GlassModal>
  )
}
