"use client"

import { Ship, MapPin, Calendar, Clock, ArrowRight } from "lucide-react"
import { GlassCard } from "@/shared/components/glass/GlassCard"
import type { RecaladaListItem } from "@/core/models/recaladas"
import { RecaladaStatusBadge } from "./RecaladaStatusBadge"

interface RecaladaCardProps {
  recalada: RecaladaListItem
  index?: number
  onClick?: () => void
}

export function RecaladaCard({ recalada, index = 0, onClick }: RecaladaCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <GlassCard
      hover
      onClick={onClick}
      className="animate-fade-in-up group"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[rgb(var(--color-primary)/0.1)] flex items-center justify-center">
              <Ship className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            </div>
            <div>
              <p className="font-semibold text-[rgb(var(--color-fg))]">{recalada.buque.nombre}</p>
              <p className="text-xs text-[rgb(var(--color-muted))]">{recalada.codigoRecalada}</p>
            </div>
          </div>
          <RecaladaStatusBadge status={recalada.operationalStatus} />
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-muted))]">
            <MapPin className="w-4 h-4" />
            <span>{recalada.paisOrigen.nombre}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-muted))]">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(recalada.fechaLlegada)}</span>
            <Clock className="w-4 h-4 ml-2" />
            <span>{formatTime(recalada.fechaLlegada)}</span>
          </div>
          {recalada.terminal && (
            <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-muted))]">
              <span className="text-xs bg-[rgb(var(--color-glass)/0.5)] px-2 py-0.5 rounded">
                {recalada.terminal}
              </span>
              {recalada.muelle && (
                <span className="text-xs bg-[rgb(var(--color-glass)/0.5)] px-2 py-0.5 rounded">
                  {recalada.muelle}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-[rgb(var(--color-border)/0.06)]">
          <span className="text-xs text-[rgb(var(--color-primary))] flex items-center gap-1 group-hover:gap-2 transition-all">
            Ver detalle
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </GlassCard>
  )
}
