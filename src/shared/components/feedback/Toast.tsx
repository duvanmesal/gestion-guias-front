"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
  useCallback,
} from "react"
import { createPortal } from "react-dom"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

type ToastType = "success" | "error" | "info" | "warning"

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  /**
   * Clave de deduplicación. Si se repite dentro de `cooldownMs`, el toast no
   * se vuelve a mostrar (silencio temporal). Sin `id` no hay deduplicación.
   */
  id?: string
  title?: string
  action?: ToastAction
  duration?: number
  /** Ventana de silencio (ms) por `id`. */
  cooldownMs?: number
}

interface Toast {
  id: string
  type: ToastType
  message: string
  title?: string
  action?: ToastAction
  duration?: number
}

interface ToastContextType {
  showToast: (
    type: ToastType,
    message: string,
    durationOrOptions?: number | ToastOptions,
  ) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  // Última vez (ms) que se mostró cada `id` con cooldown activo.
  const lastShownById = useRef<Map<string, number>>(new Map())

  const showToast = useCallback(
    (
      type: ToastType,
      message: string,
      durationOrOptions?: number | ToastOptions,
    ) => {
      const opts: ToastOptions =
        typeof durationOrOptions === "number"
          ? { duration: durationOrOptions }
          : durationOrOptions ?? {}

      // Ventana de silencio: si el mismo `id` se mostró hace poco, no repetir.
      if (opts.id && opts.cooldownMs && opts.cooldownMs > 0) {
        const now = Date.now()
        const last = lastShownById.current.get(opts.id)
        if (last !== undefined && now - last < opts.cooldownMs) return
        lastShownById.current.set(opts.id, now)
      }

      const id = Math.random().toString(36).substring(7)
      const toast: Toast = {
        id,
        type,
        message,
        title: opts.title,
        action: opts.action,
        duration: opts.duration ?? 5000,
      }

      setToasts((prev) => [...prev, toast])
      // Auto-dismiss is handled inside ToastItem so it can animate out first.
    },
    []
  )

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const configs = {
    success: {
      icon: CheckCircle,
      color: "text-[rgb(var(--color-success))]",
      bg: "bg-[rgb(var(--color-success)/0.1)]",
      border: "border-[rgb(var(--color-success)/0.2)]",
      accent: "var(--color-success)",
    },
    error: {
      icon: AlertCircle,
      color: "text-[rgb(var(--color-danger))]",
      bg: "bg-[rgb(var(--color-danger)/0.1)]",
      border: "border-[rgb(var(--color-danger)/0.2)]",
      accent: "var(--color-danger)",
    },
    info: {
      icon: Info,
      color: "text-[rgb(var(--color-primary))]",
      bg: "bg-[rgb(var(--color-primary)/0.1)]",
      border: "border-[rgb(var(--color-primary)/0.2)]",
      accent: "var(--color-primary)",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-[rgb(var(--color-warning))]",
      bg: "bg-[rgb(var(--color-warning)/0.1)]",
      border: "border-[rgb(var(--color-warning)/0.2)]",
      accent: "var(--color-warning)",
    },
  }

  const config = configs[toast.type]
  const Icon = config.icon

  const [show, setShow] = useState(false)
  const [reduce, setReduce] = useState(false)
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const DURATION = reduce ? 0 : 220

  const beginClose = useCallback(() => {
    setShow(false)
    if (exitTimer.current) clearTimeout(exitTimer.current)
    exitTimer.current = setTimeout(onClose, reduce ? 0 : 220)
  }, [onClose, reduce])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduce(mq.matches)

    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setShow(true))
    )
    if (toast.duration && toast.duration > 0) {
      dismissTimer.current = setTimeout(beginClose, toast.duration)
    }
    return () => {
      cancelAnimationFrame(raf)
      if (enterTimer.current) clearTimeout(enterTimer.current)
      if (exitTimer.current) clearTimeout(exitTimer.current)
      if (dismissTimer.current) clearTimeout(dismissTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasLifeBar = !reduce && !!toast.duration && toast.duration > 0

  return (
    <div
      className={`glass-strong pl-5 pr-4 py-4 flex items-start gap-3 border relative overflow-hidden ${config.border}`}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateX(0) scale(1)" : "translateX(20px) scale(0.98)",
        boxShadow: "var(--shadow-floating), var(--glass-inner-highlight)",
        transition: `opacity ${DURATION}ms var(--ease-out-soft), transform ${DURATION}ms var(--ease-out-soft)`,
        willChange: "transform, opacity",
      }}
    >
      {/* Semantic accent strip */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: `rgb(${config.accent})` }}
      />

      <div className={`p-1 rounded ${config.bg} ${show ? "motion-pop" : ""}`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-[rgb(var(--color-fg))] leading-tight">
            {toast.title}
          </p>
        )}
        <p
          className={`text-sm text-[rgb(var(--color-fg))] ${
            toast.title ? "mt-0.5 text-[rgb(var(--color-muted))] font-normal" : "font-medium"
          }`}
        >
          {toast.message}
        </p>
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick()
              beginClose()
            }}
            className="mt-2 inline-flex items-center text-xs font-semibold focus-ring motion-pressable rounded px-2 py-1"
            style={{
              color: `rgb(${config.accent})`,
              background: `rgb(${config.accent} / 0.12)`,
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={beginClose}
        className="p-1 rounded hover:bg-[rgb(var(--color-glass-hover)/0.5)] transition-colors focus-ring motion-pressable shrink-0"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4 text-[rgb(var(--color-muted))]" />
      </button>

      {/* Life bar */}
      {hasLifeBar && (
        <span
          aria-hidden
          className="absolute left-0 bottom-0 h-0.5 w-full origin-left"
          style={{
            background: `rgb(${config.accent})`,
            opacity: 0.55,
            animation: `toast-progress ${toast.duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  )
}
