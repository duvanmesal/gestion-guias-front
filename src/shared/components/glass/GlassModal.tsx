"use client"

import { type ReactNode, useEffect } from "react"
import { X } from "lucide-react"

interface GlassModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  description?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function GlassModal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = "md",
}: GlassModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgb(var(--color-bg)/0.8)] backdrop-blur-sm animate-fade-in-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className={`glass-strong p-6 rounded-2xl w-full ${sizeClasses[size]} animate-scale-in relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || true) && (
          <div className="flex items-start justify-between mb-5">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-bold text-[rgb(var(--color-fg))]"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-[rgb(var(--color-muted))] mt-1">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[rgb(var(--color-glass-hover)/0.5)] transition-colors focus-ring -mr-2 -mt-1"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-[rgb(var(--color-muted))]" />
            </button>
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  )
}

interface GlassModalFooterProps {
  children: ReactNode
  className?: string
}

export function GlassModalFooter({ children, className = "" }: GlassModalFooterProps) {
  return (
    <div
      className={`flex items-center justify-end gap-3 mt-6 pt-5 border-t border-[rgb(var(--color-border)/0.06)] ${className}`}
    >
      {children}
    </div>
  )
}
