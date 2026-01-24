'use client';

import React from "react"

import type { ReactNode } from "react"

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
  ...rest
}: GlassCardProps) {
  const variantClasses = {
    default: "glass",
    subtle: "glass-subtle",
    strong: "glass-strong",
  }

  const hoverClass = hover ? "glass-hover cursor-pointer" : ""
  const clickableClass = onClick ? "cursor-pointer" : ""

  return (
    <div
      className={`${variantClasses[variant]} p-6 ${hoverClass} ${clickableClass} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  )
}

export type GlassCardHeaderProps = React.HTMLAttributes<HTMLDivElement>

export function GlassCardHeader({
  children,
  className = "",
  ...rest
}: GlassCardHeaderProps) {
  return (
    <div className={`mb-5 ${className}`} {...rest}>
      {children}
    </div>
  )
}

export type GlassCardTitleProps = React.HTMLAttributes<HTMLHeadingElement>

export function GlassCardTitle({
  children,
  className = "",
  ...rest
}: GlassCardTitleProps) {
  return (
    <h3
      className={`text-lg font-bold text-[rgb(var(--color-fg))] tracking-tight ${className}`}
      {...rest}
    >
      {children}
    </h3>
  )
}

export type GlassCardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export function GlassCardDescription({
  children,
  className = "",
  ...rest
}: GlassCardDescriptionProps) {
  return (
    <p
      className={`text-sm text-[rgb(var(--color-muted))] mt-1 ${className}`}
      {...rest}
    >
      {children}
    </p>
  )
}

export type GlassCardContentProps = React.HTMLAttributes<HTMLDivElement>

export function GlassCardContent({
  children,
  className = "",
  ...rest
}: GlassCardContentProps) {
  return (
    <div className={`text-[rgb(var(--color-fg)/0.9)] ${className}`} {...rest}>
      {children}
    </div>
  )
}

export type GlassCardFooterProps = React.HTMLAttributes<HTMLDivElement>

export function GlassCardFooter({
  children,
  className = "",
  ...rest
}: GlassCardFooterProps) {
  return (
    <div
      className={`mt-5 pt-4 border-t border-[rgb(var(--color-border)/0.06)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
