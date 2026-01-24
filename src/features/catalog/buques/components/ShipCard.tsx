"use client"

import { Ship, MapPin, Edit, Power } from "lucide-react"
import { GlassCard } from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { StatusBadge } from "../../components/StatusBadge"
import type { Buque } from "@/core/models/catalog"

interface ShipCardProps {
  buque: Buque
  onEdit: () => void
  onToggleStatus: () => void
  canToggleStatus?: boolean
  index?: number
}

export function ShipCard({
  buque,
  onEdit,
  onToggleStatus,
  canToggleStatus = false,
  index = 0,
}: ShipCardProps) {
  const isInactive = buque.status === "INACTIVO"

  return (
    <GlassCard
      hover
      className={`animate-fade-in-up group ${isInactive ? "opacity-70" : ""}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[rgb(var(--color-accent)/0.15)] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Ship className="w-5 h-5 text-[rgb(var(--color-accent))]" />
            </div>
            <div>
              <h3 className="font-semibold text-[rgb(var(--color-fg))] group-hover:text-[rgb(var(--color-accent))] transition-colors">
                {buque.nombre}
              </h3>
              {buque.pais && (
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3 h-3 text-[rgb(var(--color-muted))]" />
                  <span className="text-xs text-[rgb(var(--color-muted))]">
                    {buque.pais.nombre} ({buque.pais.codigo})
                  </span>
                </div>
              )}
            </div>
          </div>
          <StatusBadge status={buque.status} size="sm" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-1 pt-4 border-t border-[rgb(var(--color-border)/0.06)]">
          <GlassButton variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4" />
            Editar
          </GlassButton>
          {canToggleStatus && (
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={onToggleStatus}
              className={
                isInactive
                  ? "text-[rgb(var(--color-success))] hover:bg-[rgb(var(--color-success)/0.1)]"
                  : "text-[rgb(var(--color-warning))] hover:bg-[rgb(var(--color-warning)/0.1)]"
              }
            >
              <Power className="w-4 h-4" />
              {isInactive ? "Activar" : "Desactivar"}
            </GlassButton>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
