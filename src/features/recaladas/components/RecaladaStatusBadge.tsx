"use client"

import { Clock, CheckCircle, Ship, XCircle } from "lucide-react"
import type { RecaladaOperativeStatus } from "@/core/models/recaladas"

interface RecaladaStatusBadgeProps {
  status: RecaladaOperativeStatus
  size?: "sm" | "md"
}

const statusConfig: Record<
  RecaladaOperativeStatus,
  { label: string; icon: typeof Clock; colorClass: string }
> = {
  SCHEDULED: {
    label: "Programada",
    icon: Clock,
    colorClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  ARRIVED: {
    label: "Arribada",
    icon: CheckCircle,
    colorClass: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  DEPARTED: {
    label: "Zarpada",
    icon: Ship,
    colorClass: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  CANCELED: {
    label: "Cancelada",
    icon: XCircle,
    colorClass: "bg-red-500/10 text-red-500 border-red-500/20",
  },
}

export function RecaladaStatusBadge({ status, size = "sm" }: RecaladaStatusBadgeProps) {
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
