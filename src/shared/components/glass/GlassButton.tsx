import type { ReactNode, ButtonHTMLAttributes } from "react"
import { Loader2 } from "lucide-react"

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "primary" | "glass" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  fullWidth?: boolean
}

export function GlassButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: GlassButtonProps) {
  const baseClasses =
    "rounded-xl font-medium transition-all focus-ring active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"

  const variantClasses = {
    primary: "bg-[rgb(var(--color-primary))] text-white shadow-[var(--shadow)] hover:brightness-110",
    glass: "glass border border-white/20 text-[rgb(var(--color-fg))] hover:bg-white/20",
    danger: "bg-red-600 text-white shadow-[var(--shadow)] hover:bg-red-700",
    ghost: "text-[rgb(var(--color-fg))] hover:bg-white/10",
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  }

  const widthClass = fullWidth ? "w-full" : ""

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}
