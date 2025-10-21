"use client"

import { type ReactNode, useEffect } from "react"
import { X } from "lucide-react"

interface GlassModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function GlassModal({ isOpen, onClose, children, title, size = "md" }: GlassModalProps) {
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

  if (!isOpen) return null

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`glass p-6 rounded-2xl w-full ${sizeClasses[size]} animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-[rgb(var(--color-fg))]">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors focus-ring"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-[rgb(var(--color-fg))]" />
            </button>
          </div>
        )}
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
  return <div className={`flex items-center justify-end gap-3 mt-6 ${className}`}>{children}</div>
}
