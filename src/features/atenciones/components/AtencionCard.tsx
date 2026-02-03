"use client"

import { Clock, Users, ArrowRight, CalendarClock } from "lucide-react"
import { GlassCard } from "@/shared/components/glass/GlassCard"
import type { AtencionListItem } from "@/core/models/atenciones"
import { AtencionStatusBadge } from "./AtencionStatusBadge"

interface AtencionCardProps {
  atencion: AtencionListItem
  index?: number
  onClick?: () => void
}

export function AtencionCard({ atencion, index = 0, onClick }: AtencionCardProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
    })
  }

  const getDuration = () => {
    const start = new Date(atencion.fechaInicio)
    const end = new Date(atencion.fechaFin)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${diffHours}h ${diffMins}m`
  }

  return (
    <GlassCard
      hover
      onClick={onClick}
      className="animate-fade-in-up group"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[rgb(var(--color-accent)/0.1)] flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-[rgb(var(--color-accent))]" />
            </div>
            <div>
              <p className="font-semibold text-[rgb(var(--color-fg))]">
                {formatDate(atencion.fechaInicio)}
              </p>
              <p className="text-xs text-[rgb(var(--color-muted))]">
                {formatTime(atencion.fechaInicio)} - {formatTime(atencion.fechaFin)}
              </p>
            </div>
          </div>
          <AtencionStatusBadge status={atencion.operationalStatus} />
        </div>

        {/* Info */}
        <div className="flex items-center gap-4 text-sm text-[rgb(var(--color-muted))]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{getDuration()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{atencion.turnosTotal} turnos</span>
          </div>
        </div>

        {/* Description */}
        {atencion.descripcion && (
          <p className="text-sm text-[rgb(var(--color-muted))] line-clamp-2">
            {atencion.descripcion}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-[rgb(var(--color-border)/0.06)]">
          <span className="text-xs text-[rgb(var(--color-primary))] flex items-center gap-1 group-hover:gap-2 transition-all">
            Ver turnero
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </GlassCard>
  )
}
