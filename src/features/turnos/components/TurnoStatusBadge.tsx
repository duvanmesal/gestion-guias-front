"use client"

import type { TurnoStatus } from "@/core/models/turnos"

interface TurnoStatusBadgeProps {
  status: TurnoStatus
}

const statusConfig: Record<TurnoStatus, { label: string; cssVar: string }> = {
  AVAILABLE:   { label: "Libre",      cssVar: "--color-success" },
  ASSIGNED:    { label: "Asignado",   cssVar: "--color-info" },
  IN_PROGRESS: { label: "En curso",   cssVar: "--color-warning" },
  COMPLETED:   { label: "Completado", cssVar: "--color-primary" },
  CANCELED:    { label: "Cancelado",  cssVar: "--color-muted" },
  NO_SHOW:     { label: "No-show",    cssVar: "--color-danger" },
}

export function TurnoStatusBadge({ status }: TurnoStatusBadgeProps) {
  const cfg = statusConfig[status]
  return (
    <span
      className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-md font-semibold whitespace-nowrap leading-none"
      style={{
        color:      `rgb(var(${cfg.cssVar}))`,
        background: `rgba(var(${cfg.cssVar}), 0.13)`,
        border:     `1px solid rgba(var(${cfg.cssVar}), 0.25)`,
      }}
    >
      {cfg.label}
    </span>
  )
}
