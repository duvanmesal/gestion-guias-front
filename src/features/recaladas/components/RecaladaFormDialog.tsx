// src/features/recaladas/components/RecaladaFormDialog.tsx
"use client";

import React, { useEffect, useState } from "react";
import { GlassModal } from "@/shared/components/glass/GlassModal";
import { GlassInput } from "@/shared/components/glass/GlassInput";
import { GlassSelect } from "@/shared/components/glass/GlassSelect";
import { GlassTextarea } from "@/shared/components/glass/GlassTextarea";
import { GlassButton } from "@/shared/components/glass/GlassButton";
import { useBuquesLookup } from "@/hooks/use-buques";
import { usePaisesLookup } from "@/hooks/use-paises";
import { useRecaladas } from "@/hooks/use-recaladas";
import type {
  Recalada,
  CreateRecaladaRequest,
  UpdateRecaladaRequest,
} from "@/core/models/recaladas";

interface RecaladaFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recalada?: Recalada | null;
  onSuccess?: () => void;
}

type FormState = {
  buqueId: string;
  paisOrigenId: string;
  fechaLlegada: string;
  fechaSalida: string;
  terminal: string;
  muelle: string;
  pasajerosEstimados: string;
  tripulacionEstimada: string;
  observaciones: string;
};

export function RecaladaFormDialog({
  isOpen,
  onClose,
  recalada,
  onSuccess,
}: RecaladaFormDialogProps) {
  const { buques, isLoading: loadingBuques } = useBuquesLookup();
  const { paises, isLoading: loadingPaises } = usePaisesLookup();
  const { createRecaladaAsync, updateRecaladaAsync, isCreating, isUpdating } =
    useRecaladas();

  const isEditing = !!recalada;

  const [formData, setFormData] = useState<FormState>({
    buqueId: "",
    paisOrigenId: "",
    fechaLlegada: "",
    fechaSalida: "",
    terminal: "",
    muelle: "",
    pasajerosEstimados: "",
    tripulacionEstimada: "",
    observaciones: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    if (recalada) {
      setFormData({
        buqueId: recalada.buqueId ? String(recalada.buqueId) : "",
        paisOrigenId: recalada.paisOrigenId
          ? String(recalada.paisOrigenId)
          : "",
        fechaLlegada: recalada.fechaLlegada
          ? recalada.fechaLlegada.slice(0, 16)
          : "",
        fechaSalida: recalada.fechaSalida
          ? recalada.fechaSalida.slice(0, 16)
          : "",
        terminal: recalada.terminal || "",
        muelle: recalada.muelle || "",
        pasajerosEstimados:
          recalada.pasajerosEstimados != null
            ? String(recalada.pasajerosEstimados)
            : "",
        tripulacionEstimada:
          recalada.tripulacionEstimada != null
            ? String(recalada.tripulacionEstimada)
            : "",
        observaciones: recalada.observaciones || "",
      });
    } else {
      setFormData({
        buqueId: "",
        paisOrigenId: "",
        fechaLlegada: "",
        fechaSalida: "",
        terminal: "",
        muelle: "",
        pasajerosEstimados: "",
        tripulacionEstimada: "",
        observaciones: "",
      });
    }

    setErrors({});
  }, [isOpen, recalada]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.buqueId) newErrors.buqueId = "Selecciona un buque";
    if (!formData.paisOrigenId)
      newErrors.paisOrigenId = "Selecciona un país de origen";
    if (!formData.fechaLlegada)
      newErrors.fechaLlegada = "Ingresa la fecha de llegada";

    if (formData.fechaSalida && formData.fechaLlegada) {
      if (new Date(formData.fechaSalida) < new Date(formData.fechaLlegada)) {
        newErrors.fechaSalida =
          "La fecha de salida debe ser posterior a la llegada";
      }
    }

    if (formData.pasajerosEstimados.trim() !== "") {
      const n = Number(formData.pasajerosEstimados);
      if (Number.isNaN(n) || n < 0)
        newErrors.pasajerosEstimados = "Pasajeros inválido";
    }

    if (formData.tripulacionEstimada.trim() !== "") {
      const n = Number(formData.tripulacionEstimada);
      if (Number.isNaN(n) || n < 0)
        newErrors.tripulacionEstimada = "Tripulación inválida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const common = {
      buqueId: formData.buqueId,
      paisOrigenId: formData.paisOrigenId,
      fechaLlegada: new Date(formData.fechaLlegada).toISOString(),
      fechaSalida: formData.fechaSalida
        ? new Date(formData.fechaSalida).toISOString()
        : undefined,
      terminal: formData.terminal.trim() ? formData.terminal.trim() : undefined,
      muelle: formData.muelle.trim() ? formData.muelle.trim() : undefined,
      pasajerosEstimados:
        formData.pasajerosEstimados.trim() !== ""
          ? Number(formData.pasajerosEstimados)
          : undefined,
      tripulacionEstimada:
        formData.tripulacionEstimada.trim() !== ""
          ? Number(formData.tripulacionEstimada)
          : undefined,
      observaciones: formData.observaciones.trim()
        ? formData.observaciones.trim()
        : undefined,
    };

    try {
      if (isEditing && recalada) {
        const updateData: UpdateRecaladaRequest = { ...common };
        await updateRecaladaAsync({ id: recalada.id, data: updateData });
      } else {
        const createData: CreateRecaladaRequest = { ...common };
        await createRecaladaAsync(createData);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving recalada:", error);
    }
  };

  const buqueOptions = [
    { value: "", label: "Seleccionar buque" },
    ...buques.map((b) => ({ value: String(b.id), label: b.nombre })),
  ];

  const paisOptions = [
    { value: "", label: "Seleccionar país" },
    ...paises.map((p) => ({
      value: String(p.id),
      label: `${p.nombre} (${p.codigo})`,
    })),
  ];

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Recalada" : "Nueva Recalada"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-1">
              Buque *
            </label>
            <GlassSelect
              options={buqueOptions}
              value={formData.buqueId}
              onChange={(e) =>
                setFormData({ ...formData, buqueId: e.target.value })
              }
              disabled={loadingBuques}
            />
            {errors.buqueId && (
              <p className="text-xs text-[rgb(var(--color-danger))] mt-1">
                {errors.buqueId}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-1">
              País de Origen *
            </label>
            <GlassSelect
              options={paisOptions}
              value={formData.paisOrigenId}
              onChange={(e) =>
                setFormData({ ...formData, paisOrigenId: e.target.value })
              }
              disabled={loadingPaises}
            />
            {errors.paisOrigenId && (
              <p className="text-xs text-[rgb(var(--color-danger))] mt-1">
                {errors.paisOrigenId}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-1">
              Fecha/Hora Llegada *
            </label>
            <GlassInput
              type="datetime-local"
              value={formData.fechaLlegada}
              onChange={(e) =>
                setFormData({ ...formData, fechaLlegada: e.target.value })
              }
            />
            {errors.fechaLlegada && (
              <p className="text-xs text-[rgb(var(--color-danger))] mt-1">
                {errors.fechaLlegada}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-1">
              Fecha/Hora Salida
            </label>
            <GlassInput
              type="datetime-local"
              value={formData.fechaSalida}
              onChange={(e) =>
                setFormData({ ...formData, fechaSalida: e.target.value })
              }
            />
            {errors.fechaSalida && (
              <p className="text-xs text-[rgb(var(--color-danger))] mt-1">
                {errors.fechaSalida}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-1">
              Terminal
            </label>
            <GlassInput
              type="text"
              value={formData.terminal}
              onChange={(e) =>
                setFormData({ ...formData, terminal: e.target.value })
              }
              placeholder="Ej: Terminal de Cruceros"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-1">
              Muelle
            </label>
            <GlassInput
              type="text"
              value={formData.muelle}
              onChange={(e) =>
                setFormData({ ...formData, muelle: e.target.value })
              }
              placeholder="Ej: Muelle 1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-1">
              Pasajeros Estimados
            </label>
            <GlassInput
              type="number"
              value={formData.pasajerosEstimados}
              onChange={(e) =>
                setFormData({ ...formData, pasajerosEstimados: e.target.value })
              }
              placeholder="0"
              min="0"
            />
            {errors.pasajerosEstimados && (
              <p className="text-xs text-[rgb(var(--color-danger))] mt-1">
                {errors.pasajerosEstimados}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-1">
              Tripulación Estimada
            </label>
            <GlassInput
              type="number"
              value={formData.tripulacionEstimada}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tripulacionEstimada: e.target.value,
                })
              }
              placeholder="0"
              min="0"
            />
            {errors.tripulacionEstimada && (
              <p className="text-xs text-[rgb(var(--color-danger))] mt-1">
                {errors.tripulacionEstimada}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-1">
            Observaciones
          </label>
          <GlassTextarea
            value={formData.observaciones}
            onChange={(e) =>
              setFormData({ ...formData, observaciones: e.target.value })
            }
            placeholder="Notas adicionales..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <GlassButton type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            loading={isCreating || isUpdating}
          >
            {isEditing ? "Guardar Cambios" : "Crear Recalada"}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}
