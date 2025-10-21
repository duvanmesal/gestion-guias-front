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
    "rounded-xl font-medium transition-all focus-ring active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] text-white shadow-lg hover:shadow-xl hover:brightness-110 border border-white/10",
    glass: "glass border border-white/10 text-[rgb(var(--color-fg))] hover:bg-white/10 hover:border-white/20",
    danger:
      "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl hover:brightness-110 border border-white/10",
    ghost: "text-[rgb(var(--color-fg))] hover:bg-white/5",
  }

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-2.5",
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
