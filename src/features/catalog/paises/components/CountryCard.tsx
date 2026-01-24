"use client"

import { MapPin, Ship, Edit, Trash2 } from "lucide-react"
import { GlassCard } from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { StatusBadge } from "../../components/StatusBadge"
import type { Pais } from "@/core/models/catalog"

interface CountryCardProps {
  pais: Pais
  onEdit: () => void
  onDelete: () => void
  onViewBuques: () => void
  canDelete?: boolean
  index?: number
}

export function CountryCard({
  pais,
  onEdit,
  onDelete,
  onViewBuques,
  canDelete = false,
  index = 0,
}: CountryCardProps) {
  return (
    <GlassCard
      hover
      className="animate-fade-in-up group"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[rgb(var(--color-primary)/0.15)] flex items-center justify-center group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            </div>
            <div>
              <h3 className="font-semibold text-[rgb(var(--color-fg))] group-hover:text-[rgb(var(--color-primary))] transition-colors">
                {pais.nombre}
              </h3>
              <span className="inline-block text-xs px-2 py-0.5 rounded glass-subtle text-[rgb(var(--color-muted))] font-mono mt-1">
                {pais.codigo}
              </span>
            </div>
          </div>
          <StatusBadge status={pais.status} size="sm" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[rgb(var(--color-border)/0.06)]">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={onViewBuques}
            className="text-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent)/0.1)]"
          >
            <Ship className="w-4 h-4" />
            Ver buques
          </GlassButton>

          <div className="flex items-center gap-1">
            <GlassButton variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </GlassButton>
            {canDelete && (
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger)/0.1)]"
              >
                <Trash2 className="w-4 h-4" />
              </GlassButton>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
