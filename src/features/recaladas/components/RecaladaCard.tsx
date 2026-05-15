"use client"

import { Ship, MapPin, Calendar, Clock, ArrowRight, AlertTriangle } from "lucide-react"
import { GlassCard } from "@/shared/components/glass/GlassCard"
import type { RecaladaListItem } from "@/core/models/recaladas"
import { RecaladaStatusBadge } from "./RecaladaStatusBadge"

interface RecaladaCardProps {
  recalada: RecaladaListItem
  index?: number
  onClick?: () => void
}

export function RecaladaCard({ recalada, index = 0, onClick }: RecaladaCardProps) {
  const isOverdueDeparture =
    recalada.operationalStatus === "ARRIVED" &&
    !!recalada.fechaSalida &&
    new Date(recalada.fechaSalida).getTime() < Date.now()

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
      className={`relative overflow-hidden animate-fade-in-up group ${
        isOverdueDeparture
          ? "border-[rgb(var(--color-danger)/0.35)] shadow-[0_0_0_1px_rgba(var(--color-danger),0.06)_inset]"
          : ""
      }`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {isOverdueDeparture && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-[rgb(var(--color-danger))]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[rgb(var(--color-danger)/0.10)] blur-2xl"
          />
        </>
      )}

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isOverdueDeparture
                  ? "bg-[rgb(var(--color-danger)/0.12)] ring-1 ring-[rgb(var(--color-danger)/0.20)]"
                  : "bg-[rgb(var(--color-primary)/0.1)]"
              }`}
            >
              <Ship
                className={`w-5 h-5 ${
                  isOverdueDeparture ? "text-[rgb(var(--color-danger))]" : "text-[rgb(var(--color-primary))]"
                }`}
              />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[rgb(var(--color-fg))] truncate">{recalada.buque.nombre}</p>
              <p className="text-xs text-[rgb(var(--color-muted))] truncate">{recalada.codigoRecalada}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <RecaladaStatusBadge status={recalada.operationalStatus} />
            {isOverdueDeparture && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--color-danger)/0.14)] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-[rgb(var(--color-danger))] ring-1 ring-[rgb(var(--color-danger)/0.22)]">
                <AlertTriangle className="h-3 w-3" />
                Zarpe vencido
              </span>
            )}
          </div>
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
          {recalada.fechaSalida && (
            <div
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${
                isOverdueDeparture
                  ? "bg-[rgb(var(--color-danger)/0.10)] text-[rgb(var(--color-danger))] ring-1 ring-inset ring-[rgb(var(--color-danger)/0.18)] font-medium"
                  : "text-[rgb(var(--color-muted))]"
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {isOverdueDeparture ? "Salida venció:" : "Salida programada:"}{" "}
                {formatDate(recalada.fechaSalida)} · {formatTime(recalada.fechaSalida)}
              </span>
            </div>
          )}
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
