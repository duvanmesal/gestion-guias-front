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
  style,
  ...props
}: GlassButtonProps) {
  const base =
    "rounded-xl font-semibold transition-[transform,box-shadow,background-color,opacity,filter] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-ring hover:-translate-y-px hover:brightness-[1.03] active:translate-y-0 active:scale-[0.97] active:brightness-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:translate-y-0 disabled:hover:brightness-100 flex items-center justify-center gap-2 [&_svg]:transition-transform [&_svg]:duration-150 [&:hover_svg:not(.animate-spin)]:translate-x-[1px]"

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--gradient-primary)",
      color: "rgb(var(--color-bg-elevated))",
      border: "none",
      boxShadow: "var(--shadow-primary)",
    },
    secondary: {
      background: "rgba(var(--color-border), 0.04)",
      color: "rgb(var(--color-fg))",
      border: "1px solid rgba(var(--color-border), 0.08)",
    },
    accent: {
      background: "rgba(var(--color-accent), 0.1)",
      color: "rgb(var(--color-accent))",
      border: "1px solid rgba(var(--color-accent), 0.25)",
    },
    glass: {
      background: "rgba(var(--color-border), 0.03)",
      color: "rgb(var(--color-fg))",
      border: "1px solid rgba(var(--color-border), 0.08)",
    },
    danger: {
      background: "var(--gradient-danger)",
      color: "rgb(var(--color-bg-elevated))",
      border: "none",
      boxShadow: "0 4px 14px rgba(var(--color-danger), 0.2)",
    },
    ghost: {
      background: "transparent",
      color: "rgb(var(--color-fg-secondary, var(--color-muted)))",
      border: "none",
    },
  }

  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  }

  return (
    <button
      className={`${base} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      style={{ ...variants[variant], ...style }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}
