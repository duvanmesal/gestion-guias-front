"use client"

import { type ReactNode, useEffect, useRef, useState } from "react"
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
  const [mounted, setMounted] = useState(isOpen)
  const [shown, setShown] = useState(false)
  const [reduce, setReduce] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduce(mq.matches)
    const h = () => setReduce(mq.matches)
    mq.addEventListener?.("change", h)
    return () => mq.removeEventListener?.("change", h)
  }, [])

  const D_IN = reduce ? 0 : 340
  const D_OUT = reduce ? 0 : 240

  // Mount on open, keep mounted during the exit transition, then unmount.
  useEffect(() => {
    if (isOpen) {
      if (closeTimer.current) clearTimeout(closeTimer.current)
      setMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
    } else {
      setShown(false)
      if (closeTimer.current) clearTimeout(closeTimer.current)
      closeTimer.current = setTimeout(() => setMounted(false), D_OUT)
    }
  }, [isOpen, D_OUT])

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current) }, [])

  // Lock body scroll while the modal occupies the screen.
  useEffect(() => {
    document.body.style.overflow = mounted ? "hidden" : "unset"
    return () => { document.body.style.overflow = "unset" }
  }, [mounted])

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

  if (!mounted) return null

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      style={{
        background: "rgb(var(--color-bg) / 0.72)",
        backdropFilter: shown ? "blur(6px)" : "blur(0px)",
        WebkitBackdropFilter: shown ? "blur(6px)" : "blur(0px)",
        opacity: shown ? 1 : 0,
        transition: `opacity var(--motion-overlay) var(--ease-out-soft), backdrop-filter var(--motion-overlay) var(--ease-out-soft)`,
        willChange: "opacity",
      }}
    >
      <div
        className={`glass-strong rounded-2xl w-full ${sizeClasses[size]} relative flex flex-col max-h-[90dvh]`}
        onClick={(e) => e.stopPropagation()}
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? "translateY(0) scale(1)" : "translateY(14px) scale(0.96)",
          transformOrigin: "center",
          boxShadow: "var(--shadow-modal), var(--glass-inner-highlight)",
          transition: `opacity ${shown ? D_IN : D_OUT}ms ${shown ? "var(--ease-out-soft)" : "var(--ease-in-soft)"}, transform ${shown ? D_IN : D_OUT}ms ${shown ? "var(--ease-out-soft)" : "var(--ease-in-soft)"}`,
          willChange: "transform, opacity",
        }}
      >
        {/* Header */}
        {(title || true) && (
          <div className="flex items-start justify-between p-6 pb-5 shrink-0">
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
              className="p-2 rounded-lg hover:bg-[rgb(var(--color-glass-hover)/0.5)] transition-colors focus-ring -mr-2 -mt-1 active:scale-90"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-[rgb(var(--color-muted))]" />
            </button>
          </div>
        )}

        {/* Content (scroll vertical real dentro del viewport) */}
        <div
          className="overflow-y-auto px-6 pb-6 min-h-0 modal-stagger"
          style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
        >
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
    <div
      className={`flex items-center justify-end gap-3 mt-6 pt-5 border-t border-[rgb(var(--color-border)/0.06)] ${className}`}
    >
      {children}
    </div>
  )
}
