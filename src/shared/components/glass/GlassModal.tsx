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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`glass-strong border border-white/10 p-6 rounded-2xl w-full ${sizeClasses[size]} animate-scale-in shadow-2xl relative overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[rgb(var(--color-primary)/0.1)] to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {title && (
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] bg-clip-text text-transparent">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-all focus-ring hover-lift"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-[rgb(var(--color-fg))]" />
              </button>
            </div>
          )}
          {children}
        </div>
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
    <div className={`flex items-center justify-end gap-3 mt-6 pt-5 border-t border-white/10 ${className}`}>
      {children}
    </div>
  )
}
