"use client"

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useCallback,
} from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void
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

  const showToast = useCallback(
    (type: ToastType, message: string, duration = 5000) => {
      const id = Math.random().toString(36).substring(7)
      const toast: Toast = { id, type, message, duration }

      setToasts((prev) => [...prev, toast])

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)
      }
    },
    []
  )

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
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
    },
    error: {
      icon: AlertCircle,
      color: "text-[rgb(var(--color-danger))]",
      bg: "bg-[rgb(var(--color-danger)/0.1)]",
      border: "border-[rgb(var(--color-danger)/0.2)]",
    },
    info: {
      icon: Info,
      color: "text-[rgb(var(--color-primary))]",
      bg: "bg-[rgb(var(--color-primary)/0.1)]",
      border: "border-[rgb(var(--color-primary)/0.2)]",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-[rgb(var(--color-warning))]",
      bg: "bg-[rgb(var(--color-warning)/0.1)]",
      border: "border-[rgb(var(--color-warning)/0.2)]",
    },
  }

  const config = configs[toast.type]
  const Icon = config.icon

  return (
    <div
      className={`glass-strong p-4 flex items-start gap-3 animate-slide-in-left border ${config.border}`}
    >
      <div className={`p-1 rounded ${config.bg}`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      <p className="flex-1 text-sm text-[rgb(var(--color-fg))] font-medium">
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-[rgb(var(--color-glass-hover)/0.5)] transition-colors focus-ring"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4 text-[rgb(var(--color-muted))]" />
      </button>
    </div>
  )
}
