"use client"

import { useState } from "react"
import { LayoutGrid, CheckCircle, XCircle, Pencil } from "lucide-react"
import { AppShell } from "@/shared/components/layout/AppShell"
import { GlassCard, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { GlassTextarea } from "@/shared/components/glass/GlassTextarea"
import { GlassModal, GlassModalFooter } from "@/shared/components/glass/GlassModal"
import { useToast } from "@/shared/components/feedback/Toast"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import { useSlots } from "@/hooks/use-slots"
import type { SlotOperativo } from "@/core/api"

type ToggleFormState = {
  status: "ACTIVO" | "INACTIVO"
  motivoInactividad: string
}

export function SlotsPage() {
  const { user } = useAuthStore()
  const { showToast } = useToast()
  const { slots, isLoading, toggleSlotAsync, isToggling } = useSlots()

  const [editing, setEditing] = useState<SlotOperativo | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<ToggleFormState>({ status: "ACTIVO", motivoInactividad: "" })

  const canEdit = user?.rol === Rol.SUPER_ADMIN

  function openToggle(slot: SlotOperativo) {
    const nextStatus = slot.status === "ACTIVO" ? "INACTIVO" : "ACTIVO"
    setEditing(slot)
    setFormData({ status: nextStatus, motivoInactividad: slot.motivoInactividad ?? "" })
    setIsOpen(true)
  }

  async function handleSubmit() {
    if (!editing) return
    try {
      await toggleSlotAsync({
        id: editing.id,
        data: {
          status: formData.status,
          motivoInactividad: formData.status === "INACTIVO" ? formData.motivoInactividad || null : null,
        },
      })
      showToast("success", `Slot ${editing.numero} actualizado a ${formData.status}`)
      setIsOpen(false)
      setEditing(null)
    } catch {
      showToast("error", "Error al actualizar el slot")
    }
  }

  return (
    <AppShell>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <LayoutGrid className="w-6 h-6 text-[rgb(var(--color-primary))]" />
          <div>
            <h1 className="text-xl font-semibold text-[rgb(var(--color-fg))]">Slots Operativos</h1>
            <p className="text-sm text-[rgb(var(--color-fg-muted))]">
              Gestión de los 4 slots fijos del puerto de cruceros
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-[rgb(var(--color-fg-muted))]">Cargando slots...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {slots.map((slot) => (
              <GlassCard key={slot.id}>
                <GlassCardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    {slot.status === "ACTIVO" ? (
                      <CheckCircle className="w-5 h-5 text-[rgb(var(--color-success))]" />
                    ) : (
                      <XCircle className="w-5 h-5 text-[rgb(var(--color-danger))]" />
                    )}
                    <div>
                      <p className="font-semibold text-[rgb(var(--color-fg))]">
                        Slot {slot.numero}
                      </p>
                      <p className="text-xs text-[rgb(var(--color-fg-muted))]">
                        {slot.status === "ACTIVO"
                          ? "Activo"
                          : slot.motivoInactividad
                            ? `Inactivo: ${slot.motivoInactividad}`
                            : "Inactivo"}
                      </p>
                    </div>
                  </div>
                  {canEdit && (
                    <GlassButton
                      size="sm"
                      variant="ghost"
                      onClick={() => openToggle(slot)}
                    >
                      <Pencil className="w-4 h-4" />
                    </GlassButton>
                  )}
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      <GlassModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Cambiar estado — Slot ${editing?.numero}`}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            {(["ACTIVO", "INACTIVO"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFormData({ ...formData, status: s })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  formData.status === s
                    ? "bg-[rgb(var(--color-primary))] text-white border-[rgb(var(--color-primary))]"
                    : "border-[rgb(var(--color-border))] text-[rgb(var(--color-fg-muted))]"
                }`}
              >
                {s === "ACTIVO" ? "Activar" : "Desactivar"}
              </button>
            ))}
          </div>

          {formData.status === "INACTIVO" && (
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-1">
                Motivo de inactividad
              </label>
              <GlassTextarea
                value={formData.motivoInactividad}
                onChange={(e) => setFormData({ ...formData, motivoInactividad: e.target.value })}
                placeholder="Ej: Mantenimiento, ocupado por otro operador..."
                rows={2}
              />
            </div>
          )}
        </div>
        <GlassModalFooter>
          <GlassButton variant="ghost" onClick={() => setIsOpen(false)}>
            Cancelar
          </GlassButton>
          <GlassButton variant="primary" loading={isToggling} onClick={handleSubmit}>
            Guardar
          </GlassButton>
        </GlassModalFooter>
      </GlassModal>
    </AppShell>
  )
}
