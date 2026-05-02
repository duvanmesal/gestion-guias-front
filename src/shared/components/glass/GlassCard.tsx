'use client';

import React from "react"

export type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean
  variant?: "default" | "subtle" | "strong"
}

export function GlassCard({
  children,
  className = "",
  hover = false,
  variant = "default",
  onClick,
  style,
  ...rest
}: GlassCardProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      background: "rgb(var(--color-bg-elevated))",
      border: "1px solid rgba(var(--color-border), 0.07)",
      boxShadow: "var(--shadow-md)",
      borderRadius: "var(--radius-lg)",
    },
    subtle: {
      background: "rgba(var(--color-border), 0.02)",
      border: "1px solid rgba(var(--color-border), 0.05)",
      boxShadow: "var(--shadow-sm)",
      borderRadius: "var(--radius-md)",
    },
    strong: {
      background: "rgb(var(--color-bg-elevated))",
      border: "1px solid rgba(var(--color-border), 0.07)",
      boxShadow: "var(--shadow-lg)",
      borderRadius: "var(--radius-xl)",
    },
  }

  const hoverStyle: React.CSSProperties = hover
    ? { cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }
    : {}

  return (
    <div
      className={`p-6 ${hover ? "hover:-translate-y-0.5 hover:shadow-lg" : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ ...variantStyles[variant], ...hoverStyle, ...style }}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  )
}

export type GlassCardHeaderProps = React.HTMLAttributes<HTMLDivElement>

export function GlassCardHeader({ children, className = "", ...rest }: GlassCardHeaderProps) {
  return (
    <div className={`mb-5 ${className}`} {...rest}>
      {children}
    </div>
  )
}

export type GlassCardTitleProps = React.HTMLAttributes<HTMLHeadingElement>

export function GlassCardTitle({ children, className = "", ...rest }: GlassCardTitleProps) {
  return (
    <h3
      className={`text-lg font-bold tracking-tight ${className}`}
      style={{ color: "rgb(var(--color-fg))" }}
      {...rest}
    >
      {children}
    </h3>
  )
}

export type GlassCardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export function GlassCardDescription({ children, className = "", ...rest }: GlassCardDescriptionProps) {
  return (
    <p
      className={`text-sm mt-1 ${className}`}
      style={{ color: "rgb(var(--color-muted))" }}
      {...rest}
    >
      {children}
    </p>
  )
}

export type GlassCardContentProps = React.HTMLAttributes<HTMLDivElement>

export function GlassCardContent({ children, className = "", ...rest }: GlassCardContentProps) {
  return (
    <div className={className} style={{ color: "rgb(var(--color-fg))" }} {...rest}>
      {children}
    </div>
  )
}

export type GlassCardFooterProps = React.HTMLAttributes<HTMLDivElement>

export function GlassCardFooter({ children, className = "", ...rest }: GlassCardFooterProps) {
  return (
    <div
      className={`mt-5 pt-4 ${className}`}
      style={{ borderTop: "1px solid rgba(var(--color-border), 0.07)" }}
      {...rest}
    >
      {children}
    </div>
  )
}
