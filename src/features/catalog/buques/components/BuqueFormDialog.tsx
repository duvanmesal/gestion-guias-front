// src/features/catalog/buques/components/BuqueFormDialog.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
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

type FormState = {
  codigo: string
  nombre: string
  paisId: string
  naviera: string
  capacidad: string
  status: StatusType
}

export function BuqueFormDialog({
  isOpen,
  onClose,
  buque,
  onSuccess,
  defaultPaisId,
}: BuqueFormDialogProps) {
  const { createBuqueAsync, updateBuqueAsync, isCreating, isUpdating } = useBuques()
  const { paises: paisesLookup, isLoading: loadingPaises } = usePaisesLookup()
  const isEditing = !!buque

  const [formData, setFormData] = useState<FormState>({
    codigo: "",
    nombre: "",
    paisId: "",
    naviera: "",
    capacidad: "",
    status: "ACTIVO",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) return

    if (buque) {
      setFormData({
        codigo: buque.codigo ?? "",
        nombre: buque.nombre ?? "",
        paisId: buque.paisId ?? "",
        naviera: buque.naviera ?? "",
        capacidad: buque.capacidad != null ? String(buque.capacidad) : "",
        status: (buque.status ?? "ACTIVO") as StatusType,
      })
    } else {
      setFormData({
        codigo: "",
        nombre: "",
        paisId: defaultPaisId ?? "",
        naviera: "",
        capacidad: "",
        status: "ACTIVO",
      })
    }

    setErrors({})
  }, [buque, isOpen, defaultPaisId])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    const codigo = formData.codigo.trim()
    if (!codigo) {
      newErrors.codigo = "El código es requerido"
    } else if (codigo.length < 2) {
      newErrors.codigo = "El código debe tener mínimo 2 caracteres"
    } else if (codigo.length > 20) {
      newErrors.codigo = "El código debe tener máximo 20 caracteres"
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }

    if (formData.capacidad.trim() !== "") {
      const n = Number(formData.capacidad)
      if (Number.isNaN(n) || !Number.isFinite(n)) {
        newErrors.capacidad = "Capacidad inválida"
      } else if (n <= 0) {
        newErrors.capacidad = "Capacidad debe ser mayor a 0"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      codigo: formData.codigo.trim(),
      nombre: formData.nombre.trim(),
      // IMPORTANT: no mandar null, sino undefined cuando esté vacío
      paisId: formData.paisId ? formData.paisId : undefined,
      naviera: formData.naviera.trim() ? formData.naviera.trim() : undefined,
      capacidad: formData.capacidad.trim() ? Number(formData.capacidad) : undefined,
      status: formData.status,
    }

    try {
      if (isEditing && buque) {
        await updateBuqueAsync({
          id: buque.id,
          data: payload,
        })
      } else {
        await createBuqueAsync(payload)
      }
      onSuccess()
    } catch (error) {
      console.error("Error saving buque:", error)
    }
  }

  const isLoading = isCreating || isUpdating

  const paisOptions = useMemo(
    () => [
      { value: "", label: "Sin país asignado" },
      ...paisesLookup.map((p) => ({
        value: String(p.id),
        label: `${p.nombre} (${p.codigo})`,
      })),
    ],
    [paisesLookup]
  )

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Buque" : "Nuevo Buque"} size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <GlassInput
            label="Código"
            placeholder="Ej: MSC-2026"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            error={errors.codigo}
          />

          <GlassInput
            label="Nombre"
            placeholder="Nombre del buque"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            error={errors.nombre}
          />

          <GlassInput
            label="Naviera (opcional)"
            placeholder="Ej: MSC Cruises"
            value={formData.naviera}
            onChange={(e) => setFormData({ ...formData, naviera: e.target.value })}
          />

          <GlassInput
            label="Capacidad (opcional)"
            placeholder="Ej: 2800"
            value={formData.capacidad}
            onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
            error={errors.capacidad}
          />

          <GlassSelect
            label="País"
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
