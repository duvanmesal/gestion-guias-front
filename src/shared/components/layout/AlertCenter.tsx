"use client"

import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Check, Trash2, Inbox } from "lucide-react"

import {
  useAlertStore,
  useUnreadAlertCount,
  type OperationalAlertSeverity,
} from "@/app/stores/alert-store"

const SEVERITY_DOT: Record<OperationalAlertSeverity, string> = {
  info: "rgb(var(--color-primary))",
  success: "rgb(var(--color-success))",
  warning: "rgb(var(--color-warning))",
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return "ahora"
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  return `hace ${d} d`
}

export function AlertCenter() {
  const navigate = useNavigate()
  const alerts = useAlertStore((s) => s.alerts)
  const markRead = useAlertStore((s) => s.markRead)
  const markAllRead = useAlertStore((s) => s.markAllRead)
  const remove = useAlertStore((s) => s.remove)
  const clear = useAlertStore((s) => s.clear)
  const unread = useUnreadAlertCount()

  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)
  const [reduce, setReduce] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduce(mq.matches)
    const h = () => setReduce(mq.matches)
    mq.addEventListener?.("change", h)
    return () => mq.removeEventListener?.("change", h)
  }, [])

  const DURATION = reduce ? 0 : 240

  useEffect(() => {
    if (open) {
      if (closeTimer.current) clearTimeout(closeTimer.current)
      setMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
    } else {
      setShown(false)
      if (closeTimer.current) clearTimeout(closeTimer.current)
      closeTimer.current = setTimeout(() => setMounted(false), DURATION)
    }
  }, [open, DURATION])

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current) }, [])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [open])

  const handleVer = (id: string, route?: string | null) => {
    markRead(id)
    setOpen(false)
    if (route) navigate(route)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl transition-colors focus-ring"
        style={{
          color: "rgb(var(--color-fg))",
          background: open ? "rgba(var(--color-primary), 0.08)" : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!open)
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(var(--color-border), 0.05)"
        }}
        onMouseLeave={(e) => {
          if (!open) (e.currentTarget as HTMLButtonElement).style.background = "transparent"
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          unread > 0 ? `Alertas operativas, ${unread} sin leer` : "Alertas operativas"
        }
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
            style={{ background: "rgb(var(--color-danger))" }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {mounted && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden z-50"
          style={{
            background: "rgb(var(--color-bg-elevated))",
            border: "1px solid rgba(var(--color-border), 0.08)",
            boxShadow: "var(--shadow-lg)",
            transformOrigin: "top right",
            opacity: shown ? 1 : 0,
            transform: shown ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.95)",
            transition: `opacity ${DURATION}ms var(--ease-out-soft), transform ${DURATION}ms var(--ease-out-soft)`,
            willChange: "transform, opacity",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(var(--color-border), 0.06)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "rgb(var(--color-fg))" }}>
              Alertas
              {unread > 0 && (
                <span className="ml-2 text-xs font-medium" style={{ color: "rgb(var(--color-muted))" }}>
                  {unread} sin leer
                </span>
              )}
            </p>
            {alerts.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-medium px-2 py-1 rounded-md focus-ring transition-colors"
                  style={{ color: "rgb(var(--color-primary))" }}
                >
                  Marcar leídas
                </button>
                <button
                  type="button"
                  onClick={clear}
                  className="text-xs font-medium px-2 py-1 rounded-md focus-ring transition-colors"
                  style={{ color: "rgb(var(--color-muted))" }}
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>

          {/* List */}
          <div className="max-h-[26rem] overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Inbox className="w-8 h-8" style={{ color: "rgb(var(--color-muted))" }} />
                <p className="text-sm" style={{ color: "rgb(var(--color-muted))" }}>
                  No hay alertas recientes.
                </p>
              </div>
            ) : (
              alerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 px-4 py-3 transition-colors"
                  style={{
                    borderBottom: "1px solid rgba(var(--color-border), 0.04)",
                    background: a.read ? "transparent" : "rgba(var(--color-primary), 0.04)",
                  }}
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: SEVERITY_DOT[a.severity] }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: "rgb(var(--color-fg))" }}
                      >
                        {a.title}
                      </p>
                      {a.count > 1 && (
                        <span
                          className="shrink-0 rounded-full px-1.5 text-[10px] font-bold"
                          style={{
                            background: "rgba(var(--color-border), 0.12)",
                            color: "rgb(var(--color-muted))",
                          }}
                        >
                          ×{a.count}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs mt-0.5 line-clamp-2"
                      style={{ color: "rgb(var(--color-muted))" }}
                    >
                      {a.body}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[11px]" style={{ color: "rgb(var(--color-muted))" }}>
                        {formatRelative(a.lastReceivedAt)}
                      </span>
                      {a.route && (
                        <button
                          type="button"
                          onClick={() => handleVer(a.id, a.route)}
                          className="text-[11px] font-semibold focus-ring rounded"
                          style={{ color: "rgb(var(--color-primary))" }}
                        >
                          Ver
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    {!a.read && (
                      <button
                        type="button"
                        onClick={() => markRead(a.id)}
                        className="p-1 rounded-md focus-ring transition-colors"
                        style={{ color: "rgb(var(--color-muted))" }}
                        aria-label="Marcar como leída"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(a.id)}
                      className="p-1 rounded-md focus-ring transition-colors"
                      style={{ color: "rgb(var(--color-muted))" }}
                      aria-label="Eliminar alerta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
