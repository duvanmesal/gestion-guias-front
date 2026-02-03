"use client"

import type { TurnoStatus } from "@/core/models/turnos"

interface TurnoStatusBadgeProps {
  status: TurnoStatus
}

const statusConfig: Record<TurnoStatus, { label: string; colorClass: string }> = {
  AVAILABLE: {
    label: "Libre",
    colorClass: "bg-green-500/20 text-green-500",
  },
  ASSIGNED: {
    label: "Asignado",
    colorClass: "bg-blue-500/20 text-blue-500",
  },
  IN_PROGRESS: {
    label: "En curso",
    colorClass: "bg-yellow-500/20 text-yellow-600",
  },
  COMPLETED: {
    label: "Completado",
    colorClass: "bg-purple-500/20 text-purple-500",
  },
  CANCELED: {
    label: "Cancelado",
    colorClass: "bg-gray-500/20 text-gray-500",
  },
  NO_SHOW: {
    label: "No-show",
    colorClass: "bg-red-500/20 text-red-500",
  },
}

export function TurnoStatusBadge({ status }: TurnoStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${config.colorClass}`}>
      {config.label}
    </span>
  )
}
