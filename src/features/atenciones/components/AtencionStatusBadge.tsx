"use client"

import { CheckCircle, XCircle, Clock } from "lucide-react"
import type { AtencionOperativeStatus } from "@/core/models/atenciones"

interface AtencionStatusBadgeProps {
  status: AtencionOperativeStatus
  size?: "sm" | "md"
}

const statusConfig: Record<
  AtencionOperativeStatus,
  { label: string; icon: typeof Clock; colorClass: string }
> = {
  OPEN: {
    label: "Abierta",
    icon: Clock,
    colorClass: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  CLOSED: {
    label: "Cerrada",
    icon: CheckCircle,
    colorClass: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  },
  CANCELED: {
    label: "Cancelada",
    icon: XCircle,
    colorClass: "bg-red-500/10 text-red-500 border-red-500/20",
  },
}

export function AtencionStatusBadge({ status, size = "sm" }: AtencionStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.colorClass} ${sizeClasses[size]}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      {config.label}
    </span>
  )
}
