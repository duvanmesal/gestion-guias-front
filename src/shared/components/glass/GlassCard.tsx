"use client"

import type { ReactNode } from "react"

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function GlassCard({ children, className = "", hover = false, onClick }: GlassCardProps) {
  const hoverClass = hover ? "glass-hover cursor-pointer" : ""
  const clickableClass = onClick ? "cursor-pointer" : ""

  return (
    <div className={`glass p-6 ${hoverClass} ${clickableClass} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}

interface GlassCardHeaderProps {
  children: ReactNode
  className?: string
}

export function GlassCardHeader({ children, className = "" }: GlassCardHeaderProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>
}

interface GlassCardTitleProps {
  children: ReactNode
  className?: string
}

export function GlassCardTitle({ children, className = "" }: GlassCardTitleProps) {
  return <h3 className={`text-xl font-semibold text-[rgb(var(--color-fg))] ${className}`}>{children}</h3>
}

interface GlassCardContentProps {
  children: ReactNode
  className?: string
}

export function GlassCardContent({ children, className = "" }: GlassCardContentProps) {
  return <div className={`text-[rgb(var(--color-fg)/0.8)] ${className}`}>{children}</div>
}
