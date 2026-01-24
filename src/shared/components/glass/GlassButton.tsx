import type { ReactNode, ButtonHTMLAttributes } from "react"
import { Loader2 } from "lucide-react"

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "primary" | "secondary" | "glass" | "danger" | "ghost" | "accent"
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
    "rounded-xl font-semibold transition-all duration-200 focus-ring active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 relative overflow-hidden"

  const variantClasses = {
    // Verde CORPOTURISMO - Acciones principales
    primary:
      "bg-[rgb(var(--color-primary))] text-white shadow-md hover:shadow-lg hover:brightness-110 border border-[rgb(var(--color-primary))]",
    // Dorado CORPOTURISMO - Acciones secundarias/destacadas
    secondary:
      "bg-[rgb(var(--color-accent))] text-white shadow-md hover:shadow-lg hover:brightness-110 border border-[rgb(var(--color-accent))]",
    // Acento dorado con estilo glass
    accent:
      "glass border border-[rgb(var(--color-accent)/0.3)] text-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent)/0.1)] hover:border-[rgb(var(--color-accent)/0.5)]",
    // Glass style
    glass:
      "glass border border-[rgb(var(--color-border)/0.08)] text-[rgb(var(--color-fg))] hover:bg-[rgb(var(--color-glass-hover)/0.5)] hover:border-[rgb(var(--color-border)/0.12)]",
    // Rojo CORPOTURISMO - Acciones críticas/alertas
    danger:
      "bg-[rgb(var(--color-danger))] text-white shadow-md hover:shadow-lg hover:brightness-110 border border-[rgb(var(--color-danger))]",
    // Ghost - Sin fondo
    ghost:
      "text-[rgb(var(--color-fg)/0.8)] hover:bg-[rgb(var(--color-glass)/0.5)] hover:text-[rgb(var(--color-fg))]",
  }

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
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
