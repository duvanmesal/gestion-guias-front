import { CheckCircle, XCircle } from "lucide-react"
import type { StatusType } from "@/core/models/catalog"

interface StatusBadgeProps {
  status: StatusType
  showIcon?: boolean
  size?: "sm" | "md"
}

export function StatusBadge({ status, showIcon = true, size = "md" }: StatusBadgeProps) {
  const isActive = status === "ACTIVO"

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  }

  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium ${sizeClasses[size]} ${
        isActive
          ? "bg-[rgb(var(--color-success)/0.15)] text-[rgb(var(--color-success))]"
          : "bg-[rgb(var(--color-danger)/0.15)] text-[rgb(var(--color-danger))]"
      }`}
    >
      {showIcon &&
        (isActive ? (
          <CheckCircle className={iconSize} />
        ) : (
          <XCircle className={iconSize} />
        ))}
      {isActive ? "Activo" : "Inactivo"}
    </span>
  )
}
